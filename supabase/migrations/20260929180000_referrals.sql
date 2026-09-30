-- Toggl referrals: invite friends, server-verified star rewards.
--   * Inviter: 150 stars per successful referral, at most 3 (450 stars).
--   * Friend: 50 stars welcome bonus for a valid redemption.
--   * A redemption only counts when the friend signs in with Apple on a brand-new account
--     (first session, created within the last 60 minutes). Sharing or opening a link earns nothing.
--   * Players never write these tables directly; everything goes through the functions below.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Secret salt for Apple-ID fingerprints. The private schema is not exposed through the API.
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;

create table if not exists private.referral_settings (
  id         int primary key default 1 check (id = 1),
  apple_salt bytea not null
);
insert into private.referral_settings (apple_salt)
values (extensions.gen_random_bytes(32))
on conflict (id) do nothing;
revoke all on private.referral_settings from public;

-- Salted SHA-256 of the Apple subject: lets us refuse a second referral for the same Apple ID
-- (even after account deletion) without storing the Apple ID itself.
create or replace function private.referral_apple_hash(p_apple_sub text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select encode(extensions.digest(s.apple_salt || convert_to(p_apple_sub, 'UTF8'), 'sha256'), 'hex')
  from private.referral_settings s
  where s.id = 1
$$;
revoke all on function private.referral_apple_hash(text) from public;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
-- One permanent code per signed-in player, created on first request.
create table if not exists public.referral_codes (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  code       text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{7}$'),   -- no 0/O/1/I
  created_at timestamptz not null default now()
);

-- One row per successful redemption. Rows are permanent anti-abuse records: deleting either
-- account only clears its link, so the friend's Apple ID can never be referred twice.
create table if not exists public.referrals (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null,
  inviter_id         uuid references auth.users (id) on delete set null,
  invitee_id         uuid unique references auth.users (id) on delete set null,
  invitee_apple_hash text not null unique,
  inviter_rewarded   boolean not null,              -- false once the inviter already had 3
  created_at         timestamptz not null default now(),
  constraint referrals_not_self check (inviter_id is null or invitee_id is null or inviter_id <> invitee_id)
);
create index if not exists referrals_inviter_id_idx on public.referrals (inviter_id);

-- Star grants: the only thing the app ever credits. The grant id is the idempotency key.
create table if not exists public.reward_grants (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  referral_id uuid not null references public.referrals (id) on delete cascade,
  kind        text not null check (kind in ('referral_inviter', 'referral_invitee')),
  stars       int  not null,
  created_at  timestamptz not null default now(),
  constraint reward_grants_one_per_kind unique (referral_id, kind),
  constraint reward_grants_amount check (
    (kind = 'referral_inviter' and stars = 150) or (kind = 'referral_invitee' and stars = 50)
  )
);
create index if not exists reward_grants_user_id_idx on public.reward_grants (user_id);

-- Row-level security with no policies: players cannot read or write these tables directly.
alter table public.referral_codes enable row level security;
alter table public.referrals      enable row level security;
alter table public.reward_grants  enable row level security;
revoke all on public.referral_codes, public.referrals, public.reward_grants from anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_my_referral_code: the caller's code, created on first call.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_referral_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid      uuid := auth.uid();
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   -- 32 symbols: no modulo bias
  v_code   text;
  attempt  int;
  i        int;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select c.code into v_code from public.referral_codes c where c.user_id = uid;
  if found then
    return v_code;
  end if;

  for attempt in 1..10 loop
    v_code := '';
    for i in 1..7 loop
      v_code := v_code || substr(alphabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % 32), 1);
    end loop;
    begin
      insert into public.referral_codes (user_id, code) values (uid, v_code);
      return v_code;
    exception when unique_violation then
      -- Either the code collided, or a concurrent call already created this player's code.
      select c.code into v_code from public.referral_codes c where c.user_id = uid;
      if found then
        return v_code;
      end if;
    end;
  end loop;
  raise exception 'could not allocate a referral code';
end;
$$;

