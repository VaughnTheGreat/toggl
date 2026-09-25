import { Power, ArrowRightLeft, Diamond, Lock, Copy, Repeat, ArrowLeftRight, Zap, Link2, Clock } from 'lucide-react';

// Plain-language explanation + a concrete example for every rule type.
export const RULE_INFO = {
  toggle: { Icon: Power, name: 'Toggle', desc: 'Pressing it flips only this switch. Nothing else changes.', example: 'A is OFF → press A → A is ON.' },
  linked: { Icon: ArrowRightLeft, name: 'Linked', desc: 'Pressing it flips this switch AND the switches wired to it.', example: 'A is linked to B. Press A → both A and B flip.' },
  conditional: { Icon: Diamond, name: 'Conditional', desc: 'Only pressable while another switch is in a certain state. A dimmed amber icon means it is blocked right now.', example: '"Only works while B is OFF" — turn B OFF first, then press.' },
  lock: { Icon: Lock, name: 'Lock', desc: 'Flips this switch, then freezes another switch permanently. A frozen switch can never change again.', example: 'B freezes A. Get A right BEFORE you press B.' },
  copy: { Icon: Copy, name: 'Copy', desc: 'Sets this switch to the same state as its source. If they already match, nothing happens.', example: 'B copies A. A is ON → press B → B becomes ON.' },
  inverse: { Icon: Repeat, name: 'Inverse', desc: 'Flips every other switch on the board. This switch itself stays the same.', example: 'Press C → A, B, D… all flip. C does not.' },
  swap: { Icon: ArrowLeftRight, name: 'Swap', desc: 'This switch and its partner trade states. If both are the same, nothing happens.', example: 'A is ON, B is OFF → press A → A is OFF, B is ON.' },
  oneshot: { Icon: Zap, name: 'One-shot', desc: 'Flips this switch, then it is used up. You get exactly one press.', example: 'Press it only when you are sure.' },
  chain: { Icon: Link2, name: 'Chain', desc: "Flips this switch, then also performs another switch's action — effects can cascade.", example: "A chains to B (linked to C). Press A → A flips, then B and C flip." },
  delay: { Icon: Clock, name: 'Delay', desc: 'Flips this switch now, and a second switch a moment later. The pending switch pulses amber until it flips.', example: 'Press A → A flips now, B flips about a second later.' },
};