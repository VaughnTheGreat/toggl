// Invite friends: codes, pending invites, redemption, and applying server-verified star grants.
// The server (supabase/migrations/*_referrals.sql) decides every reward; this module only asks,
// remembers, and credits grants by id. Everything it talks to is injected so it can be tested:
//   backend: { getMyReferralCode, redeemReferral, getReferralStatus }
//   kv:      { get, set, remove }              — async string storage (Preferences)
//   applyGrants(grants) → stars newly added     — storage.applyRewardGrants
//   isSignedIn() → boolean
export const INVITE_BASE_URL = 'https://toggl-game.pages.dev';
export const REFERRAL_REWARD = 150;
export const WELCOME_BONUS = 50;
export const MAX_REWARDED_FRIENDS = 3;
export const PENDING_KEY = 'toggl_pending_invite';
export const STATUS_KEY = 'toggl_referral_status';

const CODE_RE = /^[A-HJ-NP-Z2-9]{7}$/;

// "k7m-pq2x", " K7MPQ2X " → "K7MPQ2X"; anything else → null.
export function normalizeInviteCode(input) {
  const code = String(input ?? '').toUpperCase().replace(/[\s-]/g, '');
  return CODE_RE.test(code) ? code : null;
}

// https://toggl-game.pages.dev/i/K7MPQ2X (with or without trailing slash/query) → "K7MPQ2X".
export function inviteCodeFromUrl(url) {
  try {
    const m = new URL(url).pathname.match(/^\/i\/([^/]+)\/?$/);
    return m ? normalizeInviteCode(decodeURIComponent(m[1])) : null;
  } catch {
    return null;
  }
}

export const inviteLink = (code) => `${INVITE_BASE_URL}/i/${code}`;

export const inviteMessage = (code) =>
  `Try Toggl — a logic puzzle game. Use my invite link to join: ${inviteLink(code)}`;

// What the friend sees after trying to redeem. `stars` (optional) is shown as a star reward.
const REDEEM_MESSAGES = {
  redeemed: { kind: 'success', text: 'Invite accepted! Welcome bonus added.', stars: WELCOME_BONUS },
  already_redeemed: { kind: 'info', text: 'Your invite has already been applied.' },
  invalid_code: { kind: 'error', text: 'That invite code didn’t work. Check it with your friend and try again.' },
  own_code: { kind: 'error', text: 'That’s your own invite code. Share it with a friend instead!' },
  not_new_account: { kind: 'error', text: 'Invite codes only work when you first create your account.' },
  apple_sign_in_required: { kind: 'error', text: 'Sign in with Apple to use an invite code.' },
  apple_id_already_referred: { kind: 'error', text: 'An invite has already been used with this account.' },
};

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('Timed out'), { offline: true })), ms)),
]);

