import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import AppleIcon from '@/components/AppleIcon';
import { cloudAvailable, loadCloud } from '@/lib/cloud';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

function lastSyncedText(ts) {
  if (!ts) return 'Not synced yet';
  const secs = Math.round((Date.now() - ts) / 1000);
  if (secs < 45) return 'Last synced just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `Last synced ${rtf.format(-mins, 'minute')}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Last synced ${rtf.format(-hours, 'hour')}`;
  return `Last synced ${new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

const STATUS = {
  syncing: { Icon: Loader2, text: 'Syncing…', className: 'text-muted-foreground', spin: true },
  synced: { Icon: Check, text: 'Synced', className: 'text-[#00A38C]' },
  idle: { Icon: RefreshCw, text: 'Waiting to sync', className: 'text-muted-foreground' },
  offline: { Icon: CloudOff, text: 'Offline · changes will sync when you’re back online', className: 'text-muted-foreground' },
  error: { Icon: AlertCircle, text: 'Sync didn’t finish · tap Sync now to retry', className: 'text-amber-600 dark:text-amber-400' },
};

// Sign in with Apple button per Apple's guidelines: black on light backgrounds, white on dark,
// Apple logo + "Sign in with Apple", at least 44pt tall.
function AppleButton({ onClick, disabled, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-2 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <AppleIcon className="w-[15px] h-[18px] -mt-0.5" />}
      Sign in with Apple
    </button>
  );
}

export default function AccountSyncCard() {
  const [cloud, setCloud] = useState(null);
  const [state, setState] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!cloudAvailable) return undefined;
    let alive = true;
    let off = () => {};
    loadCloud().then((c) => {
      if (!alive || !c) return;
      setCloud(c);
      setState(c.getState());
      off = c.onChange(setState);
    });
    const id = setInterval(() => setTick((n) => n + 1), 30000);   // keep "Last synced …" current
    return () => { alive = false; off(); clearInterval(id); };
  }, []);

  if (!cloudAvailable || !cloud || !state?.ready) return null;

  const header = (
    <div className="flex items-center gap-2 mb-1.5">
      <Cloud className="w-4 h-4 text-[#00A38C]" aria-hidden="true" />
      <div className="text-sm font-bold">Account &amp; Sync</div>
    </div>
  );

  if (!state.signedIn) {
    return (
      <div className="bg-card rounded-3xl shadow-sm p-4 mb-4">
        {header}
        <p className="text-xs font-semibold text-muted-foreground leading-relaxed mb-3.5">
          Sign in to back up your progress and keep it in sync across your devices.
        </p>
        <AppleButton onClick={() => cloud.signIn()} disabled={!state.configured || !!state.busy} busy={state.busy === 'signin'} />
        {state.error && <p role="alert" className="text-[11px] font-semibold text-destructive text-center mt-2.5">{state.error}</p>}
        <p className="text-[11px] font-semibold text-muted-foreground text-center mt-2.5">
          {state.configured
            ? 'Optional · Toggl works fully offline without an account.'
            : 'Cloud sync isn’t set up in this build yet. Toggl works fully offline.'}
        </p>
      </div>
    );
  }

  const status = STATUS[state.status] || STATUS.idle;
  const busy = !!state.busy;

  return (
    <div className="bg-card rounded-3xl shadow-sm p-4 mb-4">
      {header}
      <div className="flex items-center gap-1.5 text-xs font-bold mb-3">
        <AppleIcon className="w-[11px] h-[13px] -mt-px" /> Signed in with Apple
      </div>

      <div className="bg-muted/60 rounded-2xl px-3.5 py-3 mb-3">
        <div className={`flex items-start gap-1.5 text-xs font-bold ${status.className}`}>
          <status.Icon className={`w-3.5 h-3.5 mt-px shrink-0 ${status.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span role="status">{status.text}</span>
        </div>
        <div className="text-[11px] font-semibold text-muted-foreground mt-1 pl-5">{lastSyncedText(state.lastSyncedAt)}</div>
        {state.error && state.status === 'error' && (
          <div className="text-[11px] font-semibold text-muted-foreground mt-1 pl-5 break-words">{state.error}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => cloud.syncNow()}
          disabled={busy || state.status === 'syncing'}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#00A38C] text-white text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${state.status === 'syncing' ? 'animate-spin' : ''}`} aria-hidden="true" /> Sync now
        </button>
        <button
          onClick={() => cloud.signOut()}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-muted text-xs font-extrabold active:scale-95 transition-transform disabled:opacity-50"
        >
          {state.busy === 'signout' && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />} Sign out
        </button>
      </div>

      {state.error && state.status !== 'error' && (
        <p role="alert" className="text-[11px] font-semibold text-destructive text-center mt-2.5">{state.error}</p>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button disabled={busy} className="w-full text-center pt-3 text-[11px] font-semibold text-muted-foreground/70 hover:text-destructive/70 transition-colors disabled:opacity-50">
            {state.busy === 'delete' ? 'Deleting account…' : 'Delete account'}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your Toggl account and cloud backup, and disconnects Sign in with Apple.
              Progress on this device stays. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cloud.deleteAccount()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
