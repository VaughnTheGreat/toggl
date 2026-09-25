import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, User } from 'lucide-react';

const ITEMS = [
  { key: 'home', to: '/', label: 'Home', Icon: HomeIcon },
  { key: 'profile', to: '/profile', label: 'Profile', Icon: User },
];

// Scroll position per tab — lives outside the component so it survives tab switches.
const scrollPositions = { current: {} };

const tabForPath = (pathname) =>
  pathname === '/profile' || pathname === '/settings' ? 'profile' : 'home';

export default function BottomNav({ active }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = active || tabForPath(pathname);

  // Restore this tab's scroll position once it's on screen.
  useEffect(() => {
    const y = scrollPositions.current[current];
    if (!y) return;
    const id = requestAnimationFrame(() => window.scrollTo({ top: y, left: 0, behavior: 'instant' }));
    return () => cancelAnimationFrame(id);
  }, [current]);

  const select = (item) => {
    if (item.key === current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollPositions.current[current] = window.scrollY;
    navigate(item.to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around py-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {ITEMS.map((item) => {
          const { key, label, Icon } = item;
          return (
            <button
              key={key}
              onClick={() => select(item)}
              aria-current={key === current ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 ${key === current ? 'text-[#00A38C]' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" /><span className="text-[11px] font-bold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}