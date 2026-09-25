import React from 'react';

// Phone-first column that widens on tablets and respects notches / home indicators.
export default function Screen({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-background text-foreground pt-[var(--safe-top)] pb-[var(--safe-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Solid status-bar backdrop so scrolling content never slides under the clock/battery */}
      <div className="fixed top-0 inset-x-0 h-[var(--safe-top)] bg-background z-40 pointer-events-none" />
      <div className={`max-w-md md:max-w-xl mx-auto px-4 sm:px-5 md:px-8 py-6 md:py-10 ${className}`}>{children}</div>
    </div>
  );
}