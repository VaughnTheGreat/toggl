import React, { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { hasSeenNoUndo, markNoUndoSeen } from '@/lib/game/storage';

// One-time heads-up the first time a player reaches a level without Undo.
export default function NoUndoNotice() {
  const [open, setOpen] = useState(() => !hasSeenNoUndo());
  const close = () => { markNoUndoSeen(); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Undo2 className="w-4 h-4 text-amber-500" /> From here on: no Undo
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
          Every press is final. Read the rules, predict what will happen, then commit. You can still Reset to start the level over.
        </p>
        <button onClick={close} className="w-full py-3 rounded-full bg-[#00C2A8] text-white font-extrabold text-xs tracking-widest uppercase active:scale-[0.98] transition-transform">
          I'm ready
        </button>
      </DialogContent>
    </Dialog>
  );
}