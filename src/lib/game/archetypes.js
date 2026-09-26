// Level shapes. Each builds a rule system with a deliberate structure; the
// generator then checks the solver's optimal path to confirm the level really
// plays that way (e.g. a Hub level actually needs its hub).
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const shuffle = (rng, arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const without = (types, banned) => {
  const t = types.filter((x) => !banned.includes(x));
  return t.length ? t : ['toggle'];
};
const touches = (path, g) => path.some((id) => g.includes(id));

// One rule of `type` for switch `id`, referencing only switches in `pool`.
export function ruleFor(rng, type, id, pool, all = pool) {
  const others = pool.filter((x) => x !== id);
  if (!others.length) return { type: 'toggle' };
  switch (type) {
    case 'linked': {
      const o = shuffle(rng, others);
      return { type: 'linked', targets: [id, ...o.slice(0, rng() < 0.3 && o.length > 1 ? 2 : 1)] };
    }
    case 'conditional': return { type: 'conditional', condition: { button: pick(rng, others), state: rng() < 0.5 } };
    case 'lock': return { type: 'lock', locks: [pick(rng, others)] };
    case 'copy': return { type: 'copy', source: pick(rng, others) };
    case 'inverse': return { type: 'inverse', targets: all.filter((x) => x !== id) };
    case 'swap': return { type: 'swap', target: pick(rng, others) };
    case 'oneshot': return { type: 'oneshot' };
    case 'chain': return { type: 'chain', target: null };
    case 'delay': return { type: 'delay', target: pick(rng, others), delayMs: 1200 + Math.floor(rng() * 1200) };
    default: return { type: 'toggle' };
  }
}

// Each chain fires a non-chain neighbour's rule (snapshot, so no cycles).
export function resolveChains(rng, buttons) {
  for (const b of buttons) {
    if (b.rule.type !== 'chain') continue;
    const cands = buttons.filter((x) => x.id !== b.id && x.rule.type !== 'chain');
    if (!cands.length) { b.rule = { type: 'toggle' }; continue; }
    const t = pick(rng, cands);
    b.rule = { type: 'chain', target: t.id, targetRule: t.rule };
  }
  return buttons;
}

export function buildFreeform(rng, ids, types) {
  const buttons = ids.map((id) => ({ id, rule: ruleFor(rng, pick(rng, types), id, ids) }));
  return { buttons: resolveChains(rng, buttons) };
}

// One switch touches half the board; many others only work depending on it.
function buildHub(rng, ids, types) {
  const hub = ids[0];
  const rest = ids.slice(1);
  const hubRule = types.includes('inverse') && rng() < 0.3
    ? { type: 'inverse', targets: rest }
    : { type: 'linked', targets: [hub, ...shuffle(rng, rest).slice(0, Math.ceil(rest.length / 2))] };
  const pool = without(types, ['inverse']);
  const buttons = [{ id: hub, rule: hubRule }, ...rest.map((id) => ({
    id,
    rule: pool.includes('conditional') && rng() < 0.5
      ? { type: 'conditional', condition: { button: hub, state: rng() < 0.5 } }
      : ruleFor(rng, pick(rng, pool), id, ids),
  }))];
  return { buttons: resolveChains(rng, buttons), hub };
}

// Every switch only talks to its neighbours in a line — work from one end.
const PIPE = ['toggle', 'linked', 'conditional', 'lock', 'copy', 'swap', 'chain', 'delay'];
function buildPipeline(rng, ids, types) {
  const pool = without(types.filter((t) => PIPE.includes(t)), []);
  const last = ids.length - 1;
  const buttons = ids.map((id, i) => {
    const prev = ids[i - 1];
    const next = ids[i + 1];
    const t = i === last ? (pool.includes('conditional') && rng() < 0.5 ? 'conditional' : 'toggle') : pick(rng, pool);
    switch (t) {
      case 'linked': return { id, rule: { type: 'linked', targets: [id, next] } };
      case 'conditional': return prev
        ? { id, rule: { type: 'conditional', condition: { button: prev, state: rng() < 0.5 } } }
        : { id, rule: { type: 'linked', targets: [id, next] } };
      case 'lock': return { id, rule: prev ? { type: 'lock', locks: [prev] } : { type: 'toggle' } };
      case 'copy': return prev
        ? { id, rule: { type: 'copy', source: prev } }
        : { id, rule: { type: 'linked', targets: [id, next] } };
      case 'swap': return { id, rule: { type: 'swap', target: next } };
      case 'delay': return { id, rule: { type: 'delay', target: next, delayMs: 1200 + Math.floor(rng() * 1200) } };
      case 'chain': return { id, rule: { type: 'chain', target: next } };
      default: return { id, rule: { type: 'toggle' } };
    }
  });
  for (let i = last - 1; i >= 0; i--) {
    const b = buttons[i];
    if (b.rule.type !== 'chain') continue;
    const t = buttons[i + 1];
    b.rule = t.rule.type === 'chain'
      ? { type: 'linked', targets: [b.id, t.id] }
      : { type: 'chain', target: t.id, targetRule: t.rule };
  }
  return { buttons };
}

// Separate clusters that only interact through one bridge switch.
function buildIslands(rng, ids, types) {
  if (ids.length < 4) return null;
  const k = ids.length >= 9 ? 3 : 2;
  const size = Math.ceil(ids.length / k);
  const groups = Array.from({ length: k }, (_, i) => ids.slice(i * size, (i + 1) * size)).filter((g) => g.length);
  const pool = without(types, ['inverse', 'chain']);
  const bridge = groups[0][groups[0].length - 1];
  const buttons = groups.flatMap((g) => g.map((id) => ({
    id,
    rule: id === bridge
      ? { type: 'linked', targets: [id, ...groups.slice(1).map((o) => pick(rng, o))] }
      : ruleFor(rng, pick(rng, pool), id, g),
  })));
  return { buttons, groups, bridge };
}

// One lock is required — but pressing it at the wrong moment ruins the run.
function buildTrapdoor(rng, ids, types) {
  if (!types.includes('lock') || ids.length < 3) return null;
  const trap = pick(rng, ids);
  const others = ids.filter((x) => x !== trap);
  const pool = without(types, ['lock', 'oneshot']);
  const buttons = ids.map((id) => ({
    id,
    rule: id === trap
      ? { type: 'lock', locks: shuffle(rng, others).slice(0, rng() < 0.5 ? 2 : 1) }
      : ruleFor(rng, pick(rng, pool), id, ids),
  }));
  return { buttons: resolveChains(rng, buttons), trap };
}

function mapRule(r, m) {
  const f = (x) => m[x] ?? x;
  switch (r.type) {
    case 'linked': return { ...r, targets: r.targets.map(f) };
    case 'conditional': return { ...r, condition: { ...r.condition, button: f(r.condition.button) } };
    case 'lock': return { ...r, locks: r.locks.map(f) };
    case 'copy': return { ...r, source: f(r.source) };
    case 'swap':
    case 'delay': return { ...r, target: f(r.target) };
    default: return { ...r };
  }
}

// Two identical halves, symmetric start — one breaker switch spoils the symmetry.
function buildMirror(rng, ids, types) {
  if (ids.length < 4) return null;
  const half = Math.floor(ids.length / 2);
  const left = ids.slice(0, half);
  const right = ids.slice(half, half * 2);
  const mid = ids[half * 2];
  const m = {};
  left.forEach((id, i) => { m[id] = right[i]; m[right[i]] = id; });
  const pool = without(types, ['inverse', 'chain']);
  const rules = left.map((id) => ruleFor(rng, pick(rng, pool), id, left));
  const leftStart = left.map(() => rng() < 0.35);
  const buttons = [
    ...left.map((id, i) => ({ id, rule: rules[i] })),
    ...right.map((id, i) => ({ id, rule: mapRule(rules[i], m) })),
  ];
  const k = Math.floor(rng() * half);
  if (mid) buttons.push({ id: mid, rule: { type: 'linked', targets: [mid, left[k], right[k]] } });
  else buttons[half + k] = { id: right[k], rule: { type: 'linked', targets: [right[k], left[k]] } };
  const start = {};
  left.forEach((id, i) => { start[id] = leftStart[i]; start[right[i]] = leftStart[i]; });
  if (mid) start[mid] = rng() < 0.5;
  return { buttons, groups: mid ? [left, right, [mid]] : [left, right], start };
}

export const SHAPES = {
  freeform: { label: null, build: buildFreeform, fits: () => true },
  hub: { label: 'Hub', build: buildHub, fits: ({ path, hub }) => path.includes(hub) && path.some((id) => id !== hub) },
  pipeline: { label: 'Pipeline', build: buildPipeline, fits: ({ path, orderSensitive }) => orderSensitive && new Set(path).size >= 2 },
  islands: { label: 'Islands', build: buildIslands, fits: ({ path, groups, bridge }) => path.includes(bridge) && groups.filter((g) => touches(path, g)).length >= 2 },
  trapdoor: { label: 'Trapdoor', build: buildTrapdoor, fits: ({ path, trap, orderSensitive }) => path.indexOf(trap) > 0 && orderSensitive },
  mirror: { label: 'Mirror', build: buildMirror, fits: ({ path, groups }) => touches(path, groups[0]) && touches(path, groups[1]) },
};

export const SHAPE_ORDER = ['hub', 'pipeline', 'islands', 'trapdoor', 'mirror'];
export const PEAK_SHAPES = ['trapdoor', 'islands'];