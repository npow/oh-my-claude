// src/segments/context-bar.js — Visual progress bar for context window usage
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'context-bar',
  description: 'Visual progress bar showing context window usage percentage',
  requires: [],
  defaultConfig: {
    width: 20,
    charFilled: '\u2593',
    charEmpty: '\u2591',
    warnAt: 60,
    criticalAt: 80,
    showPercent: true,
    styleOk: 'green',
    styleWarn: 'bold yellow',
    styleCritical: 'bold red',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  if (pct == null) return null;

  const filled = Math.round((pct / 100) * cfg.width);
  const empty = cfg.width - filled;
  let bar = cfg.charFilled.repeat(filled) + cfg.charEmpty.repeat(empty);

  if (cfg.showPercent) {
    bar += ` ${Math.round(pct)}%`;
  }

  let style;
  if (pct >= cfg.criticalAt) {
    style = cfg.styleCritical;
  } else if (pct >= cfg.warnAt) {
    style = cfg.styleWarn;
  } else {
    style = cfg.styleOk;
  }

  return { text: bar, style };
}
