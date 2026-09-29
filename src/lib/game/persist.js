// Where the save lives. The save format is unchanged: one JSON string under "logicgrid_save".
//
// Native app (Capacitor): kept in Preferences (iOS UserDefaults), which the OS doesn't purge the
// way it can purge WebView storage. During the transition localStorage is still written first,
// synchronously, on every save — so it is always the freshest copy, older builds still see the
// player's progress, and a Preferences write interrupted by the app being killed loses nothing.
// Preferences takes over only when localStorage has no usable save (e.g. iOS cleared it).
//
// Web: localStorage only, exactly as before.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export const SAVE_KEY = 'logicgrid_save';
export const CORRUPT_BACKUP_KEY = 'logicgrid_save_corrupt_backup';
export const MIGRATED_AT_KEY = 'logicgrid_save_migrated_at';

export function isValidSave(raw) {
  if (typeof raw !== 'string') return false;
  try {
    const v = JSON.parse(raw);
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  } catch {
    return false;
  }
}

// Unreadable data that isn't simply empty — kept aside instead of being overwritten.
const isCorrupt = (raw) => raw != null && raw !== 'null' && !isValidSave(raw);

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)),
]);

export function createSaveStore({ local, prefs, native, timeoutMs = 1500, log = console }) {
  let cache;              // raw JSON string or null; parsed fresh on every read, like localStorage was
  let queued;             // latest value waiting to go to Preferences
  let inFlight = null;

  const localGet = () => { try { return local.getItem(SAVE_KEY); } catch { return null; } };
  const localSet = (key, raw) => {
    try {
      local.setItem(key, raw);
    } catch (e) {
      // Native: never leave a stale localStorage copy behind — it would win over the newer
      // Preferences copy at next launch. Web: keep the last good copy (it's the only one).
      if (native && key === SAVE_KEY) { try { local.removeItem(SAVE_KEY); } catch { /* unavailable */ } }
      log.warn?.('[save] localStorage write failed', e);
    }
  };

  // Writes go out in order, and a burst of saves collapses to the latest one.
  const pushToPrefs = (raw) => {
    queued = raw;
    if (!inFlight) {
      inFlight = (async () => {
        while (queued !== undefined) {
          const value = queued;
          queued = undefined;
          try { await prefs.set({ key: SAVE_KEY, value }); } catch (e) { log.warn?.('[save] Preferences write failed', e); }
        }
        inFlight = null;
      })();
    }
    return inFlight;
  };

  const read = () => {
    if (cache === undefined) cache = localGet();
    return cache;
  };

  const write = (raw) => {
    cache = raw;
    localSet(SAVE_KEY, raw);
    if (native) pushToPrefs(raw);
  };

  // Web: another tab saved — pick it up, as the old read-through-localStorage code did.
  const onStorageEvent = (e) => {
    if (e.key === SAVE_KEY || e.key === null) cache = e.newValue ?? null;
  };

  // Call once before the app renders. Never rejects; returns what it did (for diagnostics/tests).
  const init = async () => {
    const lsRaw = localGet();
    if (!native) { cache = lsRaw; return { source: 'localStorage', native: false }; }

    let prefsRaw = null;
    try {
      prefsRaw = (await withTimeout(prefs.get({ key: SAVE_KEY }), timeoutMs))?.value ?? null;
    } catch (e) {
      log.warn?.('[save] Preferences unavailable, using localStorage', e);
      cache = lsRaw;
      return { source: 'localStorage', native: true, prefsError: true };
    }

    const lsOk = isValidSave(lsRaw);
    const prefsOk = isValidSave(prefsRaw);

    for (const [where, raw] of [['localStorage', lsRaw], ['preferences', prefsRaw]]) {
      if (!isCorrupt(raw)) continue;
      const backup = JSON.stringify({ from: where, at: new Date().toISOString(), raw });
      try { await withTimeout(prefs.set({ key: CORRUPT_BACKUP_KEY, value: backup }), timeoutMs); } catch { /* best effort */ }
      localSet(CORRUPT_BACKUP_KEY, backup);
    }

    if (!lsOk && !prefsOk) {
      // Nothing usable: same as before — the game starts from an empty save, and the
      // unreadable data (already backed up above) is left in place until the first write.
      cache = lsRaw ?? prefsRaw ?? null;
      return { source: 'none', native: true };
    }

    const chosen = lsOk ? lsRaw : prefsRaw;
    const source = lsOk ? 'localStorage' : 'preferences';
    cache = chosen;

    let migrated = false;
    if (prefsRaw !== chosen) {
      try {
        await withTimeout(pushToPrefs(chosen), timeoutMs);
        const back = (await withTimeout(prefs.get({ key: SAVE_KEY }), timeoutMs))?.value;
        if (back === chosen && !prefsOk) {
          migrated = true;
          await withTimeout(prefs.set({ key: MIGRATED_AT_KEY, value: new Date().toISOString() }), timeoutMs).catch(() => {});
        } else if (back !== chosen) {
          log.warn?.('[save] Preferences copy did not verify; localStorage copy kept');
        }
      } catch (e) {
        log.warn?.('[save] could not copy save to Preferences; localStorage copy kept', e);
      }
    }
    if (lsRaw !== chosen) localSet(SAVE_KEY, chosen);

    return { source, native: true, migrated };
  };

  // Resolves once every queued Preferences write has finished.
  const flush = () => inFlight || Promise.resolve();

  return { init, read, write, flush, onStorageEvent };
}

const hasWindow = typeof window !== 'undefined';

// Looked up on each call so a browser that blocks storage throws inside the try blocks above.
const lazyLocalStorage = {
  getItem: (k) => window.localStorage.getItem(k),
  setItem: (k, v) => window.localStorage.setItem(k, v),
  removeItem: (k) => window.localStorage.removeItem(k),
};

export const saveStore = createSaveStore({
  local: lazyLocalStorage,
  prefs: Preferences,
  native: Capacitor.isNativePlatform(),
});

if (hasWindow) window.addEventListener('storage', saveStore.onStorageEvent);
