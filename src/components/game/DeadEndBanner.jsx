import React from 'react';

export default function DeadEndBanner({ reason, canUndo, matched, total }) {
  return (
    <div className="mt-4 px-4 py-3 rounded-2xl bg-card border border-border shadow-sm text-xs font-semibold text-muted-foreground leading-relaxed">
      {matched != null && matched > 0 && (
        <div className="mb-1 text-[#00A38C] font-extrabold">
          {matched} / {total} matched
        </div>
      )}
      <div className="flex items-start gap-2">
        <span className="text-foreground font-bold">No solution from here.</span>
        <span className="text-muted-foreground">{canUndo ? 'Undo your last move or reset.' : 'Reset to try again.'}</span>
      </div>
    </div>
  );
}