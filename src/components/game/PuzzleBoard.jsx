import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2, RotateCcw } from 'lucide-react';
import Screen from '@/components/game/Screen';
import TargetPanel from '@/components/game/TargetPanel';
import SystemPanel from '@/components/game/SystemPanel';
import CompletionFlash from '@/components/game/CompletionFlash';
import HintPanel from '@/components/game/HintPanel';
import PreviewPanel from '@/components/game/PreviewPanel';
import DeadEndBanner from '@/components/game/DeadEndBanner';
import RuleGuide from '@/components/game/RuleGuide';
import { usePuzzle } from '@/lib/game/usePuzzle';
import { canPress, applyPress, describeRule } from '@/lib/game/ruleEngine';
import { solveFrom } from '@/lib/game/solver';
import { previewPress, deadEndReason, solveRank } from '@/lib/game/insight';
import { isSolved, countOn, isCountObjective } from '@/lib/game/objective';
import { getSettings, recordResult, recordEndless, recordDaily, addBadges, getBadges, setUnlockedAtLeast, todayKey } from '@/lib/game/storage';
import NoUndoNotice from '@/components/game/NoUndoNotice';
import OutOfMovesPanel from '@/components/game/OutOfMovesPanel';
import PowerUpSheet, { POWER_UP_ICONS } from '@/components/game/PowerUpSheet';
import { getStarBalance, spendStars } from '@/lib/game/storage';
import { evaluateBadges } from '@/lib/game/ranks';
import { playFlip, playCascade, playDenied, vibrate } from '@/lib/game/feedback';
import { submitAttempt, savePendingAttempt, clearPendingAttempt, flushPendingAttempt } from '@/lib/game/backendSync';

