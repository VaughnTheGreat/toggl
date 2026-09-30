// The app's single sync engine (and invite-friends controller), wired to Supabase, native
// Preferences and the local save. Loaded only on native (see ./index.js), so the web build never
// pulls in Supabase.
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { saveStore } from '@/lib/game/persist';
import { applyRewardGrants } from '@/lib/game/storage';
import { createSyncEngine } from './syncEngine';
import { createSupabaseBackend } from './supabaseBackend';
import { createReferrals, inviteCodeFromUrl } from './referrals';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const kv = {
  get: async (k) => (await Preferences.get({ key: k })).value,
  set: (k, value) => Preferences.set({ key: k, value }),
  remove: (k) => Preferences.remove({ key: k }),
};

// Without Supabase settings everything runs unconfigured: the cards explain sync isn't set up.
const backend = url && key ? createSupabaseBackend({ url, key }) : null;

export const referrals = createReferrals({
  backend,
  kv,
  applyGrants: applyRewardGrants,
  isSignedIn: () => cloud.getState().signedIn,
});

export const cloud = createSyncEngine({
  backend,
  saves: saveStore,
  kv,
  hooks: {
    onSignedIn: () => referrals.onSignedIn(),
    afterSync: () => referrals.afterSync(),
    onSignedOut: () => referrals.onSignedOut(),
  },
});

// An invite link (https://toggl-game.pages.dev/i/CODE) opened Toggl: remember the code and show
// the Invite Friends card, where the result appears.
async function handleOpenedUrl(openedUrl) {
  const code = inviteCodeFromUrl(openedUrl);
  if (!code) return;
  await referrals.receiveInviteLink(code);
  if (window.location.pathname !== '/profile') {
    window.history.pushState({}, '', '/profile');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

let started = null;
export function startCloudSync() {
  if (!started) {
    started = referrals.load().then(() => cloud.start());
    const syncSoon = () => cloud.requestSync(0);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncSoon(); });
    window.addEventListener('online', syncSoon);
    // Invite links. If the native App plugin is missing (e.g. a native build that wasn't re-synced),
    // links simply don't open the invite flow; nothing else is affected.
    try {
      Promise.resolve(App.addListener('appUrlOpen', ({ url: openedUrl }) => { handleOpenedUrl(openedUrl); }))
        .catch((e) => console.warn('[invite] invite links unavailable', e));
    } catch (e) {
      console.warn('[invite] invite links unavailable', e);
    }
    // A link that launched the app from scratch.
    started.then(() => App.getLaunchUrl()).then((r) => r?.url && handleOpenedUrl(r.url)).catch(() => {});
  }
  return started;
}
