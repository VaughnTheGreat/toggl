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

export function recordResult(levelId, stars, skipNext = false) {
  const s = loadSave();
  const prev = (s.stars || {})[levelId] || 0;
  writeSave({
    stars: { ...(s.stars || {}), [levelId]: Math.max(prev, stars) },
    unlocked: Math.max(s.unlocked || 1, levelId + (skipNext ? 2 : 1)),
  });
}

export function getEndlessLevel() {
  return loadSave().endless || 1;
}

export function recordEndless(n) {
  const s = loadSave();
  writeSave({ endless: Math.max(s.endless || 1, n + 1) });
}

export function isTutorialDone() {
  return !!loadSave().tutorialDone;
}

export function setTutorialDone() {
  writeSave({ tutorialDone: true });
}

// --- Daily challenge ---
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDaily() {
  return loadSave().daily || { lastDate: null, streak: 0, best: 0 };
}

export function isDailyDone() {
  return getDaily().lastDate === todayKey();
}

export function recordDaily() {
  const d = getDaily();
  const today = todayKey();
  if (d.lastDate === today) return d;
  const consecutive = d.lastDate && new Date(today) - new Date(d.lastDate) === 86400000;
  const streak = consecutive ? d.streak + 1 : 1;
  const next = { lastDate: today, streak, best: Math.max(d.best || 0, streak) };
  writeSave({ daily: next });
  return next;
}

// --- Badges ---
export function getBadges() {
  return loadSave().badges || {};
}

export function addBadges(ids) {
  if (!ids.length) return;
  const b = { ...getBadges() };
  ids.forEach((id) => { b[id] = true; });
  writeSave({ badges: b });
}

const DEFAULT_SETTINGS = { sound: true, haptics: true, reducedMotion: false, colorblind: false, zen: false, theme: 'light' };

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(loadSave().settings || {}) };
}

export function saveSettings(settings) {
  writeSave({ settings });
}