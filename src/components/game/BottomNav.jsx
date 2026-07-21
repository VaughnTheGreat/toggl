import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, LayoutGrid, User } from 'lucide-react';

const ITEMS = [
  { key: 'home', to: '/', label: 'Home', Icon: HomeIcon },
  { key: 'levels', to: '/levels', label: 'Levels', Icon: LayoutGrid },
  { key: 'profile', to: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav({ active }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-md mx-auto flex items-center justify-around py-2.5 pb-4">
        {ITEMS.map(({ key, to, label, Icon }) =>
          key === active ? (
            <span key={key} className="flex flex-col items-center gap-0.5 text-[#00A38C]">
              <Icon className="w-5 h-5" /><span className="text-[10px] font-bold">{label}</span>
            </span>
          ) : (
            <Link key={key} to={to} className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <Icon className="w-5 h-5" /><span className="text-[10px] font-bold">{label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}