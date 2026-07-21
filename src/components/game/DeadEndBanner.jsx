import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeadEndBanner({ reason, canUndo, matched, total }) {
  return (
    <div className="mt-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-semibold text-red-700 dark:text-red-300 leading-relaxed">
      <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-[0.2em] text-[10px] mb-1">
        <AlertTriangle className="w-3.5 h-3.5" /> Dead end
      </div>
      {matched != null && matched > 0 && (
        <div className="mb-1">
          You matched <span className="font-extrabold">{matched} of {total}</span> targets — that knowledge carries over.
        </div>
      )}
      {reason} {canUndo ? 'Undo or reset to re-calibrate.' : 'Reset to re-calibrate.'}
    </div>
  );
}