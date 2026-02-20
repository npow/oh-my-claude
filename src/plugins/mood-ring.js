// src/plugins/mood-ring.js — Session mood based on metrics
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'mood-ring',
  description: 'Shows a color-coded mood based on session health',
  requires: [],
  defaultConfig: {},
};

export function render(data, config) {
  const pct = data?.context_window?.used_percentage;
  const cost = data?.cost?.total_cost_usd;
  const lines = data?.cost?.total_lines_added;
  if (pct == null) return null;

  // Score session health: lower is worse
  let score = 100;
  if (pct > 80) score -= 40;
  else if (pct > 60) score -= 20;
  if (cost > 10) score -= 30;
  else if (cost > 5) score -= 15;
  if ((lines || 0) > 200) score += 10;

  if (score >= 80) return { text: '\u{1F49A}', style: 'green' };       // green heart
  if (score >= 60) return { text: '\u{1F49B}', style: 'yellow' };      // yellow heart
  if (score >= 40) return { text: '\u{1F9E1}', style: 'yellow' };      // orange heart
  return { text: '\u{2764}\uFE0F', style: 'red' };                     // red heart
}
