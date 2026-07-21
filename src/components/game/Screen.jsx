import React from 'react';

export default function Screen({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F0F2F5] font-mono selection:bg-[#00E5C8]/30">
      <div className={`max-w-md mx-auto px-5 py-6 ${className}`}>{children}</div>
    </div>
  );
}