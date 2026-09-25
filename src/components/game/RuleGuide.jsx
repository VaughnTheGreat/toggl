import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RULE_INFO } from '@/lib/game/ruleInfo';
import { getSeenRules, markRulesSeen } from '@/lib/game/storage';
import RuleCard from '@/components/game/RuleCard';

export default function RuleGuide({ buttons, revealed = {} }) {
  const [open, setOpen] = useState(false);
  const [newTypes, setNewTypes] = useState([]);
  const types = [...new Set(
    buttons.filter((b) => !b.mystery || revealed[b.id]).map((b) => b.rule.type)
  )].filter((t) => RULE_INFO[t]);
  const hasMystery = buttons.some((b) => b.mystery && !revealed[b.id]);

  // First time a rule type appears, open the guide automatically.
  useEffect(() => {
    const seen = getSeenRules();
    const unseen = types.filter((t) => !seen.includes(t));
    if (unseen.length) {
      setNewTypes(unseen);
      setOpen(true);
      markRulesSeen(unseen);
    }
  }, [types.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button onClick={() => { setNewTypes([]); setOpen(true); }} aria-label="Rule guide"
        className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0 active:scale-95 transition-transform">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2.5rem)] max-w-sm rounded-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden p-5">
          <DialogHeader>
            <DialogTitle className="text-base">{newTypes.length ? 'New rule unlocked' : 'Rules in this level'}</DialogTitle>
          </DialogHeader>
          <div className="text-[11px] font-semibold text-muted-foreground -mt-1">
            Each switch shows its rule under its letter. Tap to press. Match the target to win.
          </div>
          <div className="flex flex-col gap-2.5">
            {(newTypes.length ? newTypes : types).map((t) => (
              <RuleCard key={t} info={RULE_INFO[t]} isNew={newTypes.includes(t)} />
            ))}
            {hasMystery && (
              <div className="text-[11px] font-semibold text-violet-500 dark:text-violet-400 px-1">
                Some switches hide their rule (purple ?) — press one to reveal what it does.
              </div>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="w-full py-3 rounded-full bg-[#00C2A8] text-white font-extrabold text-xs tracking-widest uppercase active:scale-[0.98] transition-transform">
            Got it
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}