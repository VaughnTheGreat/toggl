import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LEVELS } from '@/lib/game/levels';
import { generateLevel, generateCustomLevel } from '@/lib/game/generator';
import PuzzleBoard from '@/components/game/PuzzleBoard';

export default function Puzzle() {
  const location = useLocation();
  const level = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const endless = params.get('endless');
    if (endless) return generateLevel(Math.max(1, parseInt(endless, 10) || 1));
    const custom = params.get('custom');
    if (custom) return generateCustomLevel(custom, Math.max(1, parseInt(params.get('seed'), 10) || 1));
    const levelId = parseInt(params.get('level') || '1', 10);
    return LEVELS.find((l) => l.id === levelId) || LEVELS[0];
  }, [location.search]);
  return <PuzzleBoard key={level.id} level={level} />;
}