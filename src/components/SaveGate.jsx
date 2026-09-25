import { useEffect } from 'react';
import { getSettings } from '@/lib/game/storage';
import { applyTheme } from '@/lib/game/theme';

// All progress lives on the device — just apply the saved theme and render.
export default function SaveGate({ children }) {
  useEffect(() => { applyTheme(getSettings().theme); }, []);
  return children;
}