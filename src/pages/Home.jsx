import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/game/BottomNav';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getPathLevel } from '@/lib/game/levelPath';
import { getUnlocked } from '@/lib/game/storage';
import DailyCard from '@/components/game/DailyCard';

export default function Home() {
  useEffect(() => { validateAllLevels(LEVELS); }, []);
  const current = getUnlocked();
  const level = getPathLevel(current);

  return (
    <Screen className="min-h-screen flex flex-col pb-24">
      <div className="flex-[1.2]" />

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Togg<span className="text-[#00A38C]">l</span>
        </h1>
        <div className="text-2xl font-extrabold text-[#00A38C] mt-3">Level {current}</div>
        <div className="text-sm font-bold text-sky-500 dark:text-sky-400 mt-1">{level.tier}</div>
      </div>

      <div className="flex-1" />

      <Link
        to={`/play?level=${current}`}
        className="block w-full max-w-xs mx-auto py-4 rounded-full bg-gradient-to-b from-[#00CDAF] to-[#00A88F] text-white text-center text-lg font-extrabold shadow-[0_8px_24px_rgba(0,194,168,0.45)] active:scale-[0.97] transition-transform"
      >
        Play
      </Link>

      <div className="mt-6">
        <DailyCard />
      </div>

      <BottomNav active="home" />
    </Screen>
  );
}