// The app's single sync engine, wired to Supabase, native Preferences and the local save.
// Loaded only on native (see ./index.js), so the web build never pulls in Supabase.
import { Preferences } from '@capacitor/preferences';
import { saveStore } from '@/lib/game/persist';
import { createSyncEngine } from './syncEngine';
import { createSupabaseBackend } from './supabaseBackend';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const kv = {
  get: async (k) => (await Preferences.get({ key: k })).value,
  set: (k, value) => Preferences.set({ key: k, value }),
  remove: (k) => Preferences.remove({ key: k }),
};

// Without Supabase settings the engine runs unconfigured: the card explains sync isn't set up.
export const cloud = createSyncEngine({
  backend: url && key ? createSupabaseBackend({ url, key }) : null,
  saves: saveStore,
  kv,
});

let started = null;
export function startCloudSync() {
  if (!started) {
    started = cloud.start();
    const syncSoon = () => cloud.requestSync(0);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncSoon(); });
    window.addEventListener('online', syncSoon);
  }
  return started;
}
