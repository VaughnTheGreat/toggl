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
    case 'inverse':
      for (const t of r.targets) {
        s[t] = !s[t];
        changed.push(t);
      }
      break;
    case 'swap': {
      const a = !!s[button.id];
      const b = !!s[r.target];
      if (a !== b) {
        s[button.id] = b;
        s[r.target] = a;
        changed.push(button.id, r.target);
      }
      break;
    }
    case 'oneshot':
      s[button.id] = !s[button.id];
      l[button.id] = true;
      changed.push(button.id);
      break;
    case 'delay':
      s[button.id] = !s[button.id];
      changed.push(button.id);
      s[r.target] = !s[r.target];
      changed.push(r.target);
      break;
    case 'chain': {
      s[button.id] = !s[button.id];
      changed.push(button.id);
      if (!l[r.target]) {
        const sub = applyPress(s, l, { id: r.target, rule: r.targetRule });
        for (const c of sub.changed) if (!changed.includes(c)) changed.push(c);
        return { states: sub.states, locks: sub.locks, changed };
      }
      break;
    }
    default:
      break;
  }
  return { states: s, locks: l, changed };
}

export function describeRule(rule, selfId) {
  const name = (id) => (id === selfId ? 'this' : id);
  switch (rule.type) {
    case 'toggle': return 'flips only this switch';
    case 'linked': return `flips ${rule.targets.map(name).join(' and ')} at once`;
    case 'conditional': return `flips this — only works while ${rule.condition.button} is ${rule.condition.state ? 'ON' : 'OFF'}`;
    case 'lock': return `flips this, then freezes ${rule.locks.map(name).join(' and ')} for good`;
    case 'copy': return `sets this to match ${rule.source}`;
    case 'inverse': return 'flips every other switch (not this one)';
    case 'swap': return `swaps ON/OFF with ${rule.target}`;
    case 'oneshot': return 'flips this, then can never be used again';
    case 'chain': return `flips this, then also does ${rule.target}'s action`;
    case 'delay': return `flips this now, ${rule.target} a moment later`;
    default: return '';
  }
}