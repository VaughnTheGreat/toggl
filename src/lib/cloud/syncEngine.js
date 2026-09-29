// Cloud sync engine. Offline-first: the game only ever reads and writes the local save; this
// engine reconciles that save with the cloud copy in the background.
//
// Everything it talks to is injected, so it can be tested without a network or a device:
//   backend: { getSession, signInWithApple, signOut, pull, push, deleteAccount, checkAppleCredential }
//   saves:   { read, write, subscribe }          — the local save store (raw JSON strings)
//   kv:      { get(key), set(key, value), remove(key) } — async string storage for sync metadata
//
// Sync bookkeeping lives under its own keys and never inside logicgrid_save (format unchanged).
import { mergeSaves, sameSave } from './mergeSaves';

export const META_KEY = 'logicgrid_sync_meta';
export const BACKUP_KEY = 'logicgrid_sync_backup';
const MAX_BACKUPS = 5;
const MAX_ATTEMPTS = 4;

const parse = (raw) => { try { const v = JSON.parse(raw); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch { return {}; } };

export function isOfflineError(e) {
  if (e?.offline) return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  // Covers WebKit ("Load failed"), Chromium ("Failed to fetch"), and supabase-js wrappers
  // (AuthRetryableFetchError, FunctionsFetchError: "Failed to send a request to the Edge Function").
  const text = `${e?.name} ${e?.message} ${e?.cause?.name} ${e?.cause?.message}`;
  return /network|fetch|load failed|offline|timed? ?out|internet|send a request/i.test(text);
}

const randomId = () => {
  const a = new Uint8Array(16);
  (globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.floor(Math.random() * 256); }));
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export function createSyncEngine({ backend, saves, kv, now = () => Date.now(), debounceMs = 3000, log = console }) {
  const configured = !!backend;
  let state = { configured, ready: false, signedIn: false, status: 'idle', lastSyncedAt: null, error: null, busy: null };
  const listeners = new Set();
  const setState = (patch) => { state = { ...state, ...patch }; for (const fn of listeners) { try { fn(state); } catch { /* listener */ } } };

  let meta = null;            // { deviceId, users: { [userId]: { baseRevision, baseSave, resetEpoch, lastSyncedAt, dirty, pendingReset, appleUserId } } }
  let userId = null;
  let applyingRemote = false; // our own writes to the local save must not schedule another sync
  let timer = null;
  let running = null;
  let rerun = false;

  const loadMeta = async () => {
    try { storedMeta = await kv.get(META_KEY); meta = JSON.parse(storedMeta || 'null'); } catch { meta = null; storedMeta = null; }
    if (!meta || typeof meta !== 'object') meta = {};
    if (!meta.deviceId) meta.deviceId = randomId();
    if (!meta.users || typeof meta.users !== 'object') meta.users = {};
  };
  let storedMeta = null;      // last value written, so unchanged metadata is never rewritten
  const saveMeta = async () => {
    const value = JSON.stringify(meta);
    if (value === storedMeta) return;
    try { await kv.set(META_KEY, value); storedMeta = value; } catch (e) { log.warn?.('[sync] could not store sync metadata', e); }
  };
  const userMeta = () => {
    if (!meta.users[userId]) meta.users[userId] = { baseRevision: 0, baseSave: null, resetEpoch: 0, lastSyncedAt: null, dirty: true, pendingReset: false };
    return meta.users[userId];
  };

  const backup = async (reason, local, cloud) => {
    try {
      const list = JSON.parse((await kv.get(BACKUP_KEY)) || '[]');
      list.unshift({ at: new Date(now()).toISOString(), reason, userId, local, cloud });
      await kv.set(BACKUP_KEY, JSON.stringify(list.slice(0, MAX_BACKUPS)));
    } catch (e) { log.warn?.('[sync] backup failed', e); }
  };

  const writeLocal = (save) => {
    applyingRemote = true;
    try { saves.write(JSON.stringify(save)); } finally { applyingRemote = false; }
  };

  // The cloud now holds `synced` (row). Apply it locally without losing anything played meanwhile.
  const commit = async (startLocal, synced, row) => {
    const m = userMeta();
    const current = parse(saves.read());
    let finalLocal = synced, dirty = false;
    if (!sameSave(current, startLocal)) {       // the player kept playing while we synced
      finalLocal = mergeSaves(startLocal, current, synced);
      dirty = true;
    }
    if (!sameSave(finalLocal, current)) writeLocal(finalLocal);
    Object.assign(m, { baseSave: JSON.stringify(synced), baseRevision: row.revision, resetEpoch: row.resetEpoch,
      lastSyncedAt: now(), dirty, pendingReset: false });
    await saveMeta();
    return dirty;
  };

  const syncOnce = async () => {
    const m = userMeta();
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const local = parse(saves.read());
      const cloud = await backend.pull();

      if (m.pendingReset) {                     // this device reset progress: make that the cloud save too
        const epoch = Math.max(m.resetEpoch, cloud?.resetEpoch ?? 0) + 1;
        const res = await backend.push({ save: local, baseRevision: cloud?.revision ?? 0, resetEpoch: epoch, deviceId: meta.deviceId });
        if (res.accepted) return commit(local, local, res);
        continue;
      }
      if (!cloud) {                             // first save for this account
        const res = await backend.push({ save: local, baseRevision: 0, resetEpoch: m.resetEpoch, deviceId: meta.deviceId });
        if (res.accepted) return commit(local, local, res);
        continue;
      }
      if (cloud.resetEpoch > m.resetEpoch) {    // another device reset progress: adopt it wholesale
        await backup('reset-on-another-device', local, cloud.save);
        return commit(local, cloud.save, cloud);
      }
      if (cloud.resetEpoch < m.resetEpoch) m.resetEpoch = cloud.resetEpoch;

      const base = m.baseSave ? parse(m.baseSave) : null;
      if (m.baseSave && cloud.revision === m.baseRevision) {   // cloud unchanged since our last sync
        if (sameSave(local, base)) return commit(local, base, cloud);
        const res = await backend.push({ save: local, baseRevision: cloud.revision, resetEpoch: cloud.resetEpoch, deviceId: meta.deviceId });
        if (res.accepted) return commit(local, local, res);
        continue;
      }
      if (sameSave(local, cloud.save)) return commit(local, cloud.save, cloud);

      await backup(m.baseSave ? 'merge' : 'first-sign-in', local, cloud.save);
      const merged = mergeSaves(base, local, cloud.save);
      if (sameSave(merged, cloud.save)) return commit(local, cloud.save, cloud);
      const res = await backend.push({ save: merged, baseRevision: cloud.revision, resetEpoch: cloud.resetEpoch, deviceId: meta.deviceId });
      if (res.accepted) return commit(local, merged, res);
      // Someone else wrote first: loop, re-read, and merge against their version.
    }
    throw new Error('Cloud save kept changing; will retry later');
  };

  const runSync = () => {
    if (!state.signedIn) return Promise.resolve();
    if (running) { rerun = true; return running; }
    running = (async () => {
      do {
        rerun = false;
        setState({ status: 'syncing', error: null });
        try {
          const dirty = await syncOnce();
          setState({ status: 'synced', lastSyncedAt: userMeta().lastSyncedAt, error: null });
          if (dirty) rerun = true;
        } catch (e) {
          const offline = isOfflineError(e);
          userMeta().dirty = true;
          await saveMeta();
          setState({ status: offline ? 'offline' : 'error', error: offline ? null : (e?.message || 'Sync failed') });
          if (!offline) log.warn?.('[sync] failed', e);
          rerun = false;
        }
      } while (rerun && state.signedIn);
    })().finally(() => { running = null; });
    return running;
  };

  const requestSync = (delay = debounceMs) => {
    if (!state.signedIn) return;
    clearTimeout(timer);
    timer = setTimeout(() => { timer = null; runSync(); }, delay);
  };

  const becomeSignedIn = (id, appleUserId) => {
    userId = id;
    meta.currentUserId = id;
    const m = userMeta();
    if (appleUserId) m.appleUserId = appleUserId;
    setState({ signedIn: true, lastSyncedAt: m.lastSyncedAt, status: m.dirty ? 'idle' : 'synced', error: null });
  };

  const becomeSignedOut = () => {
    clearTimeout(timer); timer = null;
    userId = null;
    if (meta) delete meta.currentUserId;
    setState({ signedIn: false, status: 'idle', lastSyncedAt: null, error: null });
  };

  let unsubscribe = null;
  const start = async () => {
    await loadMeta();
    await saveMeta();
    if (!configured) { setState({ ready: true }); return state; }
    unsubscribe = saves.subscribe(() => {
      if (applyingRemote || !state.signedIn) return;
      userMeta().dirty = true;
      requestSync();
    });
    try {
      const session = await Promise.race([
        backend.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('Session check timed out'), { offline: true })), 5000)),
      ]);
      if (session?.userId) {
        userId = session.userId;
        const appleUserId = userMeta().appleUserId;
        const cred = appleUserId ? await backend.checkAppleCredential(appleUserId).catch(() => 'unknown') : 'unknown';
        if (cred === 'revoked' || cred === 'notFound') {
          await backend.signOut().catch(() => {});
          becomeSignedOut();
        } else {
          becomeSignedIn(session.userId);
        }
      }
    } catch (e) {
      // Couldn't reach the server to refresh the session (offline or slow). Stay signed in as the
      // last known account; the next sync will find out for sure.
      if (meta.currentUserId && isOfflineError(e)) { becomeSignedIn(meta.currentUserId); setState({ status: 'offline' }); }
      else { if (meta.currentUserId) becomeSignedOut(); log.warn?.('[sync] could not restore session', e); }
    }
    await saveMeta();
    setState({ ready: true });
    if (state.signedIn) runSync();
    return state;
  };

  const signIn = async () => {
    if (!configured || state.busy) return false;
    setState({ busy: 'signin', error: null });
    try {
      const { userId: id, appleUserId } = await backend.signInWithApple();
      becomeSignedIn(id, appleUserId);
      await saveMeta();
      setState({ busy: null });
      await runSync();
      return true;
    } catch (e) {
      const canceled = e?.code === 'CANCELED' || /cancel/i.test(e?.message || '');
      setState({ busy: null, error: canceled ? null : (isOfflineError(e) ? 'You’re offline. Connect to the internet to sign in.' : 'Couldn’t sign in. Please try again.') });
      if (!canceled) log.warn?.('[sync] sign-in failed', e);
      return false;
    }
  };

  const signOut = async () => {
    if (!state.signedIn || state.busy) return;
    setState({ busy: 'signout' });
    if (userMeta().dirty) { try { await Promise.race([runSync(), new Promise((r) => setTimeout(r, 4000))]); } catch { /* best effort */ } }
    await backend.signOut().catch((e) => log.warn?.('[sync] sign-out failed', e));
    becomeSignedOut();
    await saveMeta();                           // keeps this user's sync base so signing back in never double-counts
    setState({ busy: null });
  };

  // Called when the player resets progress while signed in: the reset must reach the cloud too,
  // otherwise the next sync would restore it. Survives being offline or the app closing.
  const resetEverywhere = async () => {
    if (!state.signedIn) return;
    userMeta().pendingReset = true;
    await saveMeta();
    try { await Promise.race([runSync(), new Promise((r) => setTimeout(r, 4000))]); } catch { /* retried on next launch */ }
  };

  const deleteAccount = async () => {
    if (!state.signedIn || state.busy) return false;
    setState({ busy: 'delete', error: null });
    try {
      await backend.deleteAccount();
      delete meta.users[userId];
      becomeSignedOut();
      await saveMeta();
      setState({ busy: null });
      return true;
    } catch (e) {
      setState({ busy: null, error: isOfflineError(e) ? 'You’re offline. Connect to the internet to delete your account.' : 'Couldn’t delete your account. Please try again.' });
      log.warn?.('[sync] delete account failed', e);
      return false;
    }
  };

  return {
    start, signIn, signOut, resetEverywhere, deleteAccount,
    syncNow: () => { clearTimeout(timer); timer = null; return runSync(); },
    requestSync,
    getState: () => state,
    onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    stop: () => { clearTimeout(timer); unsubscribe?.(); },
  };
}
