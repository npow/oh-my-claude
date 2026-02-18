// src/segments/context-percent.js — Context window usage as percentage
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'context-percent',
  description: 'Shows context window usage as a percentage',
  requires: [],
  defaultConfig: {
    style: 'white',
    warnAt: 60,
    criticalAt: 80,
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

  const rounded = Math.round(pct);

  let style;
  if (pct >= cfg.criticalAt) {
    style = cfg.styleCritical;
  } else if (pct >= cfg.warnAt) {
    style = cfg.styleWarn;
  } else {
    style = cfg.style;
  }

  return { text: `${rounded}%`, style };
}
