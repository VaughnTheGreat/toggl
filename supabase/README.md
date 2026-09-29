# Toggl cloud backend (Account & Sync)

Optional Sign in with Apple + cloud save sync for the iOS app. The game never waits on this: it always
plays from the local save, and sync reconciles in the background (see `src/lib/cloud/`).

## What's here

| Path | Purpose |
|---|---|
| `migrations/20260929120000_account_sync.sql` | `game_saves` table (one row per player, `save` = the exact `logicgrid_save` JSON), `push_save` compare-and-swap function, `apple_tokens` table, row-level security |
| `functions/apple-exchange` | Called after sign-in: swaps Apple's authorization code for a refresh token and stores it |
| `functions/delete-account` | Revokes Sign in with Apple, then deletes the user (cascade removes save + token) |
| `functions/_shared` | Apple client-secret signing and shared helpers |

## One-time setup

1. **Supabase project** — create it, then link this folder: `supabase link --project-ref <ref>`.
2. **Database** — `supabase db push` (applies the migration).
3. **Apple provider** — Dashboard → Authentication → Providers → Apple: enable, and add
   `com.base6a5ee3e55b797137eb42e644.app` under *Client IDs*. (A Services ID / secret is only needed
   for web sign-in, which isn't enabled.)
4. **Apple Developer** — enable *Sign in with Apple* on the App ID, and create a **Key** with
   *Sign in with Apple* enabled. Note its Key ID and download the `.p8` (downloadable once).
5. **Function secrets**
   ```sh
   supabase secrets set APPLE_TEAM_ID=3FKM6258J6 \
     APPLE_CLIENT_ID=com.base6a5ee3e55b797137eb42e644.app \
     APPLE_KEY_ID=<key id> \
     APPLE_PRIVATE_KEY="$(cat AuthKey_<key id>.p8)"
   ```
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.
6. **Deploy functions** — `supabase functions deploy apple-exchange` and `supabase functions deploy delete-account`.
7. **App build settings** — create `.env.local` in the repo root (git-ignored):
   ```sh
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable (anon) key>
   ```
   Both are public by design (row-level security protects the data). Then
   `npm run build && npx cap sync ios`. Without them the app runs normally and the card says sync
   isn't set up.

Never commit the `.p8` key or the service-role key.
