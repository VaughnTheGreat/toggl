// Procedural level generator. Deterministic: level N always produces the same puzzle.
// Never guesses: builds a rule system, explores the reachable state space with BFS,
// and picks a target at the desired depth — so every level is solvable with a known
// minimum move count before it is ever shown.
import { canPress, applyPress } from './ruleEngine';
import { SHAPES, SHAPE_ORDER, PEAK_SHAPES, buildFreeform } from './archetypes';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Difficulty curve: more buttons, more rule types, deeper solutions as n grows.
// New rule types keep unlocking deep into the game, and boards keep growing
// past the early cap of 8 — so complexity never fully plateaus.
export function difficultyFor(n) {
  const extraButtons = Math.min(Math.max(0, Math.floor((n - 40) / 15)), 4);
  const buttonCount = Math.min(2 + Math.ceil(n / 3), 8) + extraButtons;
  const types = ['toggle'];
  if (n >= 3) types.push('linked');
  if (n >= 6) types.push('conditional');
  if (n >= 10) types.push('lock');
  if (n >= 14) types.push('copy');
  if (n >= 18) types.push('inverse');
  if (n >= 22) types.push('swap');
  if (n >= 26) types.push('oneshot');
  if (n >= 30) types.push('chain');
  if (n >= 34) types.push('delay');
  const extraDepth = Math.min(Math.max(0, Math.floor((n - 40) / 20)), 3);
  const targetMoves = Math.min(1 + Math.ceil(n / 2), 9) + extraDepth;
  return { buttonCount, types, targetMoves, undoAllowed: n < 12 };
}

// BFS from the start state, recording the first depth each goal key appears at
// (= true minimum moves) plus the path that reached it. Returns a goal at the
// deepest reachable depth up to targetMoves, or null if the system is too trivial.
// keyFn decides what "the goal" is: exact pattern, ON-count, or per-island counts.
function findGoal(buttons, ids, start, targetMoves, rng, keyFn) {
  const fullKey = (s, l) => ids.map((id) => `${s[id] ? 1 : 0}${l[id] ? 1 : 0}`).join('');
  const goalDepth = new Map([[keyFn(start), 0]]);
  const goalNode = new Map();
  const visited = new Set([fullKey(start, {})]);
  let frontier = [{ s: start, l: {}, parent: null, press: null }];

  for (let d = 1; d <= targetMoves && frontier.length; d++) {
    const next = [];
    for (const node of frontier) {
      for (const b of buttons) {
        if (!canPress(node.s, node.l, b)) continue;
        const r = applyPress(node.s, node.l, b);
        const fk = fullKey(r.states, r.locks);
        if (visited.has(fk)) continue;
        visited.add(fk);
        const child = { s: r.states, l: r.locks, parent: node, press: b.id };
        const gk = keyFn(r.states);
        if (!goalDepth.has(gk)) {
          goalDepth.set(gk, d);
          goalNode.set(gk, child);
        }
        next.push(child);
      }
    }
    frontier = next;
  }

  let best = 0;
  for (const d of goalDepth.values()) best = Math.max(best, d);
  if (best < Math.min(2, targetMoves)) return null;
  const candidates = [...goalDepth.entries()].filter(([, d]) => d === best).map(([k]) => k);
  const key = candidates[Math.floor(rng() * candidates.length)];
  const path = [];
  for (let n = goalNode.get(key); n.parent; n = n.parent) path.unshift(n.press);
  return { target: { ...goalNode.get(key).s }, depth: best, path, key };
}

const onCount = (s, ids) => ids.reduce((n, id) => n + (s[id] ? 1 : 0), 0);

function goalKeyFn(mode, ids, groups) {
  if (mode === 'count') return (s) => String(onCount(s, ids));
  if (mode === 'islands') return (s) => groups.map((g) => onCount(s, g)).join(',');
  return (s) => ids.map((id) => (s[id] ? 1 : 0)).join('');
}

