// BFS state-space solver. Respects locks and conditions. Returns minimum-move solution.
import { canPress, applyPress } from './ruleEngine';
import { isSolved } from './objective';

export function solveFrom(states, locks, level, maxDepth = 16) {
  const key = (s, l) => level.buttons.map((b) => `${s[b.id] ? 1 : 0}${l[b.id] ? 1 : 0}`).join('');
  const matches = (s) => isSolved(s, level);
  if (matches(states)) return { solvable: true, minMoves: 0, path: [] };

  const visited = new Set([key(states, locks)]);
  let frontier = [{ s: states, l: locks, path: [] }];

  for (let depth = 0; depth < maxDepth; depth++) {
    const next = [];
    for (const node of frontier) {
      for (const b of level.buttons) {
        if (!canPress(node.s, node.l, b)) continue;
        const res = applyPress(node.s, node.l, b);
        const k = key(res.states, res.locks);
        if (visited.has(k)) continue;
        visited.add(k);
        const path = [...node.path, b.id];
        if (matches(res.states)) return { solvable: true, minMoves: path.length, path };
        next.push({ s: res.states, l: res.locks, path });
      }
    }
    frontier = next;
    if (!frontier.length) break;
  }
  return { solvable: false, minMoves: -1, path: null };
}

export function solveLevel(level) {
  return solveFrom(level.start, {}, level);
}

// Validates every level at startup — logs warnings for unsolvable or mislabeled levels.
export function validateAllLevels(levels) {
  for (const level of levels) {
    const res = solveLevel(level);
    if (!res.solvable) {
      console.warn(`[LogicGrid] Level ${level.id} "${level.name}" is NOT solvable!`);
    } else if (res.minMoves !== level.optimalMoves) {
      console.warn(
        `[LogicGrid] Level ${level.id} "${level.name}": optimalMoves=${level.optimalMoves} but solver found ${res.minMoves} (${res.path.join(' → ')})`
      );
    }
  }
}