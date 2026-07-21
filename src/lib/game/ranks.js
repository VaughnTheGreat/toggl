// Rank titles (by total campaign stars) and skill badges.
export const RANKS = [
  { min: 0, title: 'Novice' },
  { min: 10, title: 'Tinkerer' },
  { min: 25, title: 'Circuit Apprentice' },
  { min: 45, title: 'Signal Engineer' },
  { min: 65, title: 'Circuit Architect' },
  { min: 85, title: 'Logic Master' },
];

export function rankFor(totalStars) {
  let current = RANKS[0];
  let next = null;
  for (const r of RANKS) {
    if (totalStars >= r.min) current = r;
    else { next = r; break; }
  }
  return { ...current, next };
}

export const BADGES = {
  efficient: { label: 'Efficient', desc: 'Solve without using undo' },
  precise: { label: 'Precise', desc: 'Solve with no denied presses' },
  fast: { label: 'Fast', desc: 'Solve in under 30 seconds' },
  flawless: { label: 'Flawless', desc: 'Optimal moves, zero hints' },
  ritualist: { label: 'Ritualist', desc: 'Reach a 7-day daily streak' },
  bossbreaker: { label: 'Boss Breaker', desc: 'Clear a milestone puzzle' },
};

// Returns badge ids newly earned by this result (excluding already-owned).
export function evaluateBadges(result, level, owned = {}) {
  const earned = [];
  if (result.undos === 0) earned.push('efficient');
  if (result.denied === 0) earned.push('precise');
  if (result.time <= 30) earned.push('fast');
  if (result.moves === level.optimalMoves && result.hints === 0) earned.push('flawless');
  if ((result.streak || 0) >= 7) earned.push('ritualist');
  if (level.milestone) earned.push('bossbreaker');
  return earned.filter((id) => !owned[id]);
}