// Rank titles (by campaign levels cleared, so rank always matches unlocked progress) and skill badges.
export const RANKS = [
  { min: 0, title: 'Novice' },
  { min: 3, title: 'Tinkerer' },
  { min: 6, title: 'Switch Flipper' },
  { min: 10, title: 'Circuit Apprentice' },
  { min: 15, title: 'Pattern Seeker' },
  { min: 20, title: 'Signal Engineer' },
  { min: 30, title: 'Chain Reactor' },
  { min: 40, title: 'Circuit Architect' },
  { min: 50, title: 'Systems Thinker' },
  { min: 65, title: 'Logic Adept' },
  { min: 80, title: 'Logic Master' },
  { min: 100, title: 'Grand Logician' },
  { min: 125, title: 'Cascade Sage' },
  { min: 150, title: 'Mind Engineer' },
  { min: 200, title: 'Master Architect' },
  { min: 250, title: 'Paradox Breaker' },
  { min: 300, title: 'Oracle' },
  { min: 400, title: 'Grandmaster' },
  { min: 500, title: 'Legend' },
  { min: 750, title: 'Mythic' },
  { min: 1000, title: 'Toggl Immortal' },
];

// Each rank adds +0.1× to every star earned: Novice 1.0× … Toggl Immortal 3.0×.
const withMult = (r, i) => ({ ...r, mult: Math.round((1 + i * 0.1) * 10) / 10 });

export function rankFor(levelsCleared) {
  let i = 0;
  while (i + 1 < RANKS.length && levelsCleared >= RANKS[i + 1].min) i++;
  const next = RANKS[i + 1] ? withMult(RANKS[i + 1], i + 1) : null;
  return { ...withMult(RANKS[i], i), next };
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