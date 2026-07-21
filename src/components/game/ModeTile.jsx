import React from 'react';
import { Link } from 'react-router-dom';

export default function ModeTile({ to, icon: Icon, iconClass, bgClass, title, subtitle }) {
  return (
    <Link to={to} className="bg-card rounded-3xl shadow-sm p-4 active:scale-[0.97] transition-transform">
      <div className={`w-10 h-10 rounded-2xl ${bgClass} flex items-center justify-center mb-2.5`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div className="text-sm font-extrabold">{title}</div>
      <div className="text-[11px] font-semibold text-muted-foreground leading-tight">{subtitle}</div>
    </Link>
  );
}