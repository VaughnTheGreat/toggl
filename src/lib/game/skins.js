import { loadSave, spendStars } from '@/lib/game/storage';

const KEY = 'logicgrid_save';

// Prices scale steeply by tier — a level awards at most 3 stars.

// Switch track colors (the ON state). `bg` may be a solid color or gradient.
export const COLORS = [
  { id: 'mint', name: 'Mint', cost: 0, bg: '#00C2A8', glow: '#00C2A8' },
  { id: 'ocean', name: 'Ocean', cost: 30, bg: '#3B82F6', glow: '#3B82F6' },
  { id: 'violet', name: 'Violet', cost: 50, bg: '#8B5CF6', glow: '#8B5CF6' },
  { id: 'sunset', name: 'Sunset', cost: 75, bg: '#F97316', glow: '#F97316' },
  { id: 'rose', name: 'Rose', cost: 100, bg: '#EC4899', glow: '#EC4899' },
  { id: 'crimson', name: 'Crimson', cost: 140, bg: '#EF4444', glow: '#EF4444' },
  { id: 'gold', name: 'Gold', cost: 250, bg: 'linear-gradient(135deg,#F5B21B,#FFD86B)', glow: '#F5B21B' },
  { id: 'aurora', name: 'Aurora', cost: 400, bg: 'linear-gradient(135deg,#00C2A8,#6C9EFF,#8B5CF6)', glow: '#6C9EFF' },
  { id: 'sunrise', name: 'Sunrise', cost: 600, bg: 'linear-gradient(135deg,#F97316,#EC4899,#F5B21B)', glow: '#EC4899' },
];

// Patterned tracks.
export const PATTERNS = [
  { id: 'candy', name: 'Candy Cane', cost: 700, bg: 'repeating-linear-gradient(45deg,#EF4444 0 5px,#FFFFFF 5px 10px)', glow: '#EF4444' },
  { id: 'polka', name: 'Polka', cost: 800, bg: 'radial-gradient(circle,#FFFFFF 1.5px,transparent 2px) 0 0/8px 8px, #8B5CF6', glow: '#8B5CF6' },
  { id: 'zebra', name: 'Zebra', cost: 900, bg: 'repeating-linear-gradient(60deg,#111827 0 5px,#F8FAFC 5px 11px)', glow: '#94A3B8' },
  { id: 'plaid', name: 'Plaid', cost: 1000, bg: 'repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 3px,transparent 3px 9px), repeating-linear-gradient(90deg,rgba(0,0,0,.28) 0 3px,transparent 3px 9px), #DC2626', glow: '#DC2626' },
  { id: 'tiger', name: 'Tiger', cost: 1100, bg: 'repeating-linear-gradient(60deg,#1F1300 0 4px,#F97316 4px 11px)', glow: '#F97316' },
  { id: 'camo', name: 'Camo', cost: 1200, bg: 'radial-gradient(circle at 20% 30%,#3F4F2A 3px,transparent 4px) 0 0/12px 12px, radial-gradient(circle at 70% 60%,#2A3520 4px,transparent 5px) 0 0/14px 14px, #6B7A45', glow: '#6B7A45' },
  { id: 'carbon', name: 'Carbon Fiber', cost: 1350, bg: 'repeating-linear-gradient(45deg,#374151 0 2px,#111827 2px 4px)', glow: '#64748B' },
  { id: 'checker', name: 'Checker', cost: 1500, bg: 'repeating-conic-gradient(#111827 0 25%,#F8FAFC 0 50%) 0 0/10px 10px', glow: '#94A3B8' },
  { id: 'waves', name: 'Ocean Waves', cost: 1650, bg: 'repeating-radial-gradient(circle at 0 100%,#0EA5E9 0 4px,#7DD3FC 4px 8px)', glow: '#0EA5E9' },
  { id: 'leopard', name: 'Leopard', cost: 1800, bg: 'radial-gradient(circle at 30% 40%,#3B2410 2px,transparent 2.5px) 0 0/9px 9px, radial-gradient(circle at 70% 70%,#3B2410 1.5px,transparent 2px) 0 0/7px 7px, #E0A04A', glow: '#E0A04A' },
  { id: 'lava', name: 'Lava', cost: 2000, bg: 'radial-gradient(circle at 30% 50%,#FDE047,transparent 40%), linear-gradient(90deg,#7F1D1D,#EA580C,#DC2626)', glow: '#EA580C' },
  { id: 'galaxy', name: 'Galaxy', cost: 2300, bg: 'radial-gradient(circle,#FFFFFF 1px,transparent 1.5px) 0 0/11px 11px, linear-gradient(135deg,#1E1B4B,#6D28D9,#DB2777)', glow: '#6D28D9' },
  { id: 'holo', name: 'Holographic', cost: 2600, bg: 'linear-gradient(120deg,#A5F3FC,#C4B5FD,#FBCFE8,#FDE68A,#A5F3FC)', glow: '#C4B5FD' },
  { id: 'rainbow', name: 'Rainbow', cost: 3000, bg: 'linear-gradient(90deg,#EF4444,#F97316,#F5B21B,#22C55E,#3B82F6,#8B5CF6)', glow: '#F5B21B' },
];

