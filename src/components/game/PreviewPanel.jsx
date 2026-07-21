import React from 'react';
import { Eye } from 'lucide-react';

export default function PreviewPanel({ preview }) {
  if (!preview) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-48px)] max-w-sm bg-foreground text-background rounded-2xl shadow-xl px-4 py-3 pointer-events-none">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1.5">
        <Eye className="w-3.5 h-3.5" /> If you press {preview.id}
      </div>
      <div className="space-y-0.5 text-xs font-bold">
        {preview.lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}