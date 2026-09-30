// The sync engine's backend, implemented with Supabase (auth + one table + one RPC + two Edge Functions).
// See supabase/migrations for the schema and supabase/functions for the server side.
import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';
import { authorizeWithApple, getAppleCredentialState } from './appleAuth';

// Keeps the Supabase session in native storage alongside the save (not in WebView localStorage).
const sessionStorage = {
  getItem: async (key) => (await Preferences.get({ key })).value,
  setItem: (key, value) => Preferences.set({ key, value }),
  removeItem: (key) => Preferences.remove({ key }),
};

function toRow(r) {
  return r && { save: r.save, revision: Number(r.revision), resetEpoch: Number(r.reset_epoch), updatedAt: r.updated_at };
}

function fail(error, what) {
  const e = new Error(`${what}: ${error?.message || error}`);
  e.cause = error;
  throw e;
}

export function createSupabaseBackend({ url, key }) {
  const supabase = createClient(url, key, {
    auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });

  return {
    async getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;                   // e.g. offline while refreshing an expired token
      return data.session ? { userId: data.session.user.id } : null;
    },

    async signInWithApple() {
      const apple = await authorizeWithApple();
      const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: apple.identityToken, nonce: apple.rawNonce });
      if (error) fail(error, 'Supabase sign-in failed');
      // Store Apple's refresh token server-side so the account can be revoked with Apple on deletion.
      // Not fatal if it fails: deletion still works, it just can't revoke with Apple.
      if (apple.authorizationCode) {
        const { error: exchangeError } = await supabase.functions.invoke('apple-exchange', { body: { authorizationCode: apple.authorizationCode } });
        if (exchangeError) console.warn('[sync] apple-exchange failed', exchangeError);
      }
      return { userId: data.user.id, appleUserId: apple.user };
    },

    async signOut() {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) fail(error, 'Sign-out failed');
    },

    async pull() {
      const { data, error } = await supabase.from('game_saves').select('save, revision, reset_epoch, updated_at').maybeSingle();
      if (error) fail(error, 'Could not read cloud save');
      return toRow(data);
    },

    async push({ save, baseRevision, resetEpoch, deviceId }) {
      const { data, error } = await supabase.rpc('push_save', {
        p_save: save, p_base_revision: baseRevision, p_reset_epoch: resetEpoch, p_device: deviceId,
      });
      if (error) fail(error, 'Could not write cloud save');
      const row = Array.isArray(data) ? data[0] : data;
      return { accepted: !!row.accepted, ...toRow(row) };
    },

    async deleteAccount() {
      const { error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) fail(error, 'Could not delete account');
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    },

    checkAppleCredential: (appleUserId) => getAppleCredentialState(appleUserId),

    // Referrals (see supabase/migrations/*_referrals.sql). The server decides every reward.
    async getMyReferralCode() {
      const { data, error } = await supabase.rpc('get_my_referral_code');
      if (error) fail(error, 'Could not get invite code');
      return data;
    },

    async redeemReferral(code) {
      const { data, error } = await supabase.rpc('redeem_referral', { p_code: code });
      if (error) fail(error, 'Could not apply invite');
      const row = Array.isArray(data) ? data[0] : data;
      return { status: row?.status, grantId: row?.grant_id ?? null, stars: Number(row?.stars) || 0 };
    },

    async getReferralStatus() {
      const { data, error } = await supabase.rpc('get_my_referral_status');
      if (error) fail(error, 'Could not load invite status');
      return data;
    },
  };
}
