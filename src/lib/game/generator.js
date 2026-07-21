// Procedural level generator. Deterministic: level N always produces the same puzzle.
// Never guesses: builds a rule system, explores the reachable state space with BFS,
// and picks a target at the desired depth — so every level is solvable with a known
// minimum move count before it is ever shown.
import { canPress, applyPress } from './ruleEngine';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Difficulty curve: more buttons, more rule types, deeper solutions as n grows.
export function difficultyFor(n) {
  const buttonCount = Math.min(2 + Math.ceil(n / 3), 8);
  const types = ['toggle'];
  if (n >= 3) types.push('linked');
  if (n >= 6) types.push('conditional');
  if (n >= 10) types.push('lock');
  if (n >= 14) types.push('copy');
  const targetMoves = Math.min(1 + Math.ceil(n / 2), 9);
  return { buttonCount, types, targetMoves, undoAllowed: n < 12 };
}

function buildButtons(rng, ids, types) {
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const others = (id) => ids.filter((x) => x !== id);
  return ids.map((id) => {
    const t = pick(types);
    switch (t) {
      case 'linked': {
        const o = others(id).sort(() => rng() - 0.5);
        const count = rng() < 0.3 && o.length > 1 ? 2 : 1;
        return { id, rule: { type: 'linked', targets: [id, ...o.slice(0, count)] } };
      }
      case 'conditional':
        return { id, rule: { type: 'conditional', condition: { button: pick(others(id)), state: rng() < 0.5 } } };
      case 'lock':
        return { id, rule: { type: 'lock', locks: [pick(others(id))] } };
      case 'copy':
        return { id, rule: { type: 'copy', source: pick(others(id)) } };
      default:
        return { id, rule: { type: 'toggle' } };
    }
  });
}

// BFS from the start state, recording the first depth each button-state pattern
// appears at (= true minimum moves). Returns a target at the deepest reachable
// depth up to targetMoves, or null if the system is too trivial.
function findTarget(buttons, ids, start, targetMoves, rng) {
  const sKey = (s) => ids.map((id) => (s[id] ? 1 : 0)).join('');
  const fullKey = (s, l) => ids.map((id) => `${s[id] ? 1 : 0}${l[id] ? 1 : 0}`).join('');
  const patternDepth = new Map([[sKey(start), 0]]);
  const patternState = new Map();
  const visited = new Set([fullKey(start, {})]);
  let frontier = [{ s: start, l: {} }];

  for (let d = 1; d <= targetMoves && frontier.length; d++) {
    const next = [];
    for (const node of frontier) {
      for (const b of buttons) {
        if (!canPress(node.s, node.l, b)) continue;
        const r = applyPress(node.s, node.l, b);
        const fk = fullKey(r.states, r.locks);
        if (visited.has(fk)) continue;
        visited.add(fk);
        const pk = sKey(r.states);
        if (!patternDepth.has(pk)) {
          patternDepth.set(pk, d);
          patternState.set(pk, r.states);
        }
        next.push({ s: r.states, l: r.locks });
      }
    }
    frontier = next;
  }

  let best = 0;
  for (const d of patternDepth.values()) best = Math.max(best, d);
  if (best < Math.min(2, targetMoves)) return null;
  const candidates = [...patternDepth.entries()].filter(([, d]) => d === best).map(([k]) => k);
  const pickKey = candidates[Math.floor(rng() * candidates.length)];
  return { target: { ...patternState.get(pickKey) }, depth: best };
}

// Player-selectable difficulty presets for Custom Play.
export const DIFFICULTIES = {
  beginner: { label: 'Beginner', desc: 'Toggles & linked switches', buttonCount: 3, types: ['toggle', 'linked'], targetMoves: 3, undoAllowed: true },
  skilled: { label: 'Skilled', desc: 'Conditional switches appear', buttonCount: 5, types: ['toggle', 'linked', 'conditional'], targetMoves: 5, undoAllowed: true },
  advanced: { label: 'Advanced', desc: 'Locks — no undo', buttonCount: 6, types: ['toggle', 'linked', 'conditional', 'lock'], targetMoves: 7, undoAllowed: false },
  expert: { label: 'Expert', desc: 'All rules, deep solutions', buttonCount: 8, types: ['toggle', 'linked', 'conditional', 'lock', 'copy'], targetMoves: 9, undoAllowed: false },
};

