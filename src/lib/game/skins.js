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

// Patterned tracks.
export const PATTERNS = [
  { id: 'zebra', name: 'Zebra', cost: 20, bg: 'repeating-linear-gradient(60deg,#111827 0 5px,#F8FAFC 5px 11px)', glow: '#94A3B8' },
  { id: 'tiger', name: 'Tiger', cost: 22, bg: 'repeating-linear-gradient(60deg,#1F1300 0 4px,#F97316 4px 11px)', glow: '#F97316' },
  { id: 'candy', name: 'Candy Cane', cost: 18, bg: 'repeating-linear-gradient(45deg,#EF4444 0 5px,#FFFFFF 5px 10px)', glow: '#EF4444' },
  { id: 'polka', name: 'Polka', cost: 18, bg: 'radial-gradient(circle,#FFFFFF 1.5px,transparent 2px) 0 0/8px 8px, #8B5CF6', glow: '#8B5CF6' },
  { id: 'checker', name: 'Checker', cost: 25, bg: 'repeating-conic-gradient(#111827 0 25%,#F8FAFC 0 50%) 0 0/10px 10px', glow: '#94A3B8' },
  { id: 'leopard', name: 'Leopard', cost: 30, bg: 'radial-gradient(circle at 30% 40%,#3B2410 2px,transparent 2.5px) 0 0/9px 9px, radial-gradient(circle at 70% 70%,#3B2410 1.5px,transparent 2px) 0 0/7px 7px, #E0A04A', glow: '#E0A04A' },
  { id: 'rainbow', name: 'Rainbow', cost: 60, bg: 'linear-gradient(90deg,#EF4444,#F97316,#F5B21B,#22C55E,#3B82F6,#8B5CF6)', glow: '#F5B21B' },
];

// Track outline shapes.
export const TRACKS = [
  { id: 'pill', name: 'Pill', cost: 0, radius: '9999px' },
  { id: 'soft', name: 'Soft Square', cost: 8, radius: '10px' },
  { id: 'block', name: 'Block', cost: 12, radius: '3px' },
];

// Knob (thumb) styles.
export const KNOBS = [
  { id: 'classic', name: 'Classic', cost: 0, bg: '#FFFFFF', radius: '9999px' },
  { id: 'pearl', name: 'Pearl', cost: 6, bg: 'radial-gradient(circle at 30% 30%,#FFFFFF,#DCE3F0)', radius: '9999px' },
  { id: 'midnight', name: 'Midnight', cost: 10, bg: '#161C3A', radius: '9999px', ring: '#FFFFFF' },
  { id: 'cube', name: 'Cube', cost: 15, bg: '#FFFFFF', radius: '6px' },
  { id: 'golden', name: 'Golden', cost: 30, bg: 'radial-gradient(circle at 30% 30%,#FFE9A8,#F5B21B)', radius: '9999px' },
  { id: 'star', name: 'Star Core', cost: 45, bg: '#FFFFFF', radius: '9999px', star: true },
  { id: 'diamond', name: 'Diamond', cost: 20, bg: '#FFFFFF', radius: '0', clip: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' },
  { id: 'hexagon', name: 'Hexagon', cost: 20, bg: '#FFFFFF', radius: '0', clip: 'polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)' },
  { id: 'triangle', name: 'Triangle', cost: 25, bg: '#FFFFFF', radius: '0', clip: 'polygon(50% 5%,100% 95%,0 95%)' },
  { id: 'heart', name: 'Heart', cost: 35, bg: 'transparent', radius: '0', icon: 'heart' },
  { id: 'zebraknob', name: 'Zebra Knob', cost: 30, bg: 'repeating-linear-gradient(60deg,#111827 0 3px,#F8FAFC 3px 7px)', radius: '9999px' },
];

const FREE = ['mint', 'classic', 'pill'];
const ALL_COLORS = [...COLORS, ...PATTERNS];

function getSkinSave() {
  return { owned: [], color: 'mint', knob: 'classic', track: 'pill', ...(loadSave().skins || {}) };
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
    color: ALL_COLORS.find((c) => c.id === s.color) || COLORS[0],
    knob: KNOBS.find((k) => k.id === s.knob) || KNOBS[0],
    track: TRACKS.find((t) => t.id === s.track) || TRACKS[0],
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