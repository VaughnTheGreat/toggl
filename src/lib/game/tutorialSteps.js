const T = (id) => ({ id, rule: { type: 'toggle' } });
const L = (id, targets) => ({ id, rule: { type: 'linked', targets } });
const C = (id, button, state) => ({ id, rule: { type: 'conditional', condition: { button, state } } });
const K = (id, locks) => ({ id, rule: { type: 'lock', locks } });
const P = (id, source) => ({ id, rule: { type: 'copy', source } });

export const TUTORIAL_STEPS = [
  {
    title: 'The Switch',
    text: 'Every switch is ON or OFF. Tap switch A to flip it and match the target.',
    principle: 'Every switch holds a binary state. Your job is to make the system match the target exactly.',
    buttons: [T('A')],
    start: { A: false },
    target: { A: true },
  },
  {
    title: 'Connections',
    text: 'Switches can be wired together. Pressing A also flips B. Get both ON.',
    principle: 'One action can change multiple states at once. Watch the connection lines to see effects propagate.',
    buttons: [L('A', ['A', 'B']), T('B')],
    start: { A: false, B: false },
    target: { A: true, B: true },
  },
  {
    title: 'Order Matters',
    text: 'B copies the current state of A. To get both ON, A must be ON before you press B.',
    principle: 'The same actions in a different order produce a different result. Sequence is everything.',
    buttons: [T('A'), P('B', 'A')],
    start: { A: false, B: false },
    target: { A: true, B: true },
  },
  {
    title: 'Conditions',
    text: 'A can only be pressed while B is OFF. Turn A on first — then deal with B.',
    principle: 'Some actions are only available under certain conditions. A dimmed switch is currently blocked.',
    buttons: [C('A', 'B', false), T('B')],
    start: { A: false, B: false },
    target: { A: true, B: true },
  },
  {
    title: 'Locks',
    text: 'Pressing B permanently locks A. Make sure A is correct before sealing it.',
    principle: 'Some actions permanently remove options. Irreversible moves must come after everything they depend on.',
    buttons: [T('A'), K('B', ['A'])],
    start: { A: false, B: false },
    target: { A: true, B: true },
  },
  {
    title: 'The Full Machine',
    text: 'A toggles itself and B. C locks A when pressed. Plan the whole sequence before you touch anything.',
    principle: 'Observe the system. Predict the consequences. Choose the sequence. Commit.',
    buttons: [L('A', ['A', 'B']), C('B', 'C', false), K('C', ['A'])],
    start: { A: false, B: true, C: false },
    target: { A: true, B: false, C: true },
  },
];