export function createReferrals({ backend, kv, applyGrants, isSignedIn, timeoutMs = 10000, log = console }) {
  const configured = !!backend;
  let state = {
    configured,
    pendingCode: null,          // invite code waiting for the friend's first sign-in
    code: null,                 // this player's own code (signed in only)
    rewardedFriends: 0,
    maxRewardedFriends: MAX_REWARDED_FRIENDS,
    redeemedInvite: false,
    notice: null,               // { kind: 'success' | 'info' | 'error', text, stars? }
    busy: false,
  };
  const listeners = new Set();
  const setState = (patch) => { state = { ...state, ...patch }; for (const fn of listeners) { try { fn(state); } catch { /* listener */ } } };

  const cacheStatus = async (s) => { try { await kv.set(STATUS_KEY, JSON.stringify(s)); } catch { /* best effort */ } };

  // At app start: only the pending invite (the account isn't known yet).
  const load = async () => {
    try {
      const pending = JSON.parse((await kv.get(PENDING_KEY)) || 'null');
      setState({ pendingCode: pending?.code || null });
    } catch (e) { log.warn?.('[invite] could not load saved state', e); }
    return state;
  };

  // Once signed in: last known progress, for display while offline. The cache always belongs to
  // the current account because every sign-out clears it (onSignedOut).
  const loadCachedStatus = async () => {
    if (state.code) return;
    try {
      const cached = JSON.parse((await kv.get(STATUS_KEY)) || 'null');
      if (cached) setState({ code: cached.code, rewardedFriends: cached.rewardedFriends, redeemedInvite: cached.redeemedInvite });
    } catch { /* ignore a corrupt cache */ }
  };

  const savePending = async (code) => {
    await kv.set(PENDING_KEY, JSON.stringify({ code, at: Date.now() }));
    setState({ pendingCode: code });
  };

  const clearPendingCode = async () => {
    try { await kv.remove(PENDING_KEY); } catch { /* best effort */ }
    setState({ pendingCode: null });
  };

  // Fetch the server's view, credit any grants we don't have yet, remember it for offline display.
  const refresh = async () => {
    if (!configured || !isSignedIn()) return state;
    try {
      const s = await withTimeout(backend.getReferralStatus(), timeoutMs);
      const grants = s.grants || [];
      const inviterAdded = applyGrants(grants.filter((g) => g.kind === 'referral_inviter'));
      applyGrants(grants.filter((g) => g.kind !== 'referral_inviter'));
      const summary = { code: s.code, rewardedFriends: s.rewarded_friends, redeemedInvite: s.redeemed_invite };
      setState({ ...summary, maxRewardedFriends: s.max_rewarded_friends || MAX_REWARDED_FRIENDS });
      await cacheStatus(summary);
      if (inviterAdded > 0 && !state.notice) {
        const text = inviterAdded > REFERRAL_REWARD ? 'Friends joined with your invite!' : 'A friend joined with your invite!';
        setState({ notice: { kind: 'success', text, stars: inviterAdded } });
      }
    } catch (e) { log.warn?.('[invite] status refresh failed', e); }
    return state;
  };

  // The friend just signed in: redeem a pending invite before their first cloud sync.
  const redeemPending = async () => {
    const code = state.pendingCode;
    if (!configured || !code || !isSignedIn()) return null;
    setState({ busy: true });
    try {
      const r = await withTimeout(backend.redeemReferral(code), timeoutMs);
      if ((r.status === 'redeemed' || r.status === 'already_redeemed') && r.grantId) {
        applyGrants([{ id: r.grantId, stars: r.stars }]);
      }
      setState({ notice: REDEEM_MESSAGES[r.status] || { kind: 'error', text: 'That invite couldn’t be applied. Please try again later.' } });
      await clearPendingCode();               // definite answer: never retry
      return r.status;
    } catch (e) {
      // Network trouble: keep the code and retry on the next launch (the server's 60-minute
      // new-account window decides whether it still counts).
      log.warn?.('[invite] redeem failed; will retry', e);
      setState({ notice: { kind: 'info', text: 'Your invite is saved. We’ll apply it as soon as you’re back online.' } });
      return null;
    } finally {
      setState({ busy: false });
    }
  };

  return {
    load,
    refresh,
    clearPendingCode,
    getState: () => state,
    onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    dismissNotice: () => setState({ notice: null }),

    // Typed into "Have an invite code?" (shown only while signed out).
    async enterCode(input) {
      const code = normalizeInviteCode(input);
      if (!code) return { ok: false, error: 'Invite codes are 7 letters and numbers.' };
      await savePending(code);                  // the card shows the saved code and what to do next
      return { ok: true, code };
    },

    // Opened an invite link. Signed out: remember it. Signed in: try now (only a brand-new account
    // can still redeem; the server decides).
    async receiveInviteLink(code) {
      const clean = normalizeInviteCode(code);
      if (!clean) return;
      await savePending(clean);                 // signed out: the card shows the saved code
      if (isSignedIn()) await redeemPending();
    },

    // This player's own code (created on the server on first use).
    async ensureCode() {
      if (!configured || !isSignedIn()) return null;
      if (state.code) return state.code;
      try {
        const code = await withTimeout(backend.getMyReferralCode(), timeoutMs);
        setState({ code });
        await cacheStatus({ code, rewardedFriends: state.rewardedFriends, redeemedInvite: state.redeemedInvite });
        return code;
      } catch (e) {
        log.warn?.('[invite] could not get invite code', e);
        // Offline with the code already known from the last visit: nothing to report.
        if (state.code) return state.code;
        setState({ notice: { kind: 'error', text: 'Couldn’t load your invite code. Check your connection and try again.' } });
        return null;
      }
    },

    // Sync-engine hooks.
    async onSignedIn() { await loadCachedStatus(); await redeemPending(); },
    async afterSync() { await refresh(); },
    async onSignedOut() {
      try { await kv.remove(STATUS_KEY); } catch { /* best effort */ }
      setState({ code: null, rewardedFriends: 0, redeemedInvite: false, notice: null });
    },
  };
}
