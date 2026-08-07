import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ── Rank system ──────────────────────────────────────────────────────────
const RANK_THRESHOLDS = [
  { min: 40000, rank: 'grandmaster' },
  { min: 20000, rank: 'master' },
  { min: 10000, rank: 'architect' },
  { min: 5000, rank: 'tactician' },
  { min: 2000, rank: 'apprentice' },
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
  const { completed, movesUsed, optimalMoves, timeTakenSeconds, difficulty } = payload;
  const opt = Math.max(1, optimalMoves || 1);
  const diff = Math.max(1, difficulty || 1);

  // Planning: how close to optimal? Penalised for over-solving, zeroed if failed.
  const moveRatio = completed ? Math.max(0, opt / Math.max(movesUsed || opt, opt)) : 0;
  const planning = Math.round(moveRatio * 100);

  // Efficiency: throughput of correct moves. Solved fast = high.
  const time = Math.max(1, timeTakenSeconds || 1);
  const movesPerMin = (movesUsed || 0) / (time / 60);
  const efficiency = completed ? Math.min(100, Math.round(movesPerMin * 20)) : Math.round(Math.min(50, movesPerMin * 10));

  // Adaptability: scales with difficulty when solved; partial credit if failed.
  const adaptability = completed
    ? Math.min(100, Math.round(40 + diff * 12))
    : Math.min(30, Math.round(diff * 5));

  // Persistence: bounced back from a non-optimal solve or after resets.
  // Perfect solve = full credit; over-solve = partial; fail = small credit for trying.
  const persistence = completed
    ? (movesUsed <= opt ? 100 : Math.max(30, Math.round(100 - (movesUsed - opt) * 15)))
    : 10;

  return { planning, efficiency, adaptability, persistence };
}

// ── Elo-style rating ─────────────────────────────────────────────────────
// The player is treated as competing against a "level" with a rating derived
// from its difficulty. The outcome (win/loss) adjusts the player's rating
// proportionally to the expected score — upsets (beating a hard level) move
// the needle more than expected wins.
function expectedScore(playerRating, levelRating) {
  return 1 / (1 + Math.pow(10, (levelRating - playerRating) / 4000));
}

function levelRating(difficulty) {
  // Base 1000 + 200 per difficulty tier. Higher difficulty = higher level rating.
  return 1000 + (Math.max(1, difficulty) - 1) * 200;
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
    } = body;
    const today = todayKey();
    const skills = computeSkills({ completed, movesUsed, optimalMoves, timeTakenSeconds, difficulty });

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
    const lvRating = levelRating(difficulty);
    if (completed) {
      total_solves += 1;
      current_perfect_streak = perfect ? current_perfect_streak + 1 : 0;
      if (current_perfect_streak > longest_perfect_streak) longest_perfect_streak = current_perfect_streak;
      rating += eloDelta(rating, lvRating, 1, perfect);

      if (levelId === highest_level_unlocked) highest_level_unlocked += 1;
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
    const rating_history = [...(progress.rating_history || []), { date: today, rating, rank }];

    // ── Consistency: completion rate over last 10 attempts ──────────────
    const recentAttempts = await base44.entities.Attempt.filter({ created_by_id: user.id }, '-created_date', 10);
    const consistency_score = recentAttempts.length
      ? Math.round((recentAttempts.filter((a) => a.completed).length / recentAttempts.length) * 100)
      : 0;

    // ── Cognitive skills: rolling average ───────────────────────────────
    const prevSkills = progress.cognitive_skills || {};
    const cognitive_skills = {
      planning: rollSkill(prevSkills.planning, skills.planning),
      efficiency: rollSkill(prevSkills.efficiency, skills.efficiency),
      adaptability: rollSkill(prevSkills.adaptability, skills.adaptability),
      persistence: rollSkill(prevSkills.persistence, skills.persistence),
    };

    // ── Per-level best tracking ────────────────────────────────────────
    const levelBest = { ...(progress.level_best || {}) };
    const key = String(levelId);
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