// Track outline shapes.
export const TRACKS = [
  { id: 'pill', name: 'Pill', cost: 0, radius: '9999px' },
  { id: 'soft', name: 'Soft Square', cost: 100, radius: '10px' },
  { id: 'block', name: 'Block', cost: 200, radius: '3px' },
];

// Knob (thumb) styles.
export const KNOBS = [
  { id: 'classic', name: 'Classic', cost: 0, bg: '#FFFFFF', radius: '9999px' },
  { id: 'pearl', name: 'Pearl', cost: 40, bg: 'radial-gradient(circle at 30% 30%,#FFFFFF,#DCE3F0)', radius: '9999px' },
  { id: 'midnight', name: 'Midnight', cost: 80, bg: '#161C3A', radius: '9999px', ring: '#FFFFFF' },
  { id: 'cube', name: 'Cube', cost: 120, bg: '#FFFFFF', radius: '6px' },
  { id: 'diamond', name: 'Diamond', cost: 180, bg: '#FFFFFF', radius: '0', clip: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' },
  { id: 'hexagon', name: 'Hexagon', cost: 220, bg: '#FFFFFF', radius: '0', clip: 'polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)' },
  { id: 'octagon', name: 'Octagon', cost: 260, bg: '#FFFFFF', radius: '0', clip: 'polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)' },
  { id: 'zebraknob', name: 'Zebra Knob', cost: 300, bg: 'repeating-linear-gradient(60deg,#111827 0 3px,#F8FAFC 3px 7px)', radius: '9999px' },
  { id: 'triangle', name: 'Triangle', cost: 350, bg: '#FFFFFF', radius: '0', clip: 'polygon(50% 5%,100% 95%,0 95%)' },
  { id: 'chrome', name: 'Chrome', cost: 400, bg: 'linear-gradient(135deg,#F8FAFC,#94A3B8,#F1F5F9,#64748B)', radius: '9999px' },
  { id: 'golden', name: 'Golden', cost: 450, bg: 'radial-gradient(circle at 30% 30%,#FFE9A8,#F5B21B)', radius: '9999px' },
  { id: 'moon', name: 'Moon', cost: 500, icon: 'moon', iconColor: '#F8FAFC' },
  { id: 'bolt', name: 'Bolt', cost: 550, icon: 'bolt', iconColor: '#FDE047' },
  { id: 'heart', name: 'Heart', cost: 600, icon: 'heart', iconColor: '#FFFFFF' },
  { id: 'flower', name: 'Flower', cost: 700, icon: 'flower', iconColor: '#FBCFE8' },
  { id: 'crown', name: 'Crown', cost: 800, icon: 'crown', iconColor: '#F5B21B' },
  { id: 'star', name: 'Star Core', cost: 900, bg: '#FFFFFF', radius: '9999px', star: true },
  { id: 'galaxyknob', name: 'Galaxy Orb', cost: 1200, bg: 'radial-gradient(circle,#FFFFFF 0.8px,transparent 1.2px) 0 0/5px 5px, linear-gradient(135deg,#1E1B4B,#DB2777)', radius: '9999px' },
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