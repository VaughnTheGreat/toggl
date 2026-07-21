// One continuous path: handcrafted levels 1–30, then generated levels forever.
import { LEVELS } from './levels';
import { generateContinuationLevel } from './generator';

export function getPathLevel(n) {
  const num = Math.max(1, n || 1);
  return LEVELS.find((l) => l.id === num) || generateContinuationLevel(Math.max(31, num));
}