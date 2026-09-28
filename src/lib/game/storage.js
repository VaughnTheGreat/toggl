import { rankFor, rankUpReward } from '@/lib/game/ranks';

const KEY = 'logicgrid_save';

export function loadSave() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}

let changeListener = null;

// Optional listener notified after every local save write.
export function onSaveChange(fn) {
  changeListener = fn;
}

// Replaces the whole local save (used after merging in the cloud save).
export function replaceSave(save) {
  localStorage.setItem(KEY, JSON.stringify(save));
}

function writeSave(patch) {
  const s = { ...loadSave(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(s));
  changeListener?.(s);
  return s;
}

export function getStars() {
  return loadSave().stars || {};
}

export function getUnlocked() {
  return loadSave().unlocked || 1;
}

export function recordResult(levelId, stars, skipNext = false, zen = false) {
  const s = loadSave();
  const prev = (s.stars || {})[levelId] || 0;
  // Players who ranked up before rewards existed start from their current rank (no back-pay).
  const claimed = s.rankClaimed ?? rankFor(getRankedClears()).index;
  // Levels cleared only in Zen mode unlock the next level but don't count toward rank.
  const zenOnly = { ...(s.zenOnly || {}) };
  const alreadyCleared = levelId < (s.unlocked || 1) && !zenOnly[levelId];
  if (!zen) delete zenOnly[levelId];
  else if (!alreadyCleared) zenOnly[levelId] = true;
  writeSave({
    stars: { ...(s.stars || {}), [levelId]: Math.max(prev, stars) },
    unlocked: Math.max(s.unlocked || 1, levelId + (skipNext ? 2 : 1)),
    zenOnly,
  });
  // Pay out each newly reached rank once; returns { rank, reward } on a rank-up, else null.
  const rank = rankFor(getRankedClears());
  writeSave({ rankClaimed: Math.max(claimed, rank.index) });
  if (rank.index <= claimed) return null;
  const reward = rankUpReward(claimed, rank.index);
  addBonusStars(reward);
  return { rank: rank.title, reward };
}

// Campaign levels cleared outside Zen mode — what rank is based on.
export function getRankedClears() {
  const s = loadSave();
  return Math.max(0, (s.unlocked || 1) - 1 - Object.keys(s.zenOnly || {}).length);
}

// Spendable stars = every best-star earned on campaign levels minus what's been
// spent. Replaying a level only adds stars when it beats the previous best,
// so the balance can't be farmed, and spending never lowers the profile total.
export function getStarBalance() {
  const s = loadSave();
  const total = Object.values(s.stars || {}).reduce((a, b) => a + b, 0);
  return Math.max(0, Math.floor(total + (s.bonusStars || 0) - (s.starsSpent || 0)));
}

// Extra spendable stars from streaks, badges and rank boosts (not counted toward level stars).
// Fractions carry over between clears; returns how many whole stars the balance gained.
export function addBonusStars(n) {
  if (!(n > 0)) return 0;
  const before = loadSave().bonusStars || 0;
  writeSave({ bonusStars: before + n });
  return Math.floor(before + n) - Math.floor(before);
}

const STREAK_MILESTONES = { 7: 50, 30: 200, 100: 500 };
export const BADGE_BONUS = 10;

// Daily Challenge reward: 20 stars per star earned, +5 per streak day (max +50), plus milestone bonuses.
export function dailyBonus(streak, stars = 3) {
  return 20 * stars + 5 * Math.min(streak - 1, 10) + (STREAK_MILESTONES[streak] || 0);
}

export function spendStars(n) {
  if (getStarBalance() < n) return false;
  writeSave({ starsSpent: (loadSave().starsSpent || 0) + n });
  return true;
}

export function getEndlessLevel() {
  return loadSave().endless || 1;
}

export function recordEndless(n) {
  const s = loadSave();
  writeSave({ endless: Math.max(s.endless || 1, n + 1) });
}

// Bumps local unlocked-level state to at least n (used after the backend
// reports highest_level_unlocked increased for the signed-in player).
export function setUnlockedAtLeast(n) {
  const s = loadSave();
  writeSave({ unlocked: Math.max(s.unlocked || 1, n) });
}

// Restores campaign stars from the backend's per-level bests (keeps the higher value).
export function mergeStarsFromBest(levelBest = {}) {
  const s = loadSave();
  const stars = { ...(s.stars || {}) };
  let changed = false;
  for (const [key, v] of Object.entries(levelBest)) {
    if (!/^\d+$/.test(key) || !v?.stars) continue;
    if ((stars[key] || 0) < v.stars) { stars[key] = v.stars; changed = true; }
  }
  if (changed) writeSave({ stars });
}

// Wipes the entire local save (used after deleteMyData succeeds).
export function resetSave() {
  replaceSave({});
}

export function isTutorialDone() {
  // Players who already made progress (before the tutorial existed) count as done.
  const s = loadSave();
  return !!s.tutorialDone || (s.unlocked || 1) > 1 || Object.keys(s.stars || {}).length > 0;
}

export function setTutorialDone() {
  writeSave({ tutorialDone: true });
}

// Rule types the player has already been introduced to (auto-opens the rule guide for new ones).
export function getSeenRules() {
  return loadSave().seenRules || ['toggle', 'linked', 'copy', 'conditional', 'lock'].filter(() => isTutorialDone());
}

export function markRulesSeen(types) {
  writeSave({ seenRules: [...new Set([...getSeenRules(), ...types])] });
}

export function hasSeenNoUndo() {
  return !!loadSave().seenNoUndo;
}

export function markNoUndoSeen() {
  writeSave({ seenNoUndo: true });
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

export function recordDaily(stars) {
  const d = getDaily();
  const today = todayKey();
  if (d.lastDate === today) return { ...d, bonus: 0 };
  const consecutive = d.lastDate && Math.round((new Date(today) - new Date(d.lastDate)) / 86400000) === 1;
  const streak = consecutive ? d.streak + 1 : 1;
  const next = { lastDate: today, streak, best: Math.max(d.best || 0, streak) };
  writeSave({ daily: next });
  const bonus = dailyBonus(streak, stars);
  addBonusStars(bonus);
  return { ...next, bonus };
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

// --- Per-level stats (best moves, solve count) ---
export function recordLevelStats(levelId, moves) {
  const s = loadSave();
  const stats = { ...(s.levelStats || {}) };
  const prev = stats[levelId] || { bestMoves: null, solves: 0 };
  stats[levelId] = {
    bestMoves: prev.bestMoves == null ? moves : Math.min(prev.bestMoves, moves),
    solves: prev.solves + 1,
  };
  writeSave({ levelStats: stats });
}

export function getLevelStats() {
  return loadSave().levelStats || {};
}

const DEFAULT_SETTINGS = { sound: true, haptics: true, reducedMotion: false, colorblind: false, zen: false, theme: 'dark' };

export function getSettings() {
  const s = { ...DEFAULT_SETTINGS, ...(loadSave().settings || {}) };
  if (!s.themeChosen) s.theme = 'dark'; // dark until the player picks otherwise
  return s;
}

export function saveSettings(settings) {
  writeSave({ settings });
}