function generateFrom(seedBase, { buttonCount, types, targetMoves, undoAllowed }, meta, generousLimit) {
  const ids = IDS.slice(0, buttonCount);
  const base = { ...meta, undoAllowed };
  for (let attempt = 0; attempt < 80; attempt++) {
    const rng = mulberry32(seedBase + attempt * 104729 + 1);
    const buttons = buildButtons(rng, ids, types);
    const start = Object.fromEntries(ids.map((id) => [id, rng() < 0.35]));
    const found = findTarget(buttons, ids, start, targetMoves, rng);
    if (found) {
      return {
        ...base, buttons, start, target: found.target,
        optimalMoves: found.depth, moveLimit: found.depth + (generousLimit ? 2 : 1),
      };
    }
  }
  // Guaranteed-solvable fallback (practically unreachable).
  return {
    ...base,
    buttons: ids.map((id) => ({ id, rule: { type: 'toggle' } })),
    start: Object.fromEntries(ids.map((id) => [id, false])),
    target: Object.fromEntries(ids.map((id) => [id, true])),
    optimalMoves: ids.length, moveLimit: ids.length + 2,
  };
}

export function generateLevel(n) {
  // Every 10th endless level is a milestone "boss" puzzle: bigger and deeper.
  if (n % 10 === 0) {
    const d = difficultyFor(n);
    return generateFrom(n * 7919, {
      ...d,
      buttonCount: Math.min(d.buttonCount + 2, 8),
      targetMoves: Math.min(d.targetMoves + 2, 11),
    }, {
      id: `E${n}`, name: `Milestone ${String(n).padStart(3, '0')}`, tier: 'Milestone', endless: n, milestone: true,
    }, false);
  }
  return generateFrom(n * 7919, difficultyFor(n), {
    id: `E${n}`, name: `Sequence ${String(n).padStart(3, '0')}`, tier: 'Endless', endless: n,
  }, n < 10);
}

// Infinite campaign continuation (levels 31+). Sawtooth rhythm:
// easy → easy+ → medium → hard → relief, ramping slowly overall so
// momentum builds without exhaustion.
const SAW = [0, 1, 2, 3, -3];
export function generateContinuationLevel(n) {
  const m = n - 30;
  const saw = SAW[(m - 1) % 5];
  const relief = saw < 0;
  const eff = Math.max(10, 14 + Math.floor((m - 1) / 5) + saw);
  const d = difficultyFor(eff);
  return generateFrom(n * 15013 + 7, { ...d, undoAllowed: relief || d.undoAllowed }, {
    id: n,
    name: relief ? `Interlude ${String(n).padStart(3, '0')}` : `System ${String(n).padStart(3, '0')}`,
    tier: relief ? 'Relief' : 'Continuum',
  }, relief);
}

// Same puzzle for every player on a given date.
export function generateDailyLevel(dateKey) {
  const seed = parseInt(dateKey.replace(/-/g, ''), 10);
  return generateFrom(seed, {
    buttonCount: 6,
    types: ['toggle', 'linked', 'conditional', 'lock', 'copy'],
    targetMoves: 6,
    undoAllowed: true,
  }, {
    id: `D${dateKey}`, name: 'Daily Challenge', tier: 'Daily', daily: dateKey,
  }, true);
}

export function generateCustomLevel(tierKey, seed) {
  const d = DIFFICULTIES[tierKey] || DIFFICULTIES.beginner;
  return generateFrom(seed * 6151 + 13, d, {
    id: `C-${tierKey}-${seed}`, name: `${d.label} Run ${seed}`, tier: d.label, custom: { tier: tierKey, seed },
  }, tierKey === 'beginner' || tierKey === 'skilled');
}