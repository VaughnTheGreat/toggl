// Deletes the calling player's account: revokes Sign in with Apple (Apple requires this when an app
// offers account deletion), then deletes the auth user. The cloud save and stored Apple token are
// removed by ON DELETE CASCADE.
import { admin, callerFrom, corsHeaders, json } from '../_shared/common.ts';
import { revokeRefreshToken } from '../_shared/apple.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const user = await callerFrom(req);
  if (!user) return json({ error: 'Not signed in' }, 401);

  // Revoke with Apple first. A failure here must not leave the player unable to delete their data,
  // so it's logged and reported, and deletion continues.
  let appleRevoked = false;
  const { data: token } = await admin.from('apple_tokens').select('refresh_token').eq('user_id', user.id).maybeSingle();
  if (token?.refresh_token) {
    try {
      await revokeRefreshToken(token.refresh_token);
      appleRevoked = true;
    } catch (e) {
      console.error('Apple revocation failed for', user.id, e);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('deleteUser failed for', user.id, error);
    return json({ error: 'Could not delete the account' }, 500);
  }
  return json({ deleted: true, appleRevoked });
});
