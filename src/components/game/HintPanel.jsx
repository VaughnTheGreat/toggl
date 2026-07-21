import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function HintPanel({ hint, hintLevel, onRequest }) {
  return (
    <div className="mt-3">
      {hint && (
        <div className="mb-2 px-3 py-2.5 rounded border border-[#00E5C8]/30 bg-[#00E5C8]/5 text-xs text-[#c9efe8] leading-relaxed">
          {hint}
        </div>
      )}
      <button
        onClick={onRequest}
        disabled={hintLevel >= 4}
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#6B7280] disabled:opacity-40"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        Hint {hintLevel > 0 ? `${hintLevel}/4` : ''}
      </button>
    </div>
  );
}