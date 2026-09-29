-- Toggl Account & Sync: one cloud save per player, plus Apple refresh tokens for revocation.

-- ---------------------------------------------------------------------------
-- game_saves: `save` is the exact logicgrid_save object from the app (format unchanged).
-- ---------------------------------------------------------------------------
create table if not exists public.game_saves (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  save        jsonb not null,
  revision    bigint not null default 1,        -- bumps on every accepted write
  reset_epoch bigint not null default 0,        -- bumps when the player resets progress
  updated_at  timestamptz not null default now(),
  updated_by  text,                             -- random per-install device id (diagnostics only)
  constraint game_saves_save_is_object check (jsonb_typeof(save) = 'object'),
  constraint game_saves_save_size check (pg_column_size(save) < 262144)
);

alter table public.game_saves enable row level security;

-- Players can read only their own save. There are deliberately no insert/update/delete
-- policies: every write goes through push_save below, so the revision check can't be skipped.
drop policy if exists "Players read their own save" on public.game_saves;
create policy "Players read their own save"
  on public.game_saves for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.game_saves from anon;
revoke insert, update, delete on public.game_saves from authenticated;
grant select on public.game_saves to authenticated;

-- ---------------------------------------------------------------------------
-- push_save: atomic compare-and-swap for the caller's own save.
--   * No row yet            → insert it.
--   * Newer reset_epoch     → accept (a reset always wins).
--   * Same epoch and the caller's base revision is current → accept.
--   * Otherwise             → reject and return the current row so the app can merge and retry.
-- ---------------------------------------------------------------------------
create or replace function public.push_save(
  p_save          jsonb,
  p_base_revision bigint,
  p_reset_epoch   bigint,
  p_device        text default null
)
returns table (accepted boolean, revision bigint, reset_epoch bigint, save jsonb, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  cur public.game_saves%rowtype;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_save is null or jsonb_typeof(p_save) <> 'object' then
    raise exception 'save must be a JSON object' using errcode = '22023';
  end if;

  select * into cur from public.game_saves g where g.user_id = uid for update;

  if not found then
    insert into public.game_saves as g (user_id, save, revision, reset_epoch, updated_by)
    values (uid, p_save, 1, greatest(coalesce(p_reset_epoch, 0), 0), p_device)
    on conflict (user_id) do nothing
    returning g.* into cur;
    if found then
      return query select true, cur.revision, cur.reset_epoch, cur.save, cur.updated_at;
      return;
    end if;
    -- Another device inserted first: report its row so the caller merges.
    select * into cur from public.game_saves g where g.user_id = uid;
    return query select false, cur.revision, cur.reset_epoch, cur.save, cur.updated_at;
    return;
  end if;

  if p_reset_epoch > cur.reset_epoch
     or (p_reset_epoch = cur.reset_epoch and p_base_revision = cur.revision) then
    update public.game_saves g
       set save = p_save,
           revision = cur.revision + 1,
           reset_epoch = greatest(p_reset_epoch, cur.reset_epoch),
           updated_at = now(),
           updated_by = p_device
     where g.user_id = uid
    returning g.* into cur;
    return query select true, cur.revision, cur.reset_epoch, cur.save, cur.updated_at;
    return;
  end if;

  return query select false, cur.revision, cur.reset_epoch, cur.save, cur.updated_at;
end;
$$;

revoke all on function public.push_save(jsonb, bigint, bigint, text) from public, anon;
grant execute on function public.push_save(jsonb, bigint, bigint, text) to authenticated;

-- ---------------------------------------------------------------------------
-- apple_tokens: Apple refresh tokens, needed to revoke Sign in with Apple when a player deletes
-- their account. Only Edge Functions (service role) can touch this table.
-- ---------------------------------------------------------------------------
create table if not exists public.apple_tokens (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  created_at    timestamptz not null default now()
);

alter table public.apple_tokens enable row level security;
revoke all on public.apple_tokens from anon, authenticated;
