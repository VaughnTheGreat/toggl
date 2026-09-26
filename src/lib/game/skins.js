import { loadSave, spendStars } from '@/lib/game/storage';

const KEY = 'logicgrid_save';

// Switch track colors (the ON state). `bg` may be a solid color or gradient.
export const COLORS = [
  { id: 'mint', name: 'Mint', cost: 0, bg: '#00C2A8', glow: '#00C2A8' },
  { id: 'ocean', name: 'Ocean', cost: 5, bg: '#3B82F6', glow: '#3B82F6' },
  { id: 'violet', name: 'Violet', cost: 8, bg: '#8B5CF6', glow: '#8B5CF6' },
  { id: 'sunset', name: 'Sunset', cost: 10, bg: '#F97316', glow: '#F97316' },
  { id: 'rose', name: 'Rose', cost: 12, bg: '#EC4899', glow: '#EC4899' },
  { id: 'crimson', name: 'Crimson', cost: 15, bg: '#EF4444', glow: '#EF4444' },
  { id: 'gold', name: 'Gold', cost: 25, bg: 'linear-gradient(135deg,#F5B21B,#FFD86B)', glow: '#F5B21B' },
  { id: 'aurora', name: 'Aurora', cost: 40, bg: 'linear-gradient(135deg,#00C2A8,#6C9EFF,#8B5CF6)', glow: '#6C9EFF' },
  { id: 'sunrise', name: 'Sunrise', cost: 50, bg: 'linear-gradient(135deg,#F97316,#EC4899,#F5B21B)', glow: '#EC4899' },
];

// Knob (thumb) styles.
export const KNOBS = [
  { id: 'classic', name: 'Classic', cost: 0, bg: '#FFFFFF', radius: '9999px' },
  { id: 'pearl', name: 'Pearl', cost: 6, bg: 'radial-gradient(circle at 30% 30%,#FFFFFF,#DCE3F0)', radius: '9999px' },
  { id: 'midnight', name: 'Midnight', cost: 10, bg: '#161C3A', radius: '9999px', ring: '#FFFFFF' },
  { id: 'cube', name: 'Cube', cost: 15, bg: '#FFFFFF', radius: '6px' },
  { id: 'golden', name: 'Golden', cost: 30, bg: 'radial-gradient(circle at 30% 30%,#FFE9A8,#F5B21B)', radius: '9999px' },
  { id: 'star', name: 'Star Core', cost: 45, bg: '#FFFFFF', radius: '9999px', star: true },
];

const FREE = ['mint', 'classic'];

function getSkinSave() {
  return { owned: [], color: 'mint', knob: 'classic', ...(loadSave().skins || {}) };
}

function writeSkins(skins) {
  localStorage.setItem(KEY, JSON.stringify({ ...loadSave(), skins }));
}

export function getSkinState() {
  const s = getSkinSave();
  return { ...s, owned: [...FREE, ...s.owned] };
}

export function getEquippedSkin() {
  const s = getSkinSave();
  return {
    color: COLORS.find((c) => c.id === s.color) || COLORS[0],
    knob: KNOBS.find((k) => k.id === s.knob) || KNOBS[0],
  };
}

export function buySkin(item) {
  const s = getSkinSave();
  if (FREE.includes(item.id) || s.owned.includes(item.id)) return true;
  if (!spendStars(item.cost)) return false;
  writeSkins({ ...getSkinSave(), owned: [...s.owned, item.id] });
  return true;
}

export function equipSkin(kind, id) {
  writeSkins({ ...getSkinSave(), [kind]: id });
}