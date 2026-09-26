// Generalized win conditions. A level's objective decides what "solved" means,
// on top of the same states/rules every objective type shares. Adding a new
// objective type here never touches ruleEngine.js — it only changes what
// counts as a win and how the goal is described, so it can't blow up the
// solver's state space the way a new rule type would.

export function countOn(states, level) {
  return level.buttons.filter((b) => !!states[b.id]).length;
}

export function groupOn(states, group) {
  return group.ids.filter((id) => !!states[id]).length;
}

export function isSolved(states, level) {
  const obj = level.objective || { type: 'match' };
  switch (obj.type) {
    case 'count':
      return countOn(states, level) === obj.count;
    case 'islands':
      return obj.groups.every((g) => groupOn(states, g) === g.count);
    case 'match':
    default:
      return level.buttons.every((b) => !!states[b.id] === !!level.target[b.id]);
  }
}

// How many goal parts are currently satisfied, out of how many.
export function progress(states, level) {
  const obj = level.objective || { type: 'match' };
  if (obj.type === 'count') return { matched: countOn(states, level), total: obj.count };
  if (obj.type === 'islands') {
    return { matched: obj.groups.filter((g) => groupOn(states, g) === g.count).length, total: obj.groups.length };
  }
  return {
    matched: level.buttons.filter((b) => !!states[b.id] === !!level.target[b.id]).length,
    total: level.buttons.length,
  };
}

export function describeObjective(level) {
  const obj = level.objective || { type: 'match' };
  if (obj.type === 'count') {
    return `Turn ON exactly ${obj.count} switch${obj.count === 1 ? '' : 'es'}`;
  }
  if (obj.type === 'islands') return 'Hit the exact ON count in every island';
  return 'Match the target';
}

// Goals that aren't a per-switch pattern (no "best attempt" tracking).
export function isCountObjective(level) {
  const t = level.objective?.type;
  return t === 'count' || t === 'islands';
}