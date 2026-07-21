import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2, RotateCcw } from 'lucide-react';
import Screen from '@/components/game/Screen';
import TargetPanel from '@/components/game/TargetPanel';
import SystemPanel from '@/components/game/SystemPanel';
import CompletionOverlay from '@/components/game/CompletionOverlay';
import HintPanel from '@/components/game/HintPanel';
import PreviewPanel from '@/components/game/PreviewPanel';
import DeadEndBanner from '@/components/game/DeadEndBanner';
import { usePuzzle } from '@/lib/game/usePuzzle';
import { canPress, applyPress, describeRule } from '@/lib/game/ruleEngine';
import { solveFrom } from '@/lib/game/solver';
import { previewPress, deadEndReason, solveRank } from '@/lib/game/insight';
import { LEVELS } from '@/lib/game/levels';
import { getSettings, recordResult, recordEndless, recordDaily, addBadges, getBadges } from '@/lib/game/storage';
import { evaluateBadges } from '@/lib/game/ranks';
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
  const [preview, setPreview] = useState(null);
  const [deadEnd, setDeadEnd] = useState(null);
  const startRef = useRef(Date.now());
  const deniedRef = useRef(0);
  const resetsRef = useRef(0);

  const { states, locks, moves, history, undosUsed } = game;
  const won = moves > 0 && level.buttons.every((b) => !!states[b.id] === !!level.target[b.id]);

  useEffect(() => {
    if (!won || completed) return;
    const t = setTimeout(() => {
      const stars = calcStars(moves, level, hintLevel);
      const rank = solveRank({ moves, undos: undosUsed, hints: hintLevel, resets: resetsRef.current }, level);
      const isCampaign = !level.custom && !level.daily && !level.endless;
      const skipped = isCampaign && rank === 'Perfect Prediction' && LEVELS.some((l) => l.id === level.id + 2);
      const streak = level.daily ? recordDaily().streak : null;
      if (level.endless) recordEndless(level.endless);
      else if (isCampaign) recordResult(level.id, stars, skipped);
      const result = { stars, rank, skipped, moves, time: Math.round((Date.now() - startRef.current) / 1000), hints: hintLevel, undos: undosUsed, denied: deniedRef.current, streak };
      const newBadges = evaluateBadges(result, level, getBadges());
      addBadges(newBadges);
      setCompleted({ ...result, newBadges });
    }, 550);
    return () => clearTimeout(t);
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (moves === 0 || won) { setDeadEnd(null); return; }
    const sol = solveFrom(states, locks, level);
    setDeadEnd(sol.solvable ? null : deadEndReason(states, locks, level));
  }, [states, locks]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = (button) => {
    if (animating || won || completed) return;
    if (!canPress(states, locks, button)) {
      playClick(settings.sound, true);
      vibrate(settings.haptics, [25, 40, 25]);
      deniedRef.current += 1;
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
    setPreview(null);
    dispatch({ type: 'PRESS', button });
    if (!settings.reducedMotion) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 420);
    }
  };

  const previewAllowed = !!level.undoAllowed;
  const handlePreview = (button) => {
    if (!previewAllowed || won || completed || !canPress(states, locks, button)) return;
    setPreview({ id: button.id, lines: previewPress(states, locks, button) });
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
      2: `Switch ${firstId} ${describeRule(btn.rule, firstId)}. Consider what state the system needs before and after it fires.`,
      3: `Press ${firstId} next.`,
      4: `Solution from here: ${sol.path.join(' → ')}`,
    };
    setHint(texts[next]);
    setHighlightId(firstId);
    setHintLevel(next);
  };

  const retry = () => {
    resetsRef.current = completed ? 0 : resetsRef.current + 1;
    dispatch({ type: 'RESET', level });
    setCompleted(null);
    setPreview(null);
    setDeadEnd(null);
    setHintLevel(0);
    setHint(null);
    setHighlightId(null);
    startRef.current = Date.now();
    deniedRef.current = 0;
  };

  return (
    <Screen>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(level.daily || level.endless || level.custom ? '/' : '/levels')} aria-label="Back" className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-base font-extrabold">{level.daily ? '◆' : level.endless || level.custom ? '∞' : String(level.id).padStart(2, '0')} · {level.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{level.tier}{!level.undoAllowed && ' · no undo'}</div>
        </div>
        <div className="bg-card rounded-full shadow-sm px-4 py-2 text-right">
          <span className="text-sm font-extrabold tabular-nums">{moves} / {settings.zen ? '∞' : level.moveLimit}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1.5">moves</span>
        </div>
      </div>

      <TargetPanel buttons={level.buttons} target={level.target} states={states} />
      <div className="my-4" />
      <SystemPanel
        buttons={level.buttons} states={states} locks={locks}
        onPress={handlePress} lastEffect={lastEffect}
        onPreview={previewAllowed ? handlePreview : undefined}
        onPreviewEnd={() => setPreview(null)}
        highlightId={highlightId} deniedId={deniedId} settings={settings}
      />

      {deadEnd && !completed && <DeadEndBanner reason={deadEnd} canUndo={level.undoAllowed} />}

      <div className="flex items-center gap-2.5 mt-5">
        {level.undoAllowed && (
          <button onClick={() => history.length && dispatch({ type: 'UNDO' })} disabled={!history.length || !!completed}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-card shadow-sm text-[11px] font-bold uppercase tracking-widest text-muted-foreground disabled:opacity-40 active:scale-95 transition-transform">
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
        )}
        <button onClick={retry} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-card shadow-sm text-[11px] font-bold uppercase tracking-widest text-muted-foreground active:scale-95 transition-transform">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <HintPanel hint={hint} hintLevel={hintLevel} onRequest={requestHint} />
      <PreviewPanel preview={preview} />

      {completed && (
        <CompletionOverlay
          result={completed} level={level}
          hasNext={level.daily ? false : level.endless || level.custom ? true : LEVELS.some((l) => l.id === level.id + 1)}
          onNext={() => navigate(
            level.endless ? `/play?endless=${level.endless + 1}`
            : level.custom ? `/play?custom=${level.custom.tier}&seed=${level.custom.seed + 1}`
            : `/play?level=${level.id + (completed.skipped ? 2 : 1)}`
          )}
          onRetry={retry}
          onMenu={() => navigate(level.daily || level.endless || level.custom ? '/' : '/levels')}
        />
      )}
    </Screen>
  );
}