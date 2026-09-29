// Called by the app right after Sign in with Apple. Exchanges Apple's one-time authorization code
// (valid ~5 minutes) for a refresh token and stores it, so the account can later be revoked with
// Apple when the player deletes it.
import { admin, callerFrom, corsHeaders, json } from '../_shared/common.ts';
import { exchangeAuthorizationCode } from '../_shared/apple.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const user = await callerFrom(req);
  if (!user) return json({ error: 'Not signed in' }, 401);

  let code: unknown;
  try { ({ authorizationCode: code } = await req.json()); } catch { /* handled below */ }
  if (typeof code !== 'string' || !code) return json({ error: 'authorizationCode is required' }, 400);

  try {
    const refreshToken = await exchangeAuthorizationCode(code);
    if (!refreshToken) return json({ stored: false });
    const { error } = await admin.from('apple_tokens').upsert({ user_id: user.id, refresh_token: refreshToken });
    if (error) throw error;
    return json({ stored: true });
  } catch (e) {
    console.error('apple-exchange failed', e);
    return json({ error: 'Could not exchange the Apple authorization code' }, 502);
  }
});
