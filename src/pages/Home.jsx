import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import BottomNav from '@/components/game/BottomNav';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getPathLevel } from '@/lib/game/levelPath';
import { getStars, getUnlocked } from '@/lib/game/storage';
import DailyCard from '@/components/game/DailyCard';

export default function Home() {
  useEffect(() => { validateAllLevels(LEVELS); }, []);
  const totalStars = Object.values(getStars()).reduce((a, b) => a + b, 0);
  const current = getUnlocked();
  const level = getPathLevel(current);

  return (
    <Screen className="pb-28">
      <div className="flex items-center justify-end mb-8">
        <div className="flex items-center gap-1.5 bg-card rounded-full shadow-sm px-4 py-2">
          <Star className="w-4 h-4 text-[#F5B21B] fill-[#F5B21B]" />
          <span className="text-sm font-extrabold">{totalStars}</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Togg<span className="text-[#00A38C]">l</span>
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">Observe. Predict. Commit.</p>
      </div>

      <div className="text-center mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Level</div>
        <div className="text-6xl font-extrabold tabular-nums leading-tight">{current}</div>
        <div className="text-xs font-semibold text-muted-foreground mt-1">{level.name}</div>
      </div>

      <Link
        to={`/play?level=${current}`}
        className="mx-auto mb-10 w-36 h-36 rounded-full bg-gradient-to-b from-[#00CDAF] to-[#00A88F] text-white flex items-center justify-center text-xl font-extrabold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,194,168,0.5)] active:scale-95 transition-transform"
      >
        Play
      </Link>

      <DailyCard />

      <Link to="/tutorial" className="block text-center text-xs font-bold text-muted-foreground mt-2 py-2">
        How to play
      </Link>

      <BottomNav active="home" />
    </Screen>
  );
}