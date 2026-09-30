import React, { useEffect, useState } from 'react';
import { Gift, Check, Loader2, Share2, X } from 'lucide-react';
import { Share } from '@capacitor/share';
import { cloudAvailable, loadCloud, loadReferrals } from '@/lib/cloud';
import { inviteMessage, REFERRAL_REWARD, WELCOME_BONUS, MAX_REWARDED_FRIENDS } from '@/lib/cloud/referrals';

const NOTICE_STYLE = {
  success: 'bg-[#00A38C]/12 text-[#00806E] dark:text-[#2BD9BF]',
  info: 'bg-muted/70 text-muted-foreground',
  error: 'bg-destructive/10 text-destructive',
};

export default function InviteFriendsCard() {
  const [cloud, setCloud] = useState(null);
  const [cloudState, setCloudState] = useState(null);
  const [ref, setRef] = useState(null);
  const [refState, setRefState] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!cloudAvailable) return undefined;
    let alive = true;
    const offs = [];
    Promise.all([loadCloud(), loadReferrals()]).then(([c, r]) => {
      if (!alive || !c || !r) return;
      setCloud(c); setCloudState(c.getState()); offs.push(c.onChange(setCloudState));
      setRef(r); setRefState(r.getState()); offs.push(r.onChange(setRefState));
    });
    return () => { alive = false; offs.forEach((off) => off()); };
  }, []);

  const signedIn = !!cloudState?.signedIn;
  // Signed in: make sure this player's code is known (created on the server on first use).
  useEffect(() => { if (ref && signedIn) ref.ensureCode(); }, [ref, signedIn]);

  if (!cloudAvailable || !cloud || !ref || !cloudState?.ready || !refState?.configured) return null;

  const rewarded = Math.min(refState.rewardedFriends || 0, MAX_REWARDED_FRIENDS);
  const allClaimed = rewarded >= MAX_REWARDED_FRIENDS;
  const maxTotal = REFERRAL_REWARD * MAX_REWARDED_FRIENDS;

  const share = async () => {
    setSharing(true);
    try {
      const code = await ref.ensureCode();
      if (code) await Share.share({ title: 'Toggl', text: inviteMessage(code), dialogTitle: 'Invite a friend' });
    } catch {
      // Share sheet closed without sharing: nothing to do (sharing never earns anything).
    } finally {
      setSharing(false);
    }
  };

  const saveCode = async (e) => {
    e.preventDefault();
    const r = await ref.enterCode(codeInput);
    if (r.ok) { setCodeInput(''); setInputError(''); } else setInputError(r.error);
  };

  return (
    <div className="bg-card rounded-3xl shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Gift className="w-4 h-4 text-[#00A38C]" aria-hidden="true" />
        <div className="text-sm font-bold">Invite Friends</div>
      </div>
      <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
        Invite friends and earn {REFERRAL_REWARD} ★ each.
      </p>
      <p className="text-[11px] font-semibold text-muted-foreground mb-3">
        Up to {MAX_REWARDED_FRIENDS} friends · Total possible reward: {maxTotal} ★
      </p>

      {refState.notice && (
        <div role="status" className={`flex items-start gap-2 rounded-2xl px-3 py-2.5 mb-3 text-xs font-bold ${NOTICE_STYLE[refState.notice.kind] || NOTICE_STYLE.info}`}>
          <span className="flex-1">{refState.notice.text}</span>
          <button onClick={() => ref.dismissNotice()} aria-label="Dismiss" className="shrink-0 opacity-70"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {refState.busy && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Applying your invite…
        </div>
      )}

      {signedIn ? (
        <>
          <div className="bg-muted/60 rounded-2xl px-3.5 py-3 mb-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{rewarded} / {MAX_REWARDED_FRIENDS} friends invited</span>
              <span className="text-[#F5B21B]">+{rewarded * REFERRAL_REWARD} ★</span>
            </div>
            <div className="h-1.5 rounded-full bg-background/70 mt-2 overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-[#00A38C] transition-all" style={{ width: `${(rewarded / MAX_REWARDED_FRIENDS) * 100}%` }} />
            </div>
            {refState.code && (
              <div className="text-[11px] font-semibold text-muted-foreground mt-2">
                Your invite code: <span className="font-extrabold tracking-[0.15em] text-foreground">{refState.code}</span>
              </div>
            )}
          </div>
          {allClaimed ? (
            <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#00A38C]/15 text-[#00A38C] text-xs font-extrabold">
              <Check className="w-3.5 h-3.5" aria-hidden="true" /> All referral rewards claimed
            </div>
          ) : (
            <button
              onClick={share}
              disabled={sharing}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#00A38C] text-white text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50"
            >
              {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
              Share Invite
            </button>
          )}
          <p className="text-[11px] font-semibold text-muted-foreground text-center mt-2.5">
            You earn {REFERRAL_REWARD} ★ when a friend signs up with your link and signs in with Apple.
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => cloud.signIn()}
            disabled={!!cloudState.busy}
            className="w-full py-2.5 rounded-full bg-[#00A38C] text-white text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50"
          >
            Sign in to get your invite link
          </button>

          <div className="border-t border-border mt-3.5 pt-3">
            <div className="text-xs font-bold mb-1.5">Have an invite code?</div>
            {refState.pendingCode ? (
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-muted-foreground">
                <span>
                  Code <span className="font-extrabold tracking-[0.15em] text-foreground">{refState.pendingCode}</span> saved.
                  Sign in with Apple to claim your {WELCOME_BONUS} ★ welcome bonus.
                </span>
                <button onClick={() => ref.clearPendingCode()} className="shrink-0 font-bold text-muted-foreground/80 underline">Remove</button>
              </div>
            ) : (
              <form onSubmit={saveCode} className="flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => { setCodeInput(e.target.value); setInputError(''); }}
                  placeholder="e.g. K7MPQ2X"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={9}
                  aria-label="Invite code"
                  className="flex-1 min-w-0 h-10 rounded-full bg-muted px-4 text-sm font-bold tracking-[0.15em] uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-semibold outline-none"
                />
                <button type="submit" className="px-4 h-10 rounded-full bg-muted text-xs font-extrabold active:scale-95 transition-transform">Save</button>
              </form>
            )}
            {inputError && <p role="alert" className="text-[11px] font-semibold text-destructive mt-1.5">{inputError}</p>}
            <p className="text-[11px] font-semibold text-muted-foreground mt-2">
              Invite codes work when you first create your account with Sign in with Apple.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
