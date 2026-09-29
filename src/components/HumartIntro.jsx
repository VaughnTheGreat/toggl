import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import humartLogo from '@/assets/brand/humart-logo.png';
import { getSettings } from '@/lib/game/storage';

// "Powered by Humart" intro, shown between the native launch screen and the app.
// iOS app only, once per cold launch: sessionStorage lives as long as the app's WebView, so it's
// cleared when the app is closed but survives in-app reloads (e.g. Reset progress) and navigation.
const SHOWN_KEY = 'toggl_humart_intro_shown';
const NAVY = '#0E1327';           // exact launch-screen navy (LaunchScreen.storyboard / ios.backgroundColor)
// Staged timeline (ms from start): "Powered by" fades in 0–300, logo fades in 300–650,
// both hold 650–1100, then the whole intro fades out 1100–1500.
const TEXT_FADE = 300;
const LOGO_AT = 300;
const LOGO_FADE = 350;
const OUT_AT = 1100;
const OUT_FADE = 400;
const MAX_LOGO_WAIT = 300;        // never let a slow image decode delay the app

function claimIntro() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    if (sessionStorage.getItem(SHOWN_KEY)) return false;
    sessionStorage.setItem(SHOWN_KEY, '1');
  } catch {
    // Storage unavailable: fall back to once per page load.
  }
  return true;
}

// Decided once when the app's code loads, so re-renders and navigation can never replay it.
const SHOW = claimIntro();

export default function HumartIntro() {
  // waiting → text → logo → out → done
  const [phase, setPhase] = useState(SHOW ? 'waiting' : 'done');

  useEffect(() => {
    if (!SHOW) return undefined;
    let cancelled = false;
    const timers = [];
    const img = new Image();
    img.src = humartLogo;
    const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    Promise.race([decoded, new Promise((r) => setTimeout(r, MAX_LOGO_WAIT))]).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        setPhase('text');
        timers.push(setTimeout(() => setPhase('logo'), LOGO_AT));
        timers.push(setTimeout(() => setPhase('out'), OUT_AT));
        timers.push(setTimeout(() => setPhase('done'), OUT_AT + OUT_FADE));
      });
    });
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);

  if (phase === 'done') return null;

  const reduceMotion = getSettings().reducedMotion
    || (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const textVisible = phase !== 'waiting';
  const logoVisible = phase === 'logo' || phase === 'out';
  // Normal motion: each element settles up by a few points as it fades in. Reduced motion: fades only.
  const enter = (visible, rise, ms) => ({
    opacity: visible ? 1 : 0,
    transform: visible || reduceMotion ? 'none' : `translateY(${rise}px)`,
    transition: `opacity ${ms}ms ease-out, transform ${ms}ms ease-out`,
  });

  return (
    <div
      role="img"
      aria-label="Powered by Humart"
      data-testid="humart-intro"
      className="fixed inset-0 flex flex-col items-center justify-center select-none"
      style={{
        zIndex: 2147483000,
        backgroundColor: NAVY,
        paddingBottom: '8vh',               // group sits just above centre
        opacity: phase === 'out' ? 0 : 1,
        transition: `opacity ${OUT_FADE}ms ease-in-out`,
      }}
    >
      <div className="flex flex-col items-center">
        <p
          className="m-0 text-[15px] font-medium tracking-[0.02em]"
          style={{ color: 'rgba(255, 255, 255, 0.72)', marginBottom: 22, ...enter(textVisible, 4, TEXT_FADE) }}
        >
          Powered by
        </p>
        <img
          src={humartLogo}
          alt=""
          draggable={false}
          className="block h-auto"
          style={{ width: 'min(220px, 56vw)', ...enter(logoVisible, 6, LOGO_FADE) }}
        />
      </div>
    </div>
  );
}
