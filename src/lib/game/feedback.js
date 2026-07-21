let audioCtx;
const ctx = () => (audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)());

function tone({ freq, type = 'sine', gain = 0.06, dur = 0.12, delay = 0, slide }) {
  const c = ctx();
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// A satisfying mechanical "thock" for a single switch flip.
export function playFlip(enabled) {
  if (!enabled) return;
  try {
    tone({ freq: 480, slide: 320, type: 'sine', gain: 0.09, dur: 0.08 });
    tone({ freq: 1600, type: 'triangle', gain: 0.02, dur: 0.03 });
  } catch { /* audio unavailable */ }
}

// Rising pentatonic ripple — one note per switch affected in the cascade.
const SCALE = [523, 659, 784, 880, 1047, 1319];
export function playCascade(enabled, count = 2) {
  if (!enabled) return;
  try {
    tone({ freq: 480, slide: 320, type: 'sine', gain: 0.08, dur: 0.08 });
    for (let i = 0; i < Math.min(count, SCALE.length); i++) {
      tone({ freq: SCALE[i], type: 'sine', gain: 0.045, dur: 0.14, delay: 0.07 + i * 0.07 });
    }
  } catch { /* audio unavailable */ }
}

// Low, soft buzz for a denied press.
export function playDenied(enabled) {
  if (!enabled) return;
  try {
    tone({ freq: 120, type: 'square', gain: 0.04, dur: 0.1 });
    tone({ freq: 90, type: 'square', gain: 0.035, dur: 0.1, delay: 0.09 });
  } catch { /* audio unavailable */ }
}

// Small firework: quick arpeggio into a warm chord.
export function playWin(enabled) {
  if (!enabled) return;
  try {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'sine', gain: 0.055, dur: 0.16, delay: i * 0.09 }));
    [523, 659, 784].forEach((f) => tone({ freq: f, type: 'sine', gain: 0.03, dur: 0.5, delay: 0.4 }));
  } catch { /* audio unavailable */ }
}

// Back-compat for older call sites.
export function playClick(enabled, denied = false) {
  if (denied) playDenied(enabled);
  else playFlip(enabled);
}

export function vibrate(enabled, pattern = 15) {
  if (enabled && navigator.vibrate) navigator.vibrate(pattern);
}