// 30 handcrafted campaign levels. Every level is verified solvable by the BFS solver.
// Rule helpers keep definitions compact and consistent.
const T = (id) => ({ id, rule: { type: 'toggle' } });
const L = (id, targets) => ({ id, rule: { type: 'linked', targets } });
const C = (id, button, state) => ({ id, rule: { type: 'conditional', condition: { button, state } } });
const K = (id, locks) => ({ id, rule: { type: 'lock', locks } });
const P = (id, source) => ({ id, rule: { type: 'copy', source } });
const S = (ids, bits) => Object.fromEntries(ids.split('').map((id, i) => [id, bits[i] === '1']));

export const LEVELS = [
  // ——— INTRO (1–5): standard toggles ———
  { id: 1, name: 'First Light', tier: 'Intro', buttons: [T('A')], start: S('A', '0'), target: S('A', '1'), optimalMoves: 1, moveLimit: 2, undoAllowed: true },
  { id: 2, name: 'Two Lights', tier: 'Intro', buttons: [T('A'), T('B')], start: S('AB', '00'), target: S('AB', '11'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },
  { id: 3, name: 'Inversion', tier: 'Intro', buttons: [T('A'), T('B'), T('C')], start: S('ABC', '101'), target: S('ABC', '010'), optimalMoves: 3, moveLimit: 4, undoAllowed: true },
  { id: 4, name: 'Selective', tier: 'Intro', buttons: [T('A'), T('B'), T('C')], start: S('ABC', '010'), target: S('ABC', '111'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },
  { id: 5, name: 'Handover', tier: 'Intro', buttons: [T('A'), T('B'), T('C')], start: S('ABC', '001'), target: S('ABC', '100'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },

  // ——— EASY (6–10): linked toggles ———
  { id: 6, name: 'Linked', tier: 'Easy', buttons: [L('A', ['A', 'B']), T('B')], start: S('AB', '00'), target: S('AB', '11'), optimalMoves: 1, moveLimit: 2, undoAllowed: true },
  { id: 7, name: 'Overshoot', tier: 'Easy', buttons: [L('A', ['A', 'B']), T('B')], start: S('AB', '00'), target: S('AB', '10'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },
  { id: 8, name: 'Chain', tier: 'Easy', buttons: [L('A', ['A', 'B']), L('B', ['B', 'C']), T('C')], start: S('ABC', '000'), target: S('ABC', '111'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },
  { id: 9, name: 'Confluence', tier: 'Easy', buttons: [L('A', ['A', 'C']), L('B', ['B', 'C']), T('C')], start: S('ABC', '000'), target: S('ABC', '110'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },
  { id: 10, name: 'Cascade', tier: 'Easy', buttons: [L('A', ['A', 'B']), L('B', ['B', 'C']), L('C', ['C', 'D']), T('D')], start: S('ABCD', '0000'), target: S('ABCD', '1001'), optimalMoves: 3, moveLimit: 4, undoAllowed: true },

  // ——— MEDIUM (11–17): conditional buttons ———
  { id: 11, name: 'Permission', tier: 'Medium', buttons: [T('A'), C('B', 'A', true), T('C')], start: S('ABC', '001'), target: S('ABC', '110'), optimalMoves: 3, moveLimit: 4, undoAllowed: true },
  { id: 12, name: 'The Gate', tier: 'Medium', buttons: [L('A', ['A', 'B']), C('B', 'C', false), T('C')], start: S('ABC', '010'), target: S('ABC', '101'), optimalMoves: 2, moveLimit: 3, undoAllowed: true },
  { id: 13, name: 'Ladder', tier: 'Medium', buttons: [C('A', 'B', true), T('B'), C('C', 'A', true)], start: S('ABC', '000'), target: S('ABC', '111'), optimalMoves: 3, moveLimit: 4, undoAllowed: true },
  { id: 14, name: 'Doorway', tier: 'Medium', buttons: [L('A', ['A', 'B']), C('B', 'A', true), C('C', 'B', true), T('D')], start: S('ABCD', '0001'), target: S('ABCD', '1110'), optimalMoves: 3, moveLimit: 4, undoAllowed: true },
  { id: 15, name: 'First Move', tier: 'Medium', buttons: [C('A', 'B', false), L('B', ['B', 'C']), T('C')], start: S('ABC', '000'), target: S('ABC', '110'), optimalMoves: 3, moveLimit: 4, undoAllowed: true },
  { id: 16, name: 'Branches', tier: 'Medium', buttons: [L('A', ['A', 'B']), L('B', ['B', 'C']), C('C', 'A', true), L('D', ['D', 'E']), T('E')], start: S('ABCDE', '00000'), target: S('ABCDE', '10011'), optimalMoves: 4, moveLimit: 5, undoAllowed: true },
  { id: 17, name: 'Before & After', tier: 'Medium', buttons: [L('A', ['A', 'B']), C('B', 'A', true), T('C'), L('D', ['D', 'E']), C('E', 'D', false)], start: S('ABCDE', '00000'), target: S('ABCDE', '10110'), optimalMoves: 5, moveLimit: 6, undoAllowed: true },

  // ——— HARD (18–24): locks and copies, no undo ———
  { id: 18, name: 'Point of No Return', tier: 'Hard', buttons: [T('A'), K('B', ['A']), T('C')], start: S('ABC', '000'), target: S('ABC', '111'), optimalMoves: 3, moveLimit: 4, undoAllowed: false },
  { id: 19, name: 'Mirror', tier: 'Hard', buttons: [T('A'), P('B', 'A'), T('C')], start: S('ABC', '001'), target: S('ABC', '110'), optimalMoves: 3, moveLimit: 4, undoAllowed: false },
  { id: 20, name: 'Seal the Door', tier: 'Hard', buttons: [T('A'), K('B', ['C']), T('C'), P('D', 'C')], start: S('ABCD', '0000'), target: S('ABCD', '1111'), optimalMoves: 4, moveLimit: 5, undoAllowed: false },
  { id: 21, name: 'Reflection', tier: 'Hard', buttons: [L('A', ['A', 'B']), T('B'), P('C', 'B'), C('D', 'C', true)], start: S('ABCD', '0000'), target: S('ABCD', '1011'), optimalMoves: 4, moveLimit: 5, undoAllowed: false },
  { id: 22, name: 'Decoy', tier: 'Hard', buttons: [T('A'), K('B', ['A']), L('C', ['C', 'D']), C('D', 'B', true), P('E', 'D')], start: S('ABCDE', '00000'), target: S('ABCDE', '11011'), optimalMoves: 4, moveLimit: 5, undoAllowed: false },
  { id: 23, name: 'Six Circuit', tier: 'Hard', buttons: [L('A', ['A', 'B']), L('B', ['B', 'C']), K('C', ['D']), T('D'), P('E', 'C'), C('F', 'D', true)], start: S('ABCDEF', '000100'), target: S('ABCDEF', '101111'), optimalMoves: 4, moveLimit: 5, undoAllowed: false },
  { id: 24, name: 'Window', tier: 'Hard', buttons: [K('A', ['B']), L('B', ['B', 'C']), C('C', 'A', true), P('D', 'A'), L('E', ['E', 'F']), T('F')], start: S('ABCDEF', '000000'), target: S('ABCDEF', '111110'), optimalMoves: 5, moveLimit: 6, undoAllowed: false },

  // ——— EXPERT (25–30): all rule types, no undo ———
  { id: 25, name: 'The Machine', tier: 'Expert', buttons: [L('A', ['A', 'B']), C('B', 'C', false), K('C', ['A']), P('D', 'C')], start: S('ABCD', '0100'), target: S('ABCD', '1010'), optimalMoves: 2, moveLimit: 3, undoAllowed: false },
  { id: 26, name: 'Sequence Lock', tier: 'Expert', buttons: [L('A', ['A', 'C']), K('B', ['C']), T('C'), P('D', 'B'), C('E', 'B', true)], start: S('ABCDE', '00100'), target: S('ABCDE', '11011'), optimalMoves: 4, moveLimit: 5, undoAllowed: false },
  { id: 27, name: 'Echo Chamber', tier: 'Expert', buttons: [L('A', ['A', 'B']), C('B', 'A', true), L('C', ['C', 'D']), K('D', ['B']), P('E', 'D'), C('F', 'E', true)], start: S('ABCDEF', '000000'), target: S('ABCDEF', '101111'), optimalMoves: 5, moveLimit: 6, undoAllowed: false },
  { id: 28, name: 'Seven', tier: 'Expert', buttons: [T('A'), L('B', ['B', 'C']), C('C', 'A', true), K('D', ['A']), P('E', 'C'), L('F', ['F', 'G']), C('G', 'F', true)], start: S('ABCDEFG', '0000000'), target: S('ABCDEFG', '1101110'), optimalMoves: 7, moveLimit: 8, undoAllowed: false },
  { id: 29, name: 'Precise', tier: 'Expert', buttons: [L('A', ['A', 'B']), K('B', ['C']), L('C', ['C', 'D']), C('D', 'E', true), T('E'), P('F', 'E'), C('G', 'D', false)], start: S('ABCDEFG', '0000000'), target: S('ABCDEFG', '1110101'), optimalMoves: 5, moveLimit: 5, undoAllowed: false },
  { id: 30, name: 'State of the System', tier: 'Expert', buttons: [L('A', ['A', 'B']), C('B', 'C', false), K('C', ['A']), P('D', 'C'), L('E', ['E', 'F']), C('F', 'E', true), K('G', ['H']), T('H')], start: S('ABCDEFGH', '01000000'), target: S('ABCDEFGH', '10111011'), optimalMoves: 7, moveLimit: 7, undoAllowed: false },
];

export const TIERS = ['Intro', 'Easy', 'Medium', 'Hard', 'Expert'];