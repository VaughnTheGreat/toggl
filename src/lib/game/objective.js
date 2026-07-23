// Generalized win conditions. A level's objective decides what "solved" means,
// on top of the same states/rules every objective type shares. Adding a new
// objective type here never touches ruleEngine.js — it only changes what
// counts as a win and how the goal is described, so it can't blow up the
// solver's state space the way a new rule type would.

export function countOn(states, level) {
  return level.buttons.filter((b) => !!states[b.id]).length;
}

export function isSolved(states, level) {
  const obj = level.objective || { type: 'match' };
  switch (obj.type) {
    case 'count':
      return countOn(states, level) === obj.count;
    case 'match':
    default:
      return level.buttons.every((b) => !!states[b.id] === !!level.target[b.id]);
  }
}

export function describeObjective(level) {
  const obj = level.objective || { type: 'match' };
  if (obj.type === 'count') {
    return `Turn ON exactly ${obj.count} switch${obj.count === 1 ? '' : 'es'}`;
  }
  return 'Match the target';
}

export function isCountObjective(level) {
  return level.objective?.type === 'count';
}
