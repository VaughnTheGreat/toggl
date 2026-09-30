import React, { useEffect, useState } from 'react';
import { Gift, Check, Loader2, Share2, X, RotateCw } from 'lucide-react';
import { Share } from '@capacitor/share';
import { cloudAvailable, loadCloud, loadReferrals } from '@/lib/cloud';
import { inviteMessage, REFERRAL_REWARD, WELCOME_BONUS, MAX_REWARDED_FRIENDS } from '@/lib/cloud/referrals';
import StarAmount from '@/components/profile/StarAmount';

const NOTICE_STYLE = {
  success: 'bg-[#00A38C]/15 text-[#00806E] dark:text-[#2BD9BF]',
  info: 'bg-muted/70 text-muted-foreground',
  // The theme's dark `destructive` is too dim for text, so errors use a lighter red there.
  error: 'bg-destructive/10 text-destructive dark:bg-red-500/15 dark:text-red-400',
};

export default function InviteFriendsCard() {
  const [cloud, setCloud] = useState(null);
  const [cloudState, setCloudState] = useState(null);
  const [ref, setRef] = useState(null);
  const [refState, setRefState] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

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
  const loadCode = () => {
    setCodeLoading(true);
    ref.ensureCode().finally(() => setCodeLoading(false));
  };
  useEffect(() => { if (ref && signedIn) loadCode(); }, [ref, signedIn]);

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
      <p className="text-xs font-semibold text-muted-foreground leading-relaxed mb-3">
        Earn <StarAmount value={REFERRAL_REWARD} /> for each friend who joins Toggl, up to {MAX_REWARDED_FRIENDS} friends
        (<StarAmount value={maxTotal} /> in total). Your friend also gets <StarAmount value={WELCOME_BONUS} /> as a welcome bonus.
      </p>

      {refState.notice && (
        <div role="status" className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 mb-3 text-xs font-bold ${NOTICE_STYLE[refState.notice.kind] || NOTICE_STYLE.info}`}>
          <span className="flex-1">{refState.notice.text}</span>
          {refState.notice.stars > 0 && <StarAmount value={refState.notice.stars} plus pill />}
          <button onClick={() => ref.dismissNotice()} aria-label="Dismiss" className="shrink-0 -mr-1 p-1 opacity-70"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {refState.busy && (
        <div role="status" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Applying your invite…
        </div>
      )}

      {signedIn ? (
        <>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold tabular-nums">{rewarded} / {MAX_REWARDED_FRIENDS} friends joined</span>
            {rewarded > 0 && <StarAmount value={rewarded * REFERRAL_REWARD} plus pill />}
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00CDAF] to-[#00A88F] transition-all" style={{ width: `${(rewarded / MAX_REWARDED_FRIENDS) * 100}%` }} />
          </div>

          <div className="bg-muted/60 rounded-2xl px-3.5 py-3 mb-3 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Your invite code</div>
            {refState.code ? (
              <div className="text-xl font-extrabold tracking-[0.2em] mt-1 select-all">{refState.code}</div>
            ) : codeLoading ? (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground h-7 mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Getting your code…
              </div>
            ) : (
              <button onClick={loadCode} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A38C] h-7 mt-1">
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" /> Try again
              </button>
            )}
          </div>

          {allClaimed ? (
            <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#00A38C]/15 text-[#00806E] dark:text-[#2BD9BF] text-xs font-extrabold">
              <Check className="w-3.5 h-3.5" aria-hidden="true" /> All invite rewards earned
            </div>
          ) : (
            <button
              onClick={share}
              disabled={sharing || codeLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#00A38C] text-white text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50"
            >
              {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
              Share Invite
            </button>
          )}
          <p className="text-[11px] font-semibold text-muted-foreground text-center mt-2.5 leading-relaxed">
            {allClaimed
              ? 'Thanks for spreading the word! You’ve earned every invite reward.'
              : 'A friend counts once they enter your code and sign in with Apple on a new account.'}
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => cloud.signIn()}
            disabled={!!cloudState.busy}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#00A38C] text-white text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50"
          >
            {cloudState.busy === 'signin' && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            Sign in to get your invite link
          </button>

          <div className="border-t border-border mt-3.5 pt-3">
            <div className="text-xs font-bold mb-1.5">Have an invite code?</div>
            {refState.pendingCode ? (
              <div className="bg-muted/60 rounded-2xl px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    <Check className="w-3.5 h-3.5 text-[#00A38C]" aria-hidden="true" />
                    Code <span className="font-extrabold tracking-[0.15em]">{refState.pendingCode}</span> saved
                  </span>
                  <button onClick={() => ref.clearPendingCode()} className="shrink-0 text-[11px] font-bold text-muted-foreground underline">Remove</button>
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground mt-1.5 leading-relaxed">
                  Sign in with Apple to claim your <StarAmount value={WELCOME_BONUS} /> welcome bonus.
                </p>
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
                  aria-invalid={!!inputError}
                  className={`flex-1 min-w-0 h-10 rounded-full bg-muted px-4 text-sm font-bold tracking-[0.15em] uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-semibold outline-none ${inputError ? 'ring-1 ring-destructive/60 dark:ring-red-400/60' : ''}`}
                />
                <button type="submit" disabled={!codeInput.trim()} className="px-4 h-10 rounded-full bg-muted text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50">Save</button>
              </form>
            )}
            {inputError && <p role="alert" className="text-[11px] font-semibold text-destructive dark:text-red-400 mt-1.5 pl-4">{inputError}</p>}
            {!refState.pendingCode && (
              <p className="text-[11px] font-semibold text-muted-foreground mt-2 leading-relaxed">
                Invite codes work when you first create your account with Sign in with Apple.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
