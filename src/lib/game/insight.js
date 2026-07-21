// Prediction previews, dead-end explanations, and elegance ranks. Pure — no UI.
import { applyPress } from './ruleEngine';

// Ordered human-readable consequences of pressing a button.
export function previewPress(states, locks, button) {
  const res = applyPress(states, locks, button);
  const lines = res.changed.map((id) =>
    res.locks[id] && !locks[id]
      ? `${id} will become locked`
      : `${id} will turn ${res.states[id] ? 'ON' : 'OFF'}`
  );
  return lines.length ? lines : ['Nothing will change'];
}

// Why the current state can no longer reach the target.
export function deadEndReason(states, locks, level) {
  const wrong = level.buttons.filter((b) => locks[b.id] && !!states[b.id] !== !!level.target[b.id]);
  if (wrong.length) {
    const ids = wrong.map((b) => b.id).join(' and ');
    return `${ids} ${wrong.length > 1 ? 'are' : 'is'} locked in the wrong position, so the target can no longer be reached.`;
  }
  return 'No sequence of presses can reach the target from here.';
}

// Elegance rank — rewards thinking before acting, not just completion.
export function solveRank({ moves, undos, hints, resets }, level) {
  if (moves === level.optimalMoves && !undos && !hints && !resets) return 'Perfect Prediction';
  if (moves <= level.optimalMoves) return 'Optimal';
  if (moves <= level.moveLimit) return 'Efficient';
  return 'Solved';
}