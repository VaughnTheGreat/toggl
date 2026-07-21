import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getPathLevel } from '@/lib/game/levelPath';
import { generateLevel, generateCustomLevel, generateDailyLevel } from '@/lib/game/generator';
import { todayKey } from '@/lib/game/storage';
import PuzzleBoard from '@/components/game/PuzzleBoard';

export default function Puzzle() {
  const location = useLocation();
  const level = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('daily')) return generateDailyLevel(todayKey());
    const endless = params.get('endless');
    if (endless) return generateLevel(Math.max(1, parseInt(endless, 10) || 1));
    const custom = params.get('custom');
    if (custom) return generateCustomLevel(custom, Math.max(1, parseInt(params.get('seed'), 10) || 1));
    const levelId = Math.max(1, parseInt(params.get('level') || '1', 10) || 1);
    return getPathLevel(levelId);
  }, [location.search]);
  return <PuzzleBoard key={level.id} level={level} />;
}