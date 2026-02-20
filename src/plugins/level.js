// src/plugins/level.js — Level based on session metrics
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'level',
  description: 'Shows a level based on lines added and cost',
  requires: [],
  defaultConfig: {
    style: 'bold magenta',
  },
};

const TITLES = [
  'Novice',
  'Apprentice',
  'Journeyman',
  'Expert',
  'Master',
  'Grandmaster',
  'Legend',
  'Mythic',
];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const lines = data?.cost?.total_lines_added || 0;
  const cost = data?.cost?.total_cost_usd || 0;
  if (lines === 0 && cost === 0) return null;

  const score = lines + Math.round(cost * 20);
  let level;
  if (score >= 2000) level = 7;
  else if (score >= 1000) level = 6;
  else if (score >= 500) level = 5;
  else if (score >= 250) level = 4;
  else if (score >= 100) level = 3;
  else if (score >= 50) level = 2;
  else if (score >= 20) level = 1;
  else level = 0;

  return { text: `${TITLES[level]}`, style: cfg.style };
}
