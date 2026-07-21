import React from 'react';

export default function Screen({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#1B2340]">
      <div className={`max-w-md mx-auto px-5 py-6 ${className}`}>{children}</div>
    </div>
  );
}