-- ---------------------------------------------------------------------------
-- redeem_referral: called by the friend right after their first sign-in.
-- Refusals are reported as a status (not raised) so the app can explain them.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_referral(p_code text)
returns table (status text, grant_id uuid, stars int)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  uid          uuid := auth.uid();
  v_code       text := upper(btrim(coalesce(p_code, '')));
  v_inviter    uuid;
  v_apple_sub  text;
  v_created    timestamptz;
  v_hash       text;
  v_rewarded   int;
  v_ref_id     uuid;
  v_grant      uuid;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Retry of a redemption that already succeeded: return the same welcome grant.
  select r.id into v_ref_id from public.referrals r where r.invitee_id = uid;
  if found then
    return query select 'already_redeemed'::text, g.id, g.stars
      from public.reward_grants g where g.referral_id = v_ref_id and g.kind = 'referral_invitee';
    return;
  end if;

  select i.provider_id into v_apple_sub
    from auth.identities i
   where i.user_id = uid and i.provider = 'apple'
   order by i.created_at
   limit 1;
  if v_apple_sub is null then
    return query select 'apple_sign_in_required'::text, null::uuid, 0;
    return;
  end if;

  select c.user_id into v_inviter from public.referral_codes c where c.code = v_code;
  if v_inviter is null then
    return query select 'invalid_code'::text, null::uuid, 0;
    return;
  end if;
  if v_inviter = uid then
    return query select 'own_code'::text, null::uuid, 0;
    return;
  end if;

  select u.created_at into v_created from auth.users u where u.id = uid;
  if v_created is null or v_created < now() - interval '60 minutes' then
    return query select 'not_new_account'::text, null::uuid, 0;
    return;
  end if;

  v_hash := private.referral_apple_hash(v_apple_sub);
  if exists (select 1 from public.referrals r where r.invitee_apple_hash = v_hash) then
    return query select 'apple_id_already_referred'::text, null::uuid, 0;
    return;
  end if;

  -- Serialise redemptions for this inviter so the cap of 3 holds under concurrency.
  perform 1 from public.referral_codes c where c.user_id = v_inviter for update;
  select count(*) into v_rewarded
    from public.reward_grants g
   where g.user_id = v_inviter and g.kind = 'referral_inviter';

  begin
    insert into public.referrals (code, inviter_id, invitee_id, invitee_apple_hash, inviter_rewarded)
    values (v_code, v_inviter, uid, v_hash, v_rewarded < 3)
    returning id into v_ref_id;
  exception when unique_violation then
    -- A concurrent redemption by this account (or this Apple ID) won the race.
    select r.id into v_ref_id from public.referrals r where r.invitee_id = uid;
    if found then
      return query select 'already_redeemed'::text, g.id, g.stars
        from public.reward_grants g where g.referral_id = v_ref_id and g.kind = 'referral_invitee';
      return;
    end if;
    return query select 'apple_id_already_referred'::text, null::uuid, 0;
    return;
  end;

  insert into public.reward_grants (user_id, referral_id, kind, stars)
  values (uid, v_ref_id, 'referral_invitee', 50)
  returning id into v_grant;

  if v_rewarded < 3 then
    insert into public.reward_grants (user_id, referral_id, kind, stars)
    values (v_inviter, v_ref_id, 'referral_inviter', 150);
  end if;

  return query select 'redeemed'::text, v_grant, 50;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_my_referral_status: everything the app needs, for both roles.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_referral_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  return jsonb_build_object(
    'code', (select c.code from public.referral_codes c where c.user_id = uid),
    'rewarded_friends', (select count(*) from public.reward_grants g where g.user_id = uid and g.kind = 'referral_inviter'),
    'max_rewarded_friends', 3,
    'redeemed_invite', exists (select 1 from public.referrals r where r.invitee_id = uid),
    'grants', coalesce(
      (select jsonb_agg(jsonb_build_object('id', g.id, 'kind', g.kind, 'stars', g.stars) order by g.created_at)
         from public.reward_grants g where g.user_id = uid),
      '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_my_referral_code() from public, anon;
revoke all on function public.redeem_referral(text) from public, anon;
revoke all on function public.get_my_referral_status() from public, anon;
grant execute on function public.get_my_referral_code() to authenticated;
grant execute on function public.redeem_referral(text) to authenticated;
grant execute on function public.get_my_referral_status() to authenticated;
