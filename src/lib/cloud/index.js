// Entry point for Account & Sync. Kept tiny: the engine and Supabase load on demand.
import { Capacitor } from '@capacitor/core';

// iOS app only for now. Web Sign in with Apple needs a Services ID and domain verification,
// so the website stays exactly as before (no card, no network).
export const cloudAvailable = Capacitor.isNativePlatform();

let loading = null;
const loadRuntime = () => {
  if (!loading) {
    loading = import('./runtime').then(async (m) => {
      await m.startCloudSync();
      return m;
    });
  }
  return loading;
};

// Resolves the started sync engine, or null on the web.
export function loadCloud() {
  return cloudAvailable ? loadRuntime().then((m) => m.cloud) : Promise.resolve(null);
}

// Resolves the invite-friends controller, or null on the web.
export function loadReferrals() {
  return cloudAvailable ? loadRuntime().then((m) => m.referrals) : Promise.resolve(null);
}
