import React, { useRef } from 'react';
import { Power, ArrowRightLeft, Diamond, Lock, Copy } from 'lucide-react';
import Toggle from '@/components/game/Toggle';
import { describeRule } from '@/lib/game/ruleEngine';

const ICONS = { toggle: Power, linked: ArrowRightLeft, conditional: Diamond, lock: Lock, copy: Copy };

export default function SwitchRow({ button, on, locked, available = true, highlight, denied, flash, flashDelay = 0, onPress, onPreview, onPreviewEnd, colorblind, reducedMotion, innerRef }) {
  const Icon = ICONS[button.rule.type] || Power;
  const holdRef = useRef({ timer: null, held: false });

  const startHold = () => {
    if (!onPreview) return;
    holdRef.current.held = false;
    holdRef.current.timer = setTimeout(() => {
      holdRef.current.held = true;
      onPreview(button);
    }, 350);
  };

  const endHold = () => {
    clearTimeout(holdRef.current.timer);
    if (holdRef.current.held) onPreviewEnd?.();
  };

  return (
    <button
      ref={innerRef}
      onClick={() => {
        if (holdRef.current.held) {
          holdRef.current.held = false;
          return;
        }
        onPress?.(button);
      }}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      onContextMenu={(e) => onPreview && e.preventDefault()}
      aria-label={`Switch ${button.id}, ${on ? 'on' : 'off'}${locked ? ', locked' : ''}${!available && !locked ? ', unavailable' : ''}`}
      className={`w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl text-left bg-card shadow-sm transition-all active:scale-[0.98] select-none ${
        highlight ? 'ring-2 ring-[#00C2A8]' : flash ? 'ring-2 ring-[#00C2A8]/50' : ''
      } ${denied ? 'animate-shake' : ''}`}
      style={{
        WebkitTouchCallout: 'none',
        ...(flash && !reducedMotion ? { animation: `lg-cascade 0.45s cubic-bezier(0.34,1.56,0.64,1) ${flashDelay}ms` } : {}),
      }}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm ${
        on ? 'bg-[#00C2A8]/10 text-[#00A38C]' : 'bg-muted text-muted-foreground'
      }`}>{button.id}</span>
      <span className="flex-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        {locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Icon className={`w-3.5 h-3.5 ${!available ? 'text-amber-500' : 'text-[#B4BACA]'}`} />}
        {locked ? 'locked' : describeRule(button.rule, button.id)}
      </span>
      <Toggle on={on} locked={locked} dim={!available && !locked} colorblind={colorblind} reducedMotion={reducedMotion} />
    </button>
  );
}