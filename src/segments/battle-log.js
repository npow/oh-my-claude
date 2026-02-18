// src/segments/battle-log.js — Session framed as a dungeon crawl
// Zero dependencies. Node 18+ ESM.
//
// Context percentage maps to dungeon depth:
//   >= 95%  FINAL BOSS
//   >= 80%  Boss Battle
//   >= 60%  Deep Dungeon
//   >= 40%  Mid Dungeon
//   >= 20%  Exploring
//   <  20%  Base Camp
//
// Loot bonus: if lines_added > 0, appends gold count.

export const meta = {
  name: 'battle-log',
  description: 'Session framed as a dungeon crawl based on context depth',
  requires: [],
  defaultConfig: {
    style: '',
  },
};

const DEPTHS = [
  { min: 95, text: () => '\u2694\uFE0F FINAL BOSS (95%)',          style: 'bold red' },
  { min: 80, text: (p) => `\u2694\uFE0F Boss Battle (${p}%)`,      style: 'bold yellow' },
  { min: 60, text: (p) => `\uD83C\uDFF0 Deep Dungeon (${p}%)`,     style: 'yellow' },
  { min: 40, text: (p) => `\uD83D\uDDE1\uFE0F Mid Dungeon (${p}%)`, style: 'cyan' },
  { min: 20, text: (p) => `\uD83D\uDEAA Exploring (${p}%)`,        style: 'green' },
  { min: -Infinity, text: (p) => `\uD83C\uDFD5\uFE0F Base Camp (${p}%)`, style: 'dim' },
];

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  if (pct == null) return null;

  const rounded = Math.round(pct);
  const depth = DEPTHS.find((d) => rounded >= d.min);
  let text = depth.text(rounded);

  const linesAdded = data?.cost?.total_lines_added ?? 0;
  if (linesAdded > 0) {
    text += ` +${linesAdded} gold`;
  }

  const style = cfg.style || depth.style;

  return { text, style };
}
