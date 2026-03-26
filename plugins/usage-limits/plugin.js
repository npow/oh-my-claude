// usage-limits — Cross-platform oh-my-claude plugin
// Reads rate_limits from Claude Code's statusline JSON (v2.1.80+).
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'usage-limits',
  description: 'Shows 5-hour and 7-day usage window percentages with reset countdowns',
  requires: [],
  defaultConfig: {
    style: 'white',
    styleWarn: 'bold yellow',
    styleCritical: 'bold red',
    warnAt: 60,
    criticalAt: 85,
    show7d: true,
  },
};

/**
 * Format a seconds delta as a human-readable countdown.
 * @param {number} deltaSec
 * @returns {string} e.g. "2h 30m", "5d 3h", "45m"
 */
function formatCountdown(deltaSec) {
  if (!deltaSec || deltaSec <= 0) return '';

  const days = Math.floor(deltaSec / 86400);
  const hours = Math.floor((deltaSec % 86400) / 3600);
  const mins = Math.floor((deltaSec % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Format a single usage window.
 * @param {string} label - "5h" or "7d"
 * @param {{ used_percentage?: number, resets_at?: number }} window
 * @returns {string|null}
 */
function formatWindow(label, window) {
  const pct = window?.used_percentage;
  if (pct == null) return null;

  let text = `${label} ${Math.round(pct)}%`;

  const resetsAt = window.resets_at;
  if (resetsAt) {
    const deltaSec = resetsAt - Math.floor(Date.now() / 1000);
    const countdown = formatCountdown(deltaSec);
    if (countdown) text += ` ~${countdown}`;
  }

  return text;
}

/**
 * @param {object} data - Parsed statusline JSON from Claude Code
 * @param {object} config - Per-plugin config
 * @returns {{ text: string, style: string }|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const fiveHour = data?.rate_limits?.five_hour;
  if (!fiveHour || fiveHour.used_percentage == null) return null;

  const parts = [];

  const fiveText = formatWindow('5h', fiveHour);
  if (fiveText) parts.push(fiveText);

  if (cfg.show7d) {
    const sevenText = formatWindow('7d', data.rate_limits.seven_day);
    if (sevenText) parts.push(sevenText);
  }

  if (parts.length === 0) return null;

  // Determine style: highest severity across both windows wins
  let style = cfg.style;
  const pcts = [fiveHour.used_percentage];
  if (cfg.show7d && data.rate_limits.seven_day?.used_percentage != null) {
    pcts.push(data.rate_limits.seven_day.used_percentage);
  }
  const maxPct = Math.max(...pcts);

  if (maxPct >= cfg.criticalAt) {
    style = cfg.styleCritical;
  } else if (maxPct >= cfg.warnAt) {
    style = cfg.styleWarn;
  }

  return { text: parts.join(' | '), style };
}
