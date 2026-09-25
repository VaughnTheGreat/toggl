import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ── Rank system ──────────────────────────────────────────────────────────
const RANK_THRESHOLDS = [
  // Reachable with the level-rating scale below (hardest levels ≈ 1780).
  { min: 1900, rank: 'grandmaster' },
  { min: 1700, rank: 'master' },
  { min: 1500, rank: 'architect' },
  { min: 1300, rank: 'tactician' },
  { min: 1100, rank: 'apprentice' },
  { min: 0, rank: 'novice' },
];

function rankForRating(rating) {
  for (const t of RANK_THRESHOLDS) {
    if (rating >= t.min) return t.rank;
  }
  return 'novice';
}

// ── Cognitive skill dimensions ───────────────────────────────────────────
// Each dimension produces a 0–100 score per attempt. These are stored on the
// Attempt and aggregated (rolling average) on UserProgress.
//
// planning    — did the player solve without excess moves? (efficiency vs optimal)
// efficiency  — time per move; low time = high throughput (but only if solved)
// adaptability — coped with complexity (button count × rule diversity)
// persistence — recovered from dead-ends / failures (tracks resets, undos)
function computeSkills(payload) {
  const { completed, movesUsed, optimalMoves, timeTakenSeconds, buttonCount, resets, undos } = payload;
  const opt = Math.max(1, optimalMoves || 1);
  const size = Math.max(1, buttonCount || 1);

  // Planning: optimal / used moves (100 = perfect). Zero if failed.
  const planning = completed ? Math.round((opt / Math.max(movesUsed || opt, opt)) * 100) : 0;

  // Efficiency: speed relative to the puzzle — ~4s per optimal move earns 100.
  const time = Math.max(1, timeTakenSeconds || 1);
  const efficiency = completed ? Math.min(100, Math.round((opt * 4 / time) * 100)) : 0;

  // Adaptability: solving bigger boards with deeper solutions scores higher.
  const adaptability = completed
    ? Math.min(100, 20 + size * 4 + opt * 3)
    : Math.min(30, size * 2);

  // Persistence: finishing after resets/undos (coming back from mistakes) scores higher.
  const persistence = completed
    ? Math.min(100, 60 + (resets || 0) * 15 + (undos || 0) * 5)
    : 10;

  return { planning, efficiency, adaptability, persistence };
}

// ── Elo-style rating ─────────────────────────────────────────────────────
// The player is treated as competing against a "level" with a rating derived
// from its difficulty. The outcome (win/loss) adjusts the player's rating
// proportionally to the expected score — upsets (beating a hard level) move
// the needle more than expected wins.
function expectedScore(playerRating, levelRating) {
  return 1 / (1 + Math.pow(10, (levelRating - playerRating) / 400));
}

// Level strength from real puzzle size: 2 switches / 2 moves ≈ 880, 12 / 12 ≈ 1780.
function levelRating(optimalMoves, buttonCount) {
  return 700 + Math.max(1, optimalMoves) * 60 + Math.max(1, buttonCount) * 30;
}

