import React from 'react';
import { Link } from 'react-router-dom';
import { Apple, LogIn, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import GoogleIcon from '@/components/GoogleIcon';
import DeleteAccount from '@/components/profile/DeleteAccount';

// Guest view: progress is saved on this device only. Signing in or creating
// an account merges it into the cloud save (see cloudSync.js) instead of
// replacing it.
function GuestAccount() {
  return (
    <div className="flex flex-col gap-2.5 mb-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Account</div>
      <div className="rounded-2xl bg-card shadow-sm px-4 py-3">
        <div className="text-sm font-bold">Playing as guest</div>
        <div className="text-[11px] font-semibold text-muted-foreground">progress is saved on this device only</div>
      </div>
      <button
        onClick={() => base44.auth.loginWithProvider('google', '/profile')}
        className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
      >
        <span className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
          <GoogleIcon className="w-5 h-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Continue with Google</span>
          <span className="block text-[11px] font-semibold text-muted-foreground">save your progress to an account</span>
        </span>
      </button>
      <Link
        to="/login"
        className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
      >
        <span className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
          <LogIn className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Log in</span>
          <span className="block text-[11px] font-semibold text-muted-foreground">already have an account?</span>
        </span>
      </Link>
      <Link
        to="/register"
        className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
      >
        <span className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
          <UserPlus className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Create account</span>
          <span className="block text-[11px] font-semibold text-muted-foreground">sign up with email</span>
        </span>
      </Link>
    </div>
  );
}

function SignedInAccount({ email }) {
  return (
    <div className="flex flex-col gap-2.5 mb-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Account</div>
      <div className="rounded-2xl bg-card shadow-sm px-4 py-3">
        <div className="text-sm font-bold">Signed in</div>
        <div className="text-[11px] font-semibold text-muted-foreground">{email || '—'}</div>
      </div>
      <button
        onClick={() => base44.auth.loginWithProvider('apple', '/profile')}
        className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
      >
        <span className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
          <Apple className="w-5 h-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Connect Apple account</span>
          <span className="block text-[11px] font-semibold text-muted-foreground">sign in with Apple on this account</span>
        </span>
      </button>
      <DeleteAccount />
    </div>
  );
}

export default function AccountConnection() {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();

  if (isLoadingAuth) return null;
  if (!isAuthenticated) return <GuestAccount />;
  return <SignedInAccount email={user?.email} />;
}