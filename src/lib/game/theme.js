// Theme application. Supports 'light', 'dark', and 'system' (follows the
// device's appearance and updates live when it changes).
const mq = window.matchMedia('(prefers-color-scheme: dark)');
let current = 'light';

mq.addEventListener('change', () => {
  if (current === 'system') applyTheme('system');
});

export function applyTheme(theme) {
  current = theme;
  const dark = theme === 'system' ? mq.matches : theme === 'dark';
  document.documentElement.classList.toggle('dark', dark);
}