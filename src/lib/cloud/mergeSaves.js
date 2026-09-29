// Three-way merge of two logicgrid_save objects (this device vs. cloud) against the last
// snapshot both sides agreed on ("base"). Pure functions: no I/O, inputs are never mutated,
// and the save format is unchanged — the result has exactly the same shape as the inputs.
//
// Why three-way: counters like starsSpent grow independently on each device. Taking the max
// would forget spending done on the other device; adding each side's growth since the last
// sync keeps both. Progress that only ever goes up (stars, unlocked levels) just takes the max.
// With no base (first sign-in on a device), every counter's base is 0: independent progress
// from both sides is kept.

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

export function sameSave(a, b) {
  return stableStringify(a ?? {}) === stableStringify(b ?? {});
}

function stableStringify(v) {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`;
  if (isObj(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(v[k])}`).join(',')}}`;
  return JSON.stringify(v);
}

// base + (local - base) + (cloud - base), never below 0.
function additive(b, l, c) {
  const base = num(b);
  return Math.max(0, base + (num(l) - base) + (num(c) - base));
}

// Per-key choice for preferences: whichever side changed it since base; if both did, this device.
// A key missing on a side means that side never set it (defaults apply), so the other side wins.
function pickChanged(b, l, c) {
  if (l === undefined) return clone(c);
  if (c === undefined) return clone(l);
  const lChanged = stableStringify(l) !== stableStringify(b);
  const cChanged = stableStringify(c) !== stableStringify(b);
  if (cChanged && !lChanged) return clone(c);
  return clone(l);
}

function mergeStars(l = {}, c = {}) {
  const out = {};
  for (const k of new Set([...Object.keys(l), ...Object.keys(c)])) out[k] = Math.max(num(l[k]), num(c[k]));
  return out;
}

// A level stays "cleared only in Zen" unless either side cleared it normally.
function mergeZenOnly(local, cloud) {
  const lz = local.zenOnly || {}, cz = cloud.zenOnly || {};
  const clearedNormally = (save, zen, level) => Number(level) < num(save.unlocked || 1) && !zen[level];
  const out = {};
  for (const level of new Set([...Object.keys(lz), ...Object.keys(cz)])) {
    if (!(lz[level] || cz[level])) continue;
    if (clearedNormally(local, lz, level) || clearedNormally(cloud, cz, level)) continue;
    out[level] = true;
  }
  return out;
}

function mergeDaily(l, c) {
  if (!l) return clone(c);
  if (!c) return clone(l);
  const la = l.lastDate || '', ca = c.lastDate || '';
  const pick = la > ca ? l : ca > la ? c : num(l.streak) >= num(c.streak) ? l : c;
  return { ...clone(pick), best: Math.max(num(l.best), num(c.best), num(pick.streak)) };
}

function mergeLevelStats(b = {}, l = {}, c = {}) {
  const out = {};
  for (const k of new Set([...Object.keys(l), ...Object.keys(c)])) {
    const bl = b[k] || {}, ll = l[k] || {}, cl = c[k] || {};
    const moves = [ll.bestMoves, cl.bestMoves].filter((m) => typeof m === 'number');
    out[k] = {
      bestMoves: moves.length ? Math.min(...moves) : null,
      solves: additive(bl.solves, ll.solves, cl.solves),
    };
  }
  return out;
}

const unionObj = (l = {}, c = {}) => ({ ...clone(c), ...clone(l) });
const unionArr = (l = [], c = []) => [...new Set([...l, ...c])];

function mergeSettings(b = {}, l, c) {
  if (!l && !c) return undefined;
  const lo = l || {}, co = c || {};
  const out = {};
  for (const k of new Set([...Object.keys(lo), ...Object.keys(co)])) out[k] = pickChanged(b[k], lo[k], co[k]);
  return out;
}

function mergeSkins(b = {}, l, c) {
  if (!l && !c) return undefined;
  const lo = l || {}, co = c || {};
  const out = {};
  for (const k of new Set([...Object.keys(lo), ...Object.keys(co)])) {
    out[k] = k === 'owned' ? unionArr(lo.owned, co.owned) : pickChanged(b[k], lo[k], co[k]);
  }
  return out;
}

// Fields with explicit rules. Anything else (e.g. a field added in a future version) keeps
// this device's value, or the cloud's if this device doesn't have it.
const HANDLED = new Set(['stars', 'unlocked', 'endless', 'rankClaimed', 'zenOnly', 'bonusStars', 'starsSpent',
  'levelStats', 'daily', 'badges', 'seenRules', 'tutorialDone', 'seenNoUndo', 'settings', 'skins']);

export function mergeSaves(base, local, cloud) {
  const b = isObj(base) ? base : {};
  const l = isObj(local) ? local : {};
  const c = isObj(cloud) ? cloud : {};
  if (sameSave(l, c)) return clone(l);

  const out = {};
  for (const k of new Set([...Object.keys(c), ...Object.keys(l)])) {
    if (!HANDLED.has(k)) out[k] = clone(k in l ? l[k] : c[k]);
  }

  const has = (k) => k in l || k in c;
  if (has('stars')) out.stars = mergeStars(l.stars, c.stars);
  if (has('unlocked')) out.unlocked = Math.max(num(l.unlocked) || 1, num(c.unlocked) || 1);
  if (has('endless')) out.endless = Math.max(num(l.endless) || 1, num(c.endless) || 1);
  if (has('rankClaimed')) out.rankClaimed = Math.max(num(l.rankClaimed), num(c.rankClaimed));
  if (has('zenOnly')) out.zenOnly = mergeZenOnly(l, c);
  if (has('bonusStars')) out.bonusStars = additive(b.bonusStars, l.bonusStars, c.bonusStars);
  if (has('starsSpent')) out.starsSpent = additive(b.starsSpent, l.starsSpent, c.starsSpent);
  if (has('levelStats')) out.levelStats = mergeLevelStats(b.levelStats, l.levelStats, c.levelStats);
  if (has('daily')) out.daily = mergeDaily(l.daily, c.daily);
  if (has('badges')) out.badges = unionObj(l.badges, c.badges);
  if (has('seenRules')) out.seenRules = unionArr(l.seenRules, c.seenRules);
  if (has('tutorialDone')) out.tutorialDone = !!(l.tutorialDone || c.tutorialDone);
  if (has('seenNoUndo')) out.seenNoUndo = !!(l.seenNoUndo || c.seenNoUndo);
  const settings = mergeSettings(b.settings, l.settings, c.settings);
  if (settings) out.settings = settings;
  const skins = mergeSkins(b.skins, l.skins, c.skins);
  if (skins) out.skins = skins;
  return out;
}
