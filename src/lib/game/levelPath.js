// One continuous path: handcrafted levels 1–30, then generated levels forever.
import { LEVELS } from './levels';
import { generateContinuationLevel, MODIFIERS } from './generator';

export function getPathLevel(n) {
  const num = Math.max(1, n || 1);
  return LEVELS.find((l) => l.id === num) || generateContinuationLevel(Math.max(31, num));
}

// Next twist block (modifiers rotate every 5 levels starting at 51).
export function nextTwist(n) {
  const start = n < 51 ? 51 : 51 + (Math.floor((n - 51) / 5) + 1) * 5;
  const label = MODIFIERS[Math.floor((start - 51) / 5) % MODIFIERS.length].label;
  return { level: start, label, away: start - n };
}