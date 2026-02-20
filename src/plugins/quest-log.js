// src/plugins/quest-log.js — Current quest based on session state
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'quest-log',
  description: 'Shows a quest objective based on session progress',
  requires: [],
  defaultConfig: {
    style: 'cyan italic',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage || 0;
  const cost = data?.cost?.total_cost_usd || 0;
  const lines = data?.cost?.total_lines_added || 0;
  const durationMs = data?.cost?.total_duration_ms || 0;
  const mins = durationMs / 60000;

  let quest;
  if (pct >= 85) quest = '\u2694\uFE0F Quest: Survive the context limit';
  else if (cost >= 10) quest = '\u{1F4B8} Quest: Justify the budget';
  else if (lines >= 300) quest = '\u{1F3C6} Quest: Ship the feature';
  else if (lines >= 100) quest = '\u{1F6E0}\uFE0F Quest: Build something great';
  else if (mins >= 30) quest = '\u{23F3} Quest: Stay focused';
  else if (lines >= 10) quest = '\u{1F4DD} Quest: Write first 100 lines';
  else quest = '\u{2728} Quest: Begin the journey';

  return { text: quest, style: cfg.style };
}
