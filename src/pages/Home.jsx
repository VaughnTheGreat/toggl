import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getStars } from '@/lib/game/storage';

export default function Home() {
  useEffect(() => { validateAllLevels(LEVELS); }, []);
  const totalStars = Object.values(getStars()).reduce((a, b) => a + b, 0);

  return (
    <Screen className="flex flex-col justify-center min-h-screen">
      <div className="mb-16">
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#00E5C8] mb-3">System state controller</div>
        <h1 className="text-4xl font-bold tracking-tight">
          LOGIC<span className="text-[#00E5C8]">GRID</span>
        </h1>
        <p className="text-xs text-[#6B7280] mt-3 leading-relaxed">
          Every switch is part of a system.<br />Change the state. Reach the target.
        </p>
      </div>
      <nav className="flex flex-col gap-3">
        <Link to="/levels" className="flex items-center justify-between px-4 py-4 rounded border border-[#1E2128] bg-[#0E1116] active:bg-[#12161d]">
          <span className="text-sm uppercase tracking-widest font-bold">Campaign</span>
          <span className="text-[11px] text-[#00E5C8]">★ {totalStars}/90</span>
        </Link>
        <Link to="/tutorial" className="px-4 py-4 rounded border border-[#1E2128] bg-[#0E1116] text-sm uppercase tracking-widest active:bg-[#12161d]">
          Tutorial
        </Link>
        <div className="px-4 py-4 rounded border border-[#1E2128]/60 text-sm uppercase tracking-widest text-[#3a4150] flex justify-between">
          <span>Daily Puzzle</span><span className="text-[10px] normal-case tracking-normal">coming soon</span>
        </div>
        <Link to="/settings" className="px-4 py-4 rounded border border-[#1E2128] bg-[#0E1116] text-sm uppercase tracking-widest active:bg-[#12161d]">
          Settings
        </Link>
      </nav>
    </Screen>
  );
}