import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '@/lib/game/storage';
import { playClick, vibrate } from '@/lib/game/feedback';

export default function PlaySwitch({ to }) {
  const navigate = useNavigate();
  const [on, setOn] = useState(false);
  const settings = getSettings();

  const flip = () => {
    if (on) return;
    setOn(true);
    playClick(settings.sound);
    vibrate(settings.haptics, 15);
    setTimeout(() => navigate(to), 320);
  };

  return (
    <button onClick={flip} aria-label="Play" className="mx-auto flex flex-col items-center gap-3 group">
      <span className={`relative block w-32 h-16 rounded-full transition-colors duration-300 ${
        on ? 'bg-[#00C2A8] shadow-[0_8px_24px_rgba(0,194,168,0.45)]' : 'bg-muted-foreground/25'
      }`}>
        <span className={`absolute top-1.5 left-1.5 w-[3.25rem] h-[3.25rem] rounded-full bg-white shadow-md transition-transform duration-300 ${
          on ? 'translate-x-16' : ''
        }`} />
      </span>
      <span className={`text-lg font-extrabold tracking-wide transition-colors ${on ? 'text-[#00A38C]' : 'text-foreground'}`}>
        Play
      </span>
    </button>
  );
}