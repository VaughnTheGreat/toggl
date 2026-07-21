import React from 'react';
import { useLocation } from 'react-router-dom';
import { LEVELS } from '@/lib/game/levels';
import PuzzleBoard from '@/components/game/PuzzleBoard';

export default function Puzzle() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const levelId = parseInt(params.get('level') || '1', 10);
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
  return <PuzzleBoard key={level.id} level={level} />;
}