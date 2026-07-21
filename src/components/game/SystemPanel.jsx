import React, { useRef, useState, useEffect } from 'react';
import SwitchRow from '@/components/game/SwitchRow';
import { canPress } from '@/lib/game/ruleEngine';

export default function SystemPanel({ buttons, states, locks, onPress, onPreview, onPreviewEnd, lastEffect, highlightId, deniedId, settings, revealed = {} }) {
  const rowRefs = useRef({});
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [flashIds, setFlashIds] = useState([]);

  useEffect(() => {
    if (!lastEffect || settings.reducedMotion) return;
    const c = containerRef.current?.getBoundingClientRect();
    const src = rowRefs.current[lastEffect.source]?.getBoundingClientRect();
    if (!c || !src) return;
    const targets = lastEffect.targets.filter((t) => t !== lastEffect.source);
    const ls = targets
      .map((t) => {
        const r = rowRefs.current[t]?.getBoundingClientRect();
        return r ? { y1: src.top + src.height / 2 - c.top, y2: r.top + r.height / 2 - c.top } : null;
      })
      .filter(Boolean);
    setLines(ls);
    setFlashIds(targets);
    const to = setTimeout(() => { setLines([]); setFlashIds([]); }, 600);
    return () => clearTimeout(to);
  }, [lastEffect, settings.reducedMotion]);

  return (
    <div ref={containerRef} className="relative">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2.5">System</div>
      {lines.length > 0 && (
        <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full" aria-hidden="true">
          {lines.map((l, i) => (
            <path
              key={i}
              d={`M 14 ${l.y1} C -6 ${(l.y1 + l.y2) / 2}, -6 ${(l.y1 + l.y2) / 2}, 14 ${l.y2}`}
              stroke="#00C2A8" strokeWidth="2" fill="none" strokeDasharray="6 4"
              style={{ animation: `lg-dash 0.5s ease ${i * 70}ms both` }}
            />
          ))}
        </svg>
      )}
      <div className="flex flex-col gap-2">
        {buttons.map((b) => (
          <SwitchRow
            key={b.id}
            innerRef={(el) => (rowRefs.current[b.id] = el)}
            button={b}
            on={!!states[b.id]}
            locked={!!locks[b.id]}
            available={canPress(states, locks, b)}
            highlight={highlightId === b.id}
            flash={flashIds.includes(b.id)}
            flashDelay={Math.max(0, flashIds.indexOf(b.id)) * 70}
            denied={deniedId === b.id}
            hidden={!!b.mystery && !revealed[b.id]}
            onPress={onPress}
            onPreview={onPreview}
            onPreviewEnd={onPreviewEnd}
            colorblind={settings.colorblind}
            reducedMotion={settings.reducedMotion}
          />
        ))}
      </div>
    </div>
  );
}