function eloDelta(playerRating, levelRating, outcome, perfect) {
  const expected = expectedScore(playerRating, levelRating);
  const actual = outcome; // 1 = win, 0 = loss
  const k = perfect ? 48 : 32; // perfect solves are worth more
  return Math.round(k * (actual - expected));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// Rolling average for cognitive skills: weight new score at 30%, keep 70% history.
function rollSkill(prev, next) {
  const p = prev || 0;
  return Math.round(p * 0.7 + next * 0.3);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      levelId, timeTakenSeconds, movesUsed, optimalMoves,
      completed, perfect, switchesToggled, difficulty = 1, stars = 0,
      mode = 'campaign', skipped = false, resets = 0, undos = 0, localDate,
    } = body;
    const buttonCount = difficulty;
    // Use the player's local calendar date so streaks match their day, not UTC.
    const today = /^\d{4}-\d{2}-\d{2}$/.test(localDate || '') ? localDate : todayKey();
    const skills = computeSkills({ completed, movesUsed, optimalMoves, timeTakenSeconds, buttonCount, resets, undos });

    // ── Persist the Attempt record ──────────────────────────────────────
    await base44.entities.Attempt.create({
      level_id: levelId,
      time_taken_seconds: timeTakenSeconds,
      moves_used: movesUsed,
      optimal_moves: optimalMoves,
      completed: !!completed,
      perfect: !!perfect,
      switches_toggled: switchesToggled,
      date: today,
      difficulty,
      skill_scores: skills,
      stars: stars || 0,
    });

    // ── Load or create UserProgress ──────────────────────────────────────
    const existing = await base44.entities.UserProgress.filter({ created_by_id: user.id });
    let progress = existing[0];
    if (!progress) {
      progress = await base44.entities.UserProgress.create({});
    }

    let rating = progress.rating ?? 1000;
    const total_attempts = (progress.total_attempts || 0) + 1;
    let total_solves = progress.total_solves || 0;
    let current_perfect_streak = progress.current_perfect_streak || 0;
    let longest_perfect_streak = progress.longest_perfect_streak || 0;
    let daily_streak = progress.daily_streak || 0;
    let longest_daily_streak = progress.longest_daily_streak || 0;
    let highest_level_unlocked = progress.highest_level_unlocked || 1;

    // ── Elo rating adjustment ────────────────────────────────────────────
    const lvRating = levelRating(optimalMoves, buttonCount);
    if (completed) {
      total_solves += 1;
      current_perfect_streak = perfect ? current_perfect_streak + 1 : 0;
      if (current_perfect_streak > longest_perfect_streak) longest_perfect_streak = current_perfect_streak;
      rating += eloDelta(rating, lvRating, 1, perfect);

      // Only the main path unlocks levels (endless/daily/custom have their own numbering).
      if (mode === 'campaign') {
        highest_level_unlocked = Math.max(highest_level_unlocked, levelId + (skipped ? 2 : 1));
      }
    } else {
      current_perfect_streak = 0;
      rating += eloDelta(rating, lvRating, 0, false);
      rating = Math.max(0, rating);
    }

    // ── Daily streak tracking ────────────────────────────────────────────
    const lastPlayDate = progress.last_play_date;
    if (!lastPlayDate) {
      daily_streak = 1;
    } else if (lastPlayDate !== today) {
      const gap = daysBetween(lastPlayDate, today);
      daily_streak = gap === 1 ? daily_streak + 1 : 1;
    }
    if (daily_streak > longest_daily_streak) longest_daily_streak = daily_streak;

    const rank = rankForRating(rating);
    const rating_history = [...(progress.rating_history || []), { date: today, rating, rank }].slice(-100);

    // ── Consistency: completion rate over last 10 attempts ──────────────
    const recentAttempts = await base44.entities.Attempt.filter({ created_by_id: user.id }, '-created_date', 10);
    const consistency_score = recentAttempts.length
      ? Math.round((recentAttempts.filter((a) => a.completed).length / recentAttempts.length) * 100)
      : 0;

    // ── Cognitive skills: rolling average ───────────────────────────────
    // First attempt seeds the average directly (otherwise it starts at 30% of the real score).
    const prevSkills = total_attempts === 1 ? skills : (progress.cognitive_skills || {});
    const cognitive_skills = {
      planning: rollSkill(prevSkills.planning, skills.planning),
      efficiency: rollSkill(prevSkills.efficiency, skills.efficiency),
      adaptability: rollSkill(prevSkills.adaptability, skills.adaptability),
      persistence: rollSkill(prevSkills.persistence, skills.persistence),
    };

    // ── Per-level best tracking ────────────────────────────────────────
    const levelBest = { ...(progress.level_best || {}) };
    const key = mode === 'campaign' ? String(levelId) : `${mode}-${levelId}`;
    const prevBest = levelBest[key] || {};
    levelBest[key] = {
      best_moves: completed ? Math.min(prevBest.best_moves ?? Infinity, movesUsed) : (prevBest.best_moves ?? movesUsed),
      best_time: completed ? Math.min(prevBest.best_time ?? Infinity, timeTakenSeconds) : (prevBest.best_time ?? timeTakenSeconds),
      stars: Math.max(prevBest.stars || 0, stars || 0),
      perfect: !!perfect || !!prevBest.perfect,
    };

    // ── Persist UserProgress ────────────────────────────────────────────
    const updated = await base44.entities.UserProgress.update(progress.id, {
      rating,
      rank,
      total_attempts,
      total_solves,
      current_perfect_streak,
      longest_perfect_streak,
      daily_streak,
      longest_daily_streak,
      last_play_date: today,
      consistency_score,
      highest_level_unlocked,
      rating_history,
      cognitive_skills,
      level_best: levelBest,
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}