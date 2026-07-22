import React, { useState } from 'react';
import { BookOpen, Power, ArrowRightLeft, Diamond, Lock, Copy, Repeat, ArrowLeftRight, Zap, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RULES = {
  toggle: { Icon: Power, name: 'Toggle', desc: 'Flips its own state on or off.' },
  linked: { Icon: ArrowRightLeft, name: 'Linked', desc: 'Flips itself and the switches connected to it.' },
  conditional: { Icon: Diamond, name: 'Conditional', desc: 'Only works when another switch is in the required state.' },
  lock: { Icon: Lock, name: 'Lock', desc: 'Flips itself and locks other switches in place permanently.' },
  copy: { Icon: Copy, name: 'Copy', desc: 'Becomes whatever its source switch currently is.' },
  inverse: { Icon: Repeat, name: 'Inverse', desc: 'Flips every switch on the board except itself.' },
  swap: { Icon: ArrowLeftRight, name: 'Swap', desc: 'Trades states with its partner switch.' },
  oneshot: { Icon: Zap, name: 'One-shot', desc: 'Flips itself once, then locks forever.' },
  chain: { Icon: Link2, name: 'Chain', desc: "Flips itself, then fires another switch's rule — causing cascades." },
};

export default function RuleGuide({ buttons, revealed = {} }) {
  const [open, setOpen] = useState(false);
  const types = [...new Set(
    buttons.filter((b) => !b.mystery || revealed[b.id]).map((b) => b.rule.type)
  )].filter((t) => RULES[t]);
  const hasMystery = buttons.some((b) => b.mystery && !revealed[b.id]);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Rule guide"
        className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0 active:scale-95 transition-transform">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base">Rules in this level</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2.5">
            {types.map((t) => {
              const { Icon, name, desc } = RULES[t];
              return (
                <div key={t} className="flex items-start gap-3 rounded-2xl bg-muted/60 px-3.5 py-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#00C2A8]/10 text-[#00A38C] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{name}</span>
                    <span className="block text-[11px] font-semibold text-muted-foreground">{desc}</span>
                  </span>
                </div>
              );
            })}
            {hasMystery && (
              <div className="text-[11px] font-semibold text-violet-500 dark:text-violet-400 px-1">
                Some switches hide their rule — press them to discover it.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}