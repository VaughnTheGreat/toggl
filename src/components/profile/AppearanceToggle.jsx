import React, { useState } from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { getSettings, saveSettings } from '@/lib/game/storage';
import { applyTheme } from '@/lib/game/theme';

const MODES = [
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: Moon },
  { key: 'system', label: 'System', Icon: Smartphone },
];

export default function AppearanceToggle() {
  const [theme, setTheme] = useState(getSettings().theme);

  const set = (t) => {
    setTheme(t);
    saveSettings({ ...getSettings(), theme: t, themeChosen: true });
    applyTheme(t);
  };

  return (
    <div className="bg-card rounded-3xl shadow-sm p-4 mb-4">
      <div className="text-sm font-bold mb-3">Appearance</div>
      <div className="grid grid-cols-3 gap-1 bg-muted rounded-full p-1">
        {MODES.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => set(key)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-bold transition-colors ${
              theme === key ? 'bg-card shadow-sm text-[#00A38C]' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}