// Does the optimal path only work in its exact order? (Replayed backwards.)
function isOrderSensitive(buttons, start, path, goalKey, keyFn) {
  let s = start;
  let l = {};
  for (const id of [...path].reverse()) {
    const b = buttons.find((x) => x.id === id);
    if (!canPress(s, l, b)) return true;
    ({ states: s, locks: l } = applyPress(s, l, b));
  }
  return keyFn(s) !== goalKey;
}


// Builds candidates in the requested shape and keeps the first one whose optimal
// solution actually plays like that shape (falls back to the first solvable one).
function generateFrom(seedBase, { buttonCount, types, targetMoves, undoAllowed }, meta, opts = {}) {
  const { generous = false, mystery = 0, objective = 'match', shape = 'freeform' } = opts;
  const ids = IDS.slice(0, buttonCount);
  const base = { ...meta, undoAllowed };
  const def = SHAPES[shape] || SHAPES.freeform;
  const maxCandidates = buttonCount >= 10 ? 3 : 8;
  let fallback = null;
  let tried = 0;
  for (let attempt = 0; attempt < 80; attempt++) {
    const rng = mulberry32(seedBase + attempt * 104729 + 1);
    const built = def.build(rng, ids, types) || { ...buildFreeform(rng, ids, types), plain: true };
    const { buttons, groups } = built;
    const start = built.start || Object.fromEntries(ids.map((id) => [id, rng() < 0.35]));
    const mode = objective === 'islands' && (shape !== 'islands' || built.plain) ? 'match' : objective;
    const keyFn = goalKeyFn(mode, ids, groups);
    const found = findGoal(buttons, ids, start, targetMoves, rng, keyFn);
    if (!found) continue;
    // Mystery switches: hide the rule of a non-trivial button until first pressed.
    if (mystery > 0 && rng() < 0.6) {
      const cands = buttons.filter((b) => b.rule.type !== 'toggle');
      for (let i = 0; i < mystery && cands.length; i++) {
        cands.splice(Math.floor(rng() * cands.length), 1)[0].mystery = true;
      }
    }
    const goal = mode === 'count' ? { type: 'count', count: onCount(found.target, ids) }
      : mode === 'islands' ? { type: 'islands', groups: groups.map((g) => ({ ids: g, count: onCount(found.target, g) })) }
      : { type: 'match' };
    const level = {
      ...base, buttons, start, target: found.target, objective: goal,
      optimalMoves: found.depth, moveLimit: found.depth + (generous ? 2 : 1),
      shape: built.plain ? 'freeform' : shape,
      shapeLabel: built.plain ? null : def.label,
      groups: built.plain ? undefined : groups,
      hub: built.hub,
    };
    const fits = built.plain || def.fits({
      ...built, path: found.path,
      orderSensitive: isOrderSensitive(buttons, start, found.path, found.key, keyFn),
    });
    if (fits) return level;
    fallback = fallback || level;
    if (++tried >= maxCandidates) return fallback;
  }
  if (fallback) return fallback;
  // Guaranteed-solvable fallback (practically unreachable).
  return {
    ...base,
    objective: objective === 'count' ? { type: 'count', count: ids.length } : { type: 'match' },
    buttons: ids.map((id) => ({ id, rule: { type: 'toggle' } })),
    start: Object.fromEntries(ids.map((id) => [id, false])),
    target: Object.fromEntries(ids.map((id) => [id, true])),
    optimalMoves: ids.length, moveLimit: ids.length + 2, shape: 'freeform',
  };
}

export function generateLevel(n) {
  // Every 10th endless level is a milestone "boss" puzzle: bigger and deeper.
  if (n % 10 === 0) {
    const d = difficultyFor(n);
    return generateFrom(n * 7919, {
      ...d,
      buttonCount: Math.min(d.buttonCount + 2, 12),
      targetMoves: Math.min(d.targetMoves + 2, 12),
    }, {
      id: `E${n}`, name: `Milestone ${String(n).padStart(3, '0')}`, tier: 'Milestone', endless: n, milestone: true,
    }, { mystery: 1, shape: 'trapdoor' });
  }
  return generateFrom(n * 7919, difficultyFor(n), {
    id: `E${n}`, name: `Sequence ${String(n).padStart(3, '0')}`, tier: 'Endless', endless: n,
  }, { generous: n < 10, shape: n < 6 ? 'freeform' : SHAPE_ORDER[n % SHAPE_ORDER.length] });
}

// Infinite campaign continuation (levels 31+). Sawtooth rhythm:
// easy → easy+ → medium → hard → relief, ramping slowly overall so
// momentum builds without exhaustion.
const SAW = [0, 1, 2, 3, -3];

// Each 5-level block plays four different shapes, ending on a peak shape
// (Trapdoor / Islands alternate), then a freeform breather.
function continuationShape(m) {
  const pos = (m - 1) % 5;
  if (SAW[pos] < 0) return 'freeform';
  const block = Math.floor((m - 1) / 5);
  const rng = mulberry32(block * 7757 + 3);
  const peak = PEAK_SHAPES[block % PEAK_SHAPES.length];
  const rest = SHAPE_ORDER.filter((s) => s !== peak)
    .map((s) => [rng(), s]).sort((a, b) => a[0] - b[0]).map(([, s]) => s);
  return [...rest.slice(0, 3), peak][pos];
}

// Rotating modifiers keep late-game levels feeling distinct even after
// every rule type has been unlocked.
export const MODIFIERS = [
  { label: 'Mystery', mystery: 2 },
  { label: 'Precision', exact: true },
  { label: 'Surge', surge: true },
  { label: 'Veiled', mystery: 3 },
  { label: 'Quota', objective: 'count' },
];

export function generateContinuationLevel(n) {
  const m = n - 30;
  const saw = SAW[(m - 1) % 5];
  const relief = saw < 0;
  const eff = Math.max(10, 14 + Math.floor((m - 1) / 5) + saw);
  const d = difficultyFor(eff);
  const mod = !relief && n > 50 ? MODIFIERS[Math.floor((n - 51) / 5) % MODIFIERS.length] : null;
  if (mod?.surge) {
    d.buttonCount = Math.min(d.buttonCount + 1, 12);
    d.targetMoves = Math.min(d.targetMoves + 1, 12);
  }
  const shape = continuationShape(m);
  const objective = mod?.objective === 'count' ? 'count' : shape === 'islands' && n % 2 === 0 ? 'islands' : 'match';
  // Board size and solution depth max out around level 460. Past that, pressure
  // keeps rising instead: zero spare moves (460+), then an extra hidden rule (700+).
  const lateExact = !relief && n > 460;
  const lateMystery = !relief && n > 700 ? 1 : 0;
  const level = generateFrom(n * 15013 + 7, { ...d, undoAllowed: relief || d.undoAllowed }, {
    id: n,
    name: `Level ${n}`,
    tier: relief ? 'Breather' : mod ? mod.label : 'Challenge',
  }, { generous: relief, mystery: relief ? 0 : (mod?.mystery ?? 1) + lateMystery, objective, shape });
  if (mod?.exact || lateExact) level.moveLimit = level.optimalMoves;
  return level;
}

// Same puzzle for every player on a given date; the shape rotates daily.
export function generateDailyLevel(dateKey) {
  const seed = parseInt(dateKey.replace(/-/g, ''), 10);
  const day = Math.floor(new Date(dateKey).getTime() / 86400000);
  return generateFrom(seed, {
    buttonCount: 8,
    types: ['toggle', 'linked', 'conditional', 'lock', 'copy', 'inverse', 'swap', 'oneshot', 'chain'],
    targetMoves: 8,
    undoAllowed: true,
  }, {
    id: `D${dateKey}`, name: 'Daily Challenge', tier: 'Daily', daily: dateKey,
  }, { mystery: 1, shape: SHAPE_ORDER[((day % SHAPE_ORDER.length) + SHAPE_ORDER.length) % SHAPE_ORDER.length] });
}