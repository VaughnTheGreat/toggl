import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 110;

// Touch-driven pull-to-refresh that works with overscroll-behavior: none.
// Only engages when the page is scrolled to the very top.
export default function usePullToRefresh(onRefresh) {
  const ref = useRef(null);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const cbRef = useRef(onRefresh);
  cbRef.current = onRefresh;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (v) => { pullRef.current = v; setPull(v); };

    const onStart = (e) => {
      if (refreshingRef.current || window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
    };
    const onMove = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || window.scrollY > 0) { update(0); return; }
      update(Math.min(MAX_PULL, dy * 0.5));
    };
    const onEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current < THRESHOLD) { update(0); return; }
      refreshingRef.current = true;
      setRefreshing(true);
      update(THRESHOLD * 0.7);
      await Promise.resolve(cbRef.current?.()).catch(() => {});
      refreshingRef.current = false;
      setRefreshing(false);
      update(0);
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return { ref, pull, refreshing, ready: pull >= THRESHOLD };
}