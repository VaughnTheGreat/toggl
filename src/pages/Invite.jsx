import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Gift, Copy, Check, Link2Off } from 'lucide-react';
import Screen from '@/components/game/Screen';
import StarAmount from '@/components/profile/StarAmount';
import { cloudAvailable, loadReferrals } from '@/lib/cloud';
import { normalizeInviteCode, WELCOME_BONUS } from '@/lib/cloud/referrals';

// Set VITE_APP_STORE_URL (e.g. https://apps.apple.com/app/id1234567890) once Toggl is on the App Store.
const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL;

// Landing page for invite links (https://toggl-game.pages.dev/i/CODE) when Toggl isn't installed.
// With Toggl installed, iOS opens the app directly instead (Universal Link).
export default function Invite() {
  const { code: raw } = useParams();
  const code = normalizeInviteCode(raw);
  const [copied, setCopied] = useState(false);
  const [handledInApp, setHandledInApp] = useState(false);

  // Inside the iOS app: hand the code to the invite flow and show it on the Profile screen.
  useEffect(() => {
    if (!cloudAvailable || !code) return;
    loadReferrals().then((r) => r?.receiveInviteLink(code)).finally(() => setHandledInApp(true));
  }, [code]);
  if (cloudAvailable && handledInApp) return <Navigate to="/profile" replace />;

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };

  return (
    <Screen className="pb-12">
      <div className="text-center pt-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00A38C]/15 mb-4">
          <Gift className="w-7 h-7 text-[#00A38C]" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold">You&rsquo;re invited to Toggl</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">A minimalist logic puzzle game. Toggle switches, solve systems, train your mind.</p>
        {code && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
            <StarAmount value={WELCOME_BONUS} plus pill /> welcome bonus for new players
          </div>
        )}
      </div>

      {code ? (
        <div className="bg-card rounded-3xl shadow-sm p-5 mt-8 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Your invite code</div>
          <div className="text-3xl font-extrabold tracking-[0.2em] mt-2">{code}</div>
          <button onClick={copy} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted text-xs font-extrabold active:scale-95 transition-transform">
            {copied ? <Check className="w-3.5 h-3.5 text-[#00A38C]" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />} {copied ? 'Copied' : 'Copy code'}
          </button>
          <ol className="text-left text-sm text-muted-foreground mt-5 space-y-2 list-decimal pl-5 leading-relaxed">
            <li>Install Toggl on your iPhone.</li>
            <li>Open <span className="font-bold text-foreground">Profile → Invite Friends</span> and enter the code.</li>
            <li>Sign in with Apple to claim your <StarAmount value={WELCOME_BONUS} /> <span className="font-bold text-foreground">welcome bonus</span>.</li>
          </ol>
          {APP_STORE_URL ? (
            <a href={APP_STORE_URL} className="mt-5 block w-full py-3 rounded-full bg-[#00A38C] text-white text-sm font-extrabold active:scale-[0.98] transition-transform">Get Toggl on the App Store</a>
          ) : (
            <p className="mt-5 text-xs font-semibold text-muted-foreground">Toggl is coming soon to the App Store.</p>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-3xl shadow-sm p-5 mt-8 text-center">
          <Link2Off className="w-6 h-6 text-muted-foreground mx-auto" aria-hidden="true" />
          <div className="text-base font-extrabold mt-2">This invite link doesn&rsquo;t work</div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">It may have been copied incorrectly. Ask your friend to share it again.</p>
        </div>
      )}

      <p className="text-center mt-8"><Link to="/" className="text-sm font-bold text-muted-foreground">Play Toggl in your browser →</Link></p>
    </Screen>
  );
}
