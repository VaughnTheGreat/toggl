// Bridges local game state to the backend rating/streak/skill system
// (UserProgress + Attempt entities, submitAttempt / getProgress / deleteMyData
// / getDailyChallenge functions). Best-effort: failures here never block
// gameplay — local save stays the source of truth.
import { base44 } from '@/api/base44Client';

export async function loadUserProgress() {
  const list = await base44.entities.UserProgress.filter({});
  return list[0] || null;
}

export async function getProgress() {
  const res = await base44.functions.invoke('getProgress', {});
  return res.data;
}

export async function submitAttempt(payload) {
  const res = await base44.functions.invoke('submitAttempt', payload);
  return res.data;
}

// An in-progress level is saved here after every move, so closing the app
// mid-level still gets reported as an abandoned attempt on the next launch.
const PENDING_KEY = 'toggl_pending_attempt';

export function savePendingAttempt(payload) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

export function clearPendingAttempt() {
  localStorage.removeItem(PENDING_KEY);
}

export function flushPendingAttempt() {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return;
  clearPendingAttempt();
  submitAttempt(JSON.parse(raw)).catch(() => {});
}

export async function deleteMyData() {
  const res = await base44.functions.invoke('deleteMyData', {});
  return res.data;
}

export async function getDailyChallenge() {
  const res = await base44.functions.invoke('getDailyChallenge', {});
  return res.data;
}