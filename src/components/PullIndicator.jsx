import React from 'react';
import { Loader2 } from 'lucide-react';

// Small spinner that drops down from the top while pulling to refresh.
export default function PullIndicator({ pull, refreshing, ready }) {
  if (!pull && !refreshing) return null;
  return (
    <div
      className="fixed left-0 right-0 z-30 flex justify-center pointer-events-none"
      style={{ top: `calc(env(safe-area-inset-top) + ${pull - 36}px)` }}
    >
      <div className="w-9 h-9 rounded-full bg-card shadow-md flex items-center justify-center">
        <Loader2
          className={`w-4 h-4 text-[#00A38C] ${refreshing ? 'animate-spin' : ''} ${ready || refreshing ? 'opacity-100' : 'opacity-50'}`}
          style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
        />
      </div>
    </div>
  );
}