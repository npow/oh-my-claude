// src/plugins/loot-drop.js — Random loot drops at milestones
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'loot-drop',
  description: 'Shows random loot drops at session milestones',
  requires: [],
  defaultConfig: {
    style: 'yellow',
  },
};

const COMMON = ['\u{1F4E6} Health Potion', '\u{1F4E6} Mana Scroll', '\u{1F4E6} Debug Lens', '\u{1F4E6} Coffee Beans'];
const UNCOMMON = ['\u{1F7E2} Rubber Duck+1', '\u{1F7E2} Stack Shield', '\u{1F7E2} Lint Sword', '\u{1F7E2} Cache Ring'];
const RARE = ['\u{1F535} Mythic Keyboard', '\u{1F535} Orb of Refactoring', '\u{1F535} Helm of Focus'];
const LEGENDARY = ['\u{1F7E1} The Golden Commit', '\u{1F7E1} Mass Revert Amulet'];

function getLoot(score) {
  if (score >= 500) { const arr = LEGENDARY; return arr[score % arr.length]; }
  if (score >= 200) { const arr = RARE; return arr[score % arr.length]; }
  if (score >= 50) { const arr = UNCOMMON; return arr[score % arr.length]; }
  return COMMON[score % COMMON.length];
}

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const lines = data?.cost?.total_lines_added || 0;
  const cost = data?.cost?.total_cost_usd || 0;
  const score = lines + Math.round(cost * 10);

  // Only show at milestone thresholds
  const milestones = [10, 25, 50, 100, 150, 200, 300, 500, 750, 1000];
  const hit = milestones.filter(m => score >= m);
  if (hit.length === 0) return null;

  const latest = hit[hit.length - 1];
  return { text: getLoot(latest), style: cfg.style };
}
