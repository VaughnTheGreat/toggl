// Bridges local game state to the backend rating/streak system (UserProgress
// + Attempt entities, submitAttempt / deleteMyData functions). Best-effort:
// failures here never block gameplay — local save stays the source of truth.
import { base44 } from '@/api/base44Client';

export async function loadUserProgress() {
  const list = await base44.entities.UserProgress.filter({});
  return list[0] || null;
}

export async function submitAttempt(payload) {
  const res = await base44.functions.invoke('submitAttempt', payload);
  return res.data;
}

export async function deleteMyData() {
  const res = await base44.functions.invoke('deleteMyData', {});
  return res.data;
}