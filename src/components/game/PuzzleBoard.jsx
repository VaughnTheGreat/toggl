import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2, RotateCcw } from 'lucide-react';
import Screen from '@/components/game/Screen';
import TargetPanel from '@/components/game/TargetPanel';
import SystemPanel from '@/components/game/SystemPanel';
import CompletionOverlay from '@/components/game/CompletionOverlay';
import HintPanel from '@/components/game/HintPanel';
import { usePuzzle } from '@/lib/game/usePuzzle';
import { canPress, applyPress, describeRule } from '@/lib/game/ruleEngine';
import { solveFrom } from '@/lib/game/solver';
import { LEVELS } from '@/lib/game/levels';
import { getSettings, recordResult } from '@/lib/game/storage';
import { playClick, vibrate } from '@/lib/game/feedback';

function calcStars(moves, level, hintLevel) {
  let s = moves <= level.optimalMoves ? 3 : moves <= level.moveLimit ? 2 : 1;
  if (hintLevel >= 4) s = 1;
  else if (hintLevel > 0) s = Math.min(s, 2);
  return s;
}

export default function PuzzleBoard({ level }) {
  const navigate = useNavigate();
  const settings = getSettings();
  const [game, dispatch] = usePuzzle(level);
  const [animating, setAnimating] = useState(false);
  const [lastEffect, setLastEffect] = useState(null);
  const [deniedId, setDeniedId] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [completed, setCompleted] = useState(null);
  const startRef = useRef(Date.now());

  const { states, locks, moves, history, undosUsed } = game;
  const won = moves > 0 && level.buttons.every((b) => !!states[b.id] === !!level.target[b.id]);

  useEffect(() => {
    if (!won || completed) return;
    const t = setTimeout(() => {
      const stars = calcStars(moves, level, hintLevel);
      recordResult(level.id, stars);
      setCompleted({ stars, moves, time: Math.round((Date.now() - startRef.current) / 1000), hints: hintLevel, undos: undosUsed });
    }, 550);
    return () => clearTimeout(t);
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = (button) => {
    if (animating || won || completed) return;
    if (!canPress(states, locks, button)) {
      playClick(settings.sound, true);
      vibrate(settings.haptics, [25, 40, 25]);
      setDeniedId(button.id);
      setTimeout(() => setDeniedId(null), 300);
      return;
    }
    const res = applyPress(states, locks, button);
    playClick(settings.sound);
    vibrate(settings.haptics, res.changed.length > 1 ? [15, 60, 15] : 15);
    setLastEffect({ source: button.id, targets: res.changed, ts: Date.now() });
    setHighlightId(null);
    setHint(null);
    dispatch({ type: 'PRESS', button });
    if (!settings.reducedMotion) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 420);
    }
  };

  const requestHint = () => {
    if (won || completed) return;
    const next = Math.min(hintLevel + 1, 4);
    const sol = solveFrom(states, locks, level);
    if (!sol.solvable) {
      setHint('This state can no longer reach the target. Reset and try a different sequence.');
      setHintLevel(next);
      return;
    }
    const firstId = sol.path[0];
    const btn = level.buttons.find((b) => b.id === firstId);
    const texts = {
      1: `Focus on switch ${firstId}.`,
      2: `Switch ${firstId} ${describeRule(btn.rule)}. Consider what state the system needs before and after it fires.`,
      3: `Press ${firstId} next.`,
      4: `Solution from here: ${sol.path.join(' → ')}`,
    };
    setHint(texts[next]);
    setHighlightId(firstId);
    setHintLevel(next);
  };

  const retry = () => {
    dispatch({ type: 'RESET', level });
    setCompleted(null);
    setHintLevel(0);
    setHint(null);
    setHighlightId(null);
    startRef.current = Date.now();
  };

  return (
    <Screen>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/levels')} aria-label="Back to levels" className="p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="text-sm font-bold">{String(level.id).padStart(2, '0')} · {level.name}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">{level.tier}{!level.undoAllowed && ' · no undo'}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums">{moves} / {level.moveLimit}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">moves</div>
        </div>
      </div>

      <TargetPanel buttons={level.buttons} target={level.target} states={states} />
      <div className="border-t border-[#1E2128] my-5" />
      <SystemPanel
        buttons={level.buttons} states={states} locks={locks}
        onPress={handlePress} lastEffect={lastEffect}
        highlightId={highlightId} deniedId={deniedId} settings={settings}
      />

      <div className="flex items-center gap-4 mt-5">
        {level.undoAllowed && (
          <button onClick={() => history.length && dispatch({ type: 'UNDO' })} disabled={!history.length || !!completed}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#6B7280] disabled:opacity-40">
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
        )}
        <button onClick={retry} className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#6B7280]">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <HintPanel hint={hint} hintLevel={hintLevel} onRequest={requestHint} />

      {completed && (
        <CompletionOverlay
          result={completed} level={level}
          hasNext={LEVELS.some((l) => l.id === level.id + 1)}
          onNext={() => navigate(`/play?level=${level.id + 1}`)}
          onRetry={retry}
          onMenu={() => navigate('/levels')}
        />
      )}
    </Screen>
  );
}