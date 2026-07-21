import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Lock } from 'lucide-react';
import Screen from '@/components/game/Screen';
import { LEVELS, TIERS } from '@/lib/game/levels';
import { getStars, getUnlocked } from '@/lib/game/storage';

export default function Levels() {
  const navigate = useNavigate();
  const stars = getStars();
  const unlocked = getUnlocked();

  return (
    <Screen>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" aria-label="Back to menu" className="p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold uppercase tracking-widest">Levels</h1>
      </div>
      {TIERS.map((tier) => (
        <div key={tier} className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#00E5C8] mb-3">{tier}</div>
          <div className="grid grid-cols-1 gap-2">
            {LEVELS.filter((l) => l.tier === tier).map((level) => {
              const isLocked = level.id > unlocked;
              const s = stars[level.id] || 0;
              return (
                <button
                  key={level.id}
                  disabled={isLocked}
                  onClick={() => navigate(`/play?level=${level.id}`)}
                  className={`flex items-center gap-3 px-4 py-3 rounded border text-left ${
                    isLocked ? 'border-[#1E2128]/50 text-[#3a4150]' : 'border-[#1E2128] bg-[#0E1116] active:bg-[#12161d]'
                  }`}
                >
                  <span className="text-xs w-8 text-[#6B7280]">{String(level.id).padStart(2, '0')}</span>
                  <span className="flex-1 text-sm">{level.name}</span>
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <span className="flex gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= s ? 'text-[#00E5C8] fill-[#00E5C8]' : 'text-[#2A2F3E]'}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Screen>
  );
}