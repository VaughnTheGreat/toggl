import React from 'react';

export default function Screen({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-background text-foreground pt-[env(safe-area-inset-top)]">
      <div className={`max-w-md mx-auto px-5 py-6 ${className}`}>{children}</div>
    </div>
  );
}