const KEY = 'logicgrid_save';

export function loadSave() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}

function writeSave(patch) {
  const s = { ...loadSave(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function getStars() {
  return loadSave().stars || {};
}

export function getUnlocked() {
  return loadSave().unlocked || 1;
}

export function recordResult(levelId, stars) {
  const s = loadSave();
  const prev = (s.stars || {})[levelId] || 0;
  writeSave({
    stars: { ...(s.stars || {}), [levelId]: Math.max(prev, stars) },
    unlocked: Math.max(s.unlocked || 1, levelId + 1),
  });
}

export function isTutorialDone() {
  return !!loadSave().tutorialDone;
}

export function setTutorialDone() {
  writeSave({ tutorialDone: true });
}

const DEFAULT_SETTINGS = { sound: true, haptics: true, reducedMotion: false, colorblind: false };

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(loadSave().settings || {}) };
}

export function saveSettings(settings) {
  writeSave({ settings });
}