function calcStars(moves, level, hintLevel, boughtMoves = false) {
  if (boughtMoves) return 1;
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
  const [revealed, setRevealed] = useState({});
  const [pendingVisual, setPendingVisual] = useState({});
  const [bestMatch, setBestMatch] = useState(0);
  const [extraMoves, setExtraMoves] = useState(0);
  const buysRef = useRef(0); // price doubles with each purchase on this level
  const startRef = useRef(Date.now());
  const deniedRef = useRef(0);
  const resetsRef = useRef(0);
  const switchesRef = useRef(0);
  const submittedRef = useRef(false);

  const buildPayload = (isCompleted, isPerfect, skipped = false) => {
    const numericLevelId = typeof level.id === 'number' ? level.id : (level.endless ?? 0);
    const stars = calcStars(moves, level, hintLevel, extraMoves > 0 || settings.zen);
    const mode = level.daily ? 'daily' : level.endless ? 'endless' : level.custom ? 'custom' : 'campaign';
    return {
      mode,
      skipped: !!skipped,
      zen: !!settings.zen,
      resets: resetsRef.current,
      undos: undosUsed,
      localDate: todayKey(),
      levelId: numericLevelId,
      timeTakenSeconds: Math.round((Date.now() - startRef.current) / 1000),
      movesUsed: moves,
      optimalMoves: level.optimalMoves ?? level.buttons.length,
      completed: isCompleted,
      perfect: !!isPerfect,
      switchesToggled: switchesRef.current,
      difficulty: level.buttons.length,
      stars: isCompleted ? stars : 0,
    };
  };

  const submitGameResult = (isCompleted, isPerfect, skipped = false) => {
    clearPendingAttempt();
    submitAttempt(buildPayload(isCompleted, isPerfect, skipped)).then((stats) => {
      if (stats?.highest_level_unlocked) setUnlockedAtLeast(stats.highest_level_unlocked);
    }).catch(() => {});
  };

  const { states, locks, moves, history, undosUsed } = game;
  const displayStates = { ...states, ...pendingVisual };
  const countMode = isCountObjective(level);
  // Wait for delayed switches to visibly land before declaring the win.
  const won = moves > 0 && isSolved(states, level) && Object.keys(pendingVisual).length === 0;
  const matched = countMode
    ? countOn(states, level)
    : level.buttons.filter((b) => !!states[b.id] === !!level.target[b.id]).length;
  const total = countMode ? level.objective.count : level.buttons.length;
  const limit = level.moveLimit + extraMoves;
  const outOfMoves = !settings.zen && !completed && moves >= limit && !isSolved(states, level);
  const buyCost = 2 * 2 ** buysRef.current;

  const hiddenIds = level.buttons.filter((b) => b.mystery && !revealed[b.id]).map((b) => b.id);
  const revealRule = () => {
    if (!hiddenIds.length || !spendStars(2)) return;
    setRevealed((r) => ({ ...r, [hiddenIds[0]]: true }));
  };

  const buyMoves = () => {
    if (!spendStars(buyCost)) return;
    buysRef.current += 1;
    setExtraMoves((e) => e + 3);
  };

  useEffect(() => {
    // "Best attempt" tracking only makes sense for exact-match levels — a count
    // objective isn't monotonically closer as the ON-count rises past the target.
    if (!countMode && moves > 0 && matched > bestMatch) setBestMatch(matched);
  }, [matched, moves, countMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep an up-to-date "abandoned" record so quitting the app still counts.
  useEffect(() => {
    if (moves > 0 && !submittedRef.current) savePendingAttempt(buildPayload(false, false));
  }, [moves]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!won || completed) return;
    const t = setTimeout(() => {
      const stars = calcStars(moves, level, hintLevel, extraMoves > 0 || settings.zen);
      const rank = solveRank({ moves, undos: undosUsed, hints: hintLevel, resets: resetsRef.current }, level);
      const isCampaign = !level.custom && !level.daily && !level.endless;
      const skipped = false; // levels are never skipped — always advance one at a time
      const streak = level.daily ? recordDaily().streak : null;
      if (level.endless) recordEndless(level.endless);
      else if (isCampaign) recordResult(level.id, stars, skipped, !!settings.zen);
      const result = { stars, rank, skipped, moves, time: Math.round((Date.now() - startRef.current) / 1000), hints: hintLevel, undos: undosUsed, denied: deniedRef.current, streak };
      const newBadges = evaluateBadges(result, level, getBadges());
      addBadges(newBadges);
      setCompleted({ ...result, newBadges });
      if (!submittedRef.current) {
        submittedRef.current = true;
        submitGameResult(true, moves === level.optimalMoves, skipped);
      }
    }, 550);
    return () => clearTimeout(t);
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (moves === 0 || won) { setDeadEnd(null); return; }
    const sol = solveFrom(states, locks, level);
    setDeadEnd(sol.solvable ? null : deadEndReason(states, locks, level));
  }, [states, locks]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = (button) => {
    if (animating || won || completed || outOfMoves) return;
    if (button.mystery && !revealed[button.id]) setRevealed((r) => ({ ...r, [button.id]: true }));
    if (!canPress(states, locks, button)) {
      playDenied(settings.sound);
      vibrate(settings.haptics, [25, 40, 25]);
      deniedRef.current += 1;
      setDeniedId(button.id);
      setTimeout(() => setDeniedId(null), 300);
      return;
    }
    const res = applyPress(states, locks, button);
    switchesRef.current += res.changed.length;
    const isDelay = button.rule.type === 'delay';
    const delayTarget = isDelay ? button.rule.target : null;
    const immediateTargets = isDelay ? res.changed.filter((id) => id !== delayTarget) : res.changed;
    if (immediateTargets.length > 1) playCascade(settings.sound, immediateTargets.length - 1);
    else playFlip(settings.sound);
    vibrate(settings.haptics, immediateTargets.length > 1 ? [15, 60, 15] : 15);
    setLastEffect({ source: button.id, targets: immediateTargets, ts: Date.now() });
    setHighlightId(null);
    setHint(null);
    setPreview(null);
    if (isDelay) {
      const oldVal = !!states[delayTarget];
      setPendingVisual((p) => ({ ...p, [delayTarget]: oldVal }));
      setTimeout(() => {
        setPendingVisual((p) => { const np = { ...p }; delete np[delayTarget]; return np; });
        setLastEffect({ source: button.id, targets: [delayTarget], ts: Date.now() });
        playCascade(settings.sound, 1);
        vibrate(settings.haptics, [15, 60, 15]);
      }, button.rule.delayMs || 1500);
    }
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
    if (completed) setBestMatch(0);
    setExtraMoves(0);
    dispatch({ type: 'RESET', level });
    setCompleted(null);
    setPreview(null);
    setDeadEnd(null);
    setHintLevel(0);
    setHint(null);
    setHighlightId(null);
    startRef.current = Date.now();
    deniedRef.current = 0;
    switchesRef.current = 0;
    submittedRef.current = false;
  };

  const handleBack = () => {
    if (moves > 0 && !won && !completed && !submittedRef.current) {
      submittedRef.current = true;
      submitGameResult(false, false);
    } else {
      flushPendingAttempt(); // e.g. played, reset, then left
    }
    navigate('/');
  };

  return (
    <Screen>
      {!level.undoAllowed && <NoUndoNotice />}
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        <button onClick={handleBack} aria-label="Back" className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-base font-extrabold truncate">{level.daily || level.endless || level.custom ? level.name : `Level ${level.id}`}</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground truncate">{level.tier}{!level.undoAllowed && ' · no undo'}</div>
        </div>
        <RuleGuide buttons={level.buttons} revealed={revealed} />
        <div className="bg-card rounded-full shadow-sm px-3 sm:px-4 py-2 text-right shrink-0">
          <span className="text-sm font-extrabold tabular-nums">{moves} / {settings.zen ? '∞' : limit}</span>
          <span className="hidden min-[380px]:inline text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1.5">moves</span>
        </div>
      </div>

      <TargetPanel level={level} buttons={level.buttons} target={level.target} states={displayStates} />
      <div className="my-4" />
      <div className={won && !settings.reducedMotion ? 'animate-pulse' : ''}>
        <SystemPanel
          buttons={level.buttons} states={displayStates} locks={locks}
          onPress={handlePress} lastEffect={lastEffect}
          onPreview={previewAllowed ? handlePreview : undefined}
          onPreviewEnd={() => setPreview(null)}
          highlightId={highlightId} deniedId={deniedId} settings={settings}
          revealed={revealed}
          pendingIds={Object.keys(pendingVisual)}
        />
      </div>

      {outOfMoves && (
        <OutOfMovesPanel cost={buyCost} balance={getStarBalance()} canBuy={!deadEnd} onBuy={buyMoves} onReset={retry} onMenu={handleBack} />
      )}
      {deadEnd && !completed && !outOfMoves && (
        <DeadEndBanner reason={deadEnd} canUndo={level.undoAllowed} matched={countMode ? null : matched} total={total} />
      )}

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
        <div className="flex-1" />
        {!completed && (
          <PowerUpSheet balance={getStarBalance()} items={[
            { key: 'hint', Icon: POWER_UP_ICONS.hint, iconClass: 'text-amber-500', title: `Hint${hintLevel ? ` ${hintLevel + 1}/4` : ''}`,
              desc: hintLevel >= 3 ? 'Show the full solution · max 1 star' : 'A clue for your next move · max 2 stars',
              cost: 1, disabled: hintLevel >= 4 || won, hidden: false, onBuy: () => spendStars(1) && requestHint() },
            { key: 'moves', Icon: POWER_UP_ICONS.moves, iconClass: 'text-[#00A38C]', title: '+3 Moves',
              desc: 'Raise the move limit · max 1 star', cost: buyCost, disabled: !!deadEnd || won, hidden: !!settings.zen, onBuy: buyMoves },
            { key: 'reveal', Icon: POWER_UP_ICONS.reveal, iconClass: 'text-sky-500', title: 'Reveal a rule',
              desc: 'Uncover one hidden switch', cost: 2, disabled: won, hidden: !hiddenIds.length, onBuy: revealRule },
          ]} />
        )}
      </div>
      {!countMode && resetsRef.current > 0 && bestMatch > 0 && !won && !completed && (
        <div className="mt-3 text-[11px] font-bold text-muted-foreground">
          Best attempt: <span className="text-[#00A38C]">{bestMatch}/{total}</span> targets — you know this system better now.
        </div>
      )}
      <HintPanel hint={hint} hintLevel={hintLevel} />
      <PreviewPanel preview={preview} />

      {completed && (
        <CompletionFlash
          result={completed} level={level}
          hasNext={!level.daily}
          onNext={() => navigate(
            level.endless ? `/play?endless=${level.endless + 1}`
            : level.custom ? `/play?custom=${level.custom.tier}&seed=${level.custom.seed + 1}`
            : `/play?level=${level.id + (completed.skipped ? 2 : 1)}`
          )}
          onRetry={retry}
          onMenu={() => navigate('/')}
        />
      )}
    </Screen>
  );
}