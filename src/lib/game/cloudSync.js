// Cloud save: progress lives on the player's account (user.game_data) so it
// survives reinstalls and syncs across devices. Local storage stays the fast
// synchronous source of truth; this module pulls + merges on startup and
// pushes (debounced) after every local write.
import { base44 } from '@/api/base44Client';
import { loadSave, replaceSave, onSaveChange } from './storage';

// Merge favors the player: max stars/unlocked/endless, union of badges,
// the most recent daily streak, local settings over cloud.
function mergeSaves(local, cloud) {
  const stars = { ...(cloud.stars || {}) };
  for (const [k, v] of Object.entries(local.stars || {})) {
    stars[k] = Math.max(stars[k] || 0, v);
  }
  let daily = local.daily || cloud.daily;
  if (local.daily && cloud.daily) {
    const newer = new Date(local.daily.lastDate || 0) >= new Date(cloud.daily.lastDate || 0) ? local.daily : cloud.daily;
    daily = { ...newer, best: Math.max(local.daily.best || 0, cloud.daily.best || 0) };
  }
  return {
    ...cloud,
    ...local,
    stars,
    unlocked: Math.max(local.unlocked || 1, cloud.unlocked || 1),
    endless: Math.max(local.endless || 1, cloud.endless || 1),
    tutorialDone: !!(local.tutorialDone || cloud.tutorialDone),
    badges: { ...(cloud.badges || {}), ...(local.badges || {}) },
    daily,
    settings: { ...(cloud.settings || {}), ...(local.settings || {}) },
  };
}

let pushTimer;

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    base44.auth.updateMe({ game_data: loadSave() }).catch(() => {
      /* offline — local save is intact, next write retries */
    });
  }, 1200);
}

// Pull the cloud save, merge it into local, then start pushing local changes.
export async function initCloudSync() {
  try {
    const me = await base44.auth.me();
    if (me?.game_data && typeof me.game_data === 'object') {
      replaceSave(mergeSaves(loadSave(), me.game_data));
    }
  } catch {
    /* logged out or offline — play from the local save */
  }
  onSaveChange(schedulePush);
}