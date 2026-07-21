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
        <Link to="/" aria-label="Back to menu" className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-extrabold">All Levels</h1>
      </div>
      {TIERS.map((tier) => (
        <div key={tier} className="mb-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00A38C] mb-3">{tier}</div>
          <div className="grid grid-cols-1 gap-2.5">
            {LEVELS.filter((l) => l.tier === tier).map((level) => {
              const isLocked = level.id > unlocked;
              const s = stars[level.id] || 0;
              return (
                <button
                  key={level.id}
                  disabled={isLocked}
                  onClick={() => navigate(`/play?level=${level.id}`)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-transform ${
                    isLocked ? 'bg-card/50 text-[#B4BACA]' : 'bg-card shadow-sm active:scale-[0.98]'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-extrabold ${
                    isLocked ? 'bg-muted' : s > 0 ? 'bg-[#00C2A8]/10 text-[#00A38C]' : 'bg-muted text-muted-foreground'
                  }`}>{String(level.id).padStart(2, '0')}</span>
                  <span className="flex-1 text-sm font-bold">{level.name}</span>
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <span className="flex gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <Star key={n} className={`w-4 h-4 ${n <= s ? 'text-[#F5B21B] fill-[#F5B21B]' : 'text-muted fill-muted'}`} />
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