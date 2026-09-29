// Sign in with Apple server calls: exchange an authorization code for a refresh token, and revoke
// tokens when a player deletes their account (required by Apple for apps that offer deletion).
// Secrets (set with `supabase secrets set`): APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CLIENT_ID.
import { importPKCS8, SignJWT } from 'npm:jose@5.9.6';

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret ${name}`);
  return value;
}

// Short-lived ES256 client secret signed with the .p8 key (Apple allows up to 6 months; we use 5 minutes).
async function clientSecret(): Promise<string> {
  const pem = env('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const key = await importPKCS8(pem, 'ES256');
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: env('APPLE_KEY_ID') })
    .setIssuer(env('APPLE_TEAM_ID'))
    .setSubject(env('APPLE_CLIENT_ID'))
    .setAudience('https://appleid.apple.com')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(key);
}

async function post(path: string, fields: Record<string, string>): Promise<Response> {
  return fetch(`https://appleid.apple.com${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
}

export async function exchangeAuthorizationCode(code: string): Promise<string | null> {
  const res = await post('/auth/token', {
    client_id: env('APPLE_CLIENT_ID'),
    client_secret: await clientSecret(),
    code,
    grant_type: 'authorization_code',
  });
  if (!res.ok) throw new Error(`Apple token exchange failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.refresh_token ?? null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const res = await post('/auth/revoke', {
    client_id: env('APPLE_CLIENT_ID'),
    client_secret: await clientSecret(),
    token,
    token_type_hint: 'refresh_token',
  });
  if (!res.ok) throw new Error(`Apple token revocation failed (${res.status}): ${await res.text()}`);
}
