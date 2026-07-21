// Pure rule engine — no UI dependencies. Deterministic: same input → same output.

export function canPress(states, locks, button) {
  if (locks[button.id]) return false;
  const r = button.rule;
  if (r.type === 'conditional') return !!states[r.condition.button] === r.condition.state;
  return true;
}

// Returns { states, locks, changed } — changed is the ordered list of affected button ids.
export function applyPress(states, locks, button) {
  const s = { ...states };
  const l = { ...locks };
  const changed = [];
  const r = button.rule;
  switch (r.type) {
    case 'toggle':
    case 'conditional':
      s[button.id] = !s[button.id];
      changed.push(button.id);
      break;
    case 'linked':
      for (const t of r.targets) {
        s[t] = !s[t];
        changed.push(t);
      }
      break;
    case 'lock':
      s[button.id] = !s[button.id];
      changed.push(button.id);
      for (const t of r.locks) {
        if (!l[t]) { l[t] = true; changed.push(t); }
      }
      break;
    case 'copy':
      if (s[r.source] !== s[button.id]) {
        s[button.id] = s[r.source];
        changed.push(button.id);
      }
      break;
    default:
      break;
  }
  return { states: s, locks: l, changed };
}

export function describeRule(rule, selfId) {
  const name = (id) => (id === selfId ? 'itself' : id);
  switch (rule.type) {
    case 'toggle': return 'flips itself only';
    case 'linked': return `flips ${rule.targets.map(name).join(' + ')} together`;
    case 'conditional': return `flips itself — needs ${rule.condition.button} ${rule.condition.state ? 'ON' : 'OFF'}`;
    case 'lock': return `flips itself & locks ${rule.locks.map(name).join(' + ')}`;
    case 'copy': return `becomes whatever ${rule.source} is`;
    default: return '';
  }
}