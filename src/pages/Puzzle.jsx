import React, { useMemo } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getPathLevel } from '@/lib/game/levelPath';
import { generateLevel, generateDailyLevel } from '@/lib/game/generator';
import { todayKey, isDailyDone, getUnlocked, getEndlessLevel } from '@/lib/game/storage';
import PuzzleBoard from '@/components/game/PuzzleBoard';

export default function Puzzle() {
  const location = useLocation();
  const result = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('daily')) {
      // One completed run per day.
      if (isDailyDone()) return { redirect: '/' };
      return { level: generateDailyLevel(todayKey()) };
    }
    const endless = params.get('endless');
    if (endless) {
      const n = Math.max(1, parseInt(endless, 10) || 1);
      // Can't jump past the furthest endless level reached.
      if (n > getEndlessLevel()) return { redirect: `/play?endless=${getEndlessLevel()}` };
      return { level: generateLevel(n) };
    }
    const levelId = Math.max(1, parseInt(params.get('level') || '1', 10) || 1);
    // Locked levels can't be opened by editing the address.
    if (levelId > getUnlocked()) return { redirect: `/play?level=${getUnlocked()}` };
    return { level: getPathLevel(levelId) };
  }, [location.search]);

  if (result.redirect) return <Navigate to={result.redirect} replace />;
  return <PuzzleBoard key={location.search} level={result.level} />;
}