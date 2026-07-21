import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function HintPanel({ hint, hintLevel, onRequest }) {
  return (
    <div className="mt-3">
      {hint && (
        <div className="mb-2 px-4 py-3 rounded-2xl bg-[#FFF7E6] border border-amber-200 text-xs font-medium text-[#8a6d1f] leading-relaxed">
          {hint}
        </div>
      )}
      <button
        onClick={onRequest}
        disabled={hintLevel >= 4}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white shadow-sm text-[11px] font-bold uppercase tracking-widest text-[#8A91A5] disabled:opacity-40 active:scale-95 transition-transform"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        Hint {hintLevel > 0 ? `${hintLevel}/4` : ''}
      </button>
    </div>
  );
}