// src/plugins/vibe-check.js — Session mood indicator derived from metrics
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'vibe-check',
  description: 'Shows a one-word mood indicator derived from session metrics',
  requires: [],
  defaultConfig: {
    style: '',
    showEmoji: true,
  },
};

/**
 * Vibes in priority order (highest wins). Each entry:
 *   test(data)  — returns true when this vibe applies
 *   emoji       — emoji prefix
 *   label       — text label
 *   style       — ANSI style string
 */
const VIBES = [
  {
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 80,
    emoji: '\u{1F9D8}',
    label: 'time to compact',
    style: 'bold red',
  },
  {
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 65,
    emoji: '\u{1F630}',
    label: 'sweating',
    style: 'bold yellow',
  },
  {
    test: (d) => (d?.cost?.total_cost_usd ?? 0) >= 15,
    emoji: '\u{1F4B8}',
    label: 'burning cash',
    style: 'bold magenta',
  },
  {
    test: (d) =>
      (d?.cost?.total_lines_added ?? 0) >= 100 &&
      (d?.context_window?.used_percentage ?? 0) >= 40,
    emoji: '\u{1F525}',
    label: 'cooking',
    style: 'bold yellow',
  },
  {
    test: (d) =>
      (d?.cost?.total_duration_ms ?? 0) >= 1_800_000 &&
      (d?.context_window?.used_percentage ?? 0) < 60,
    emoji: '\u{1F3AF}',
    label: 'locked in',
    style: 'cyan',
  },
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) >= 200,
    emoji: '\u{1F680}',
    label: 'shipping',
    style: 'bold green',
  },
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) >= 50,
    emoji: '\u{1F3D7}\uFE0F',
    label: 'building',
    style: 'green',
  },
  {
    test: (d) =>
      (d?.cost?.total_lines_added ?? 0) < 10 &&
      (d?.cost?.total_duration_ms ?? 0) >= 300_000,
    emoji: '\u{1F50D}',
    label: 'exploring',
    style: 'blue',
  },
  {
    test: (d) => (d?.cost?.total_duration_ms ?? 0) < 120_000,
    emoji: '\u2615',
    label: 'warming up',
    style: 'dim',
  },
];

const DEFAULT_VIBE = {
  emoji: '\u2728',
  label: 'vibing',
  style: 'cyan',
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Find the first matching vibe (priority order), or fall back to default
  const vibe = VIBES.find((v) => v.test(data)) ?? DEFAULT_VIBE;

  const text = cfg.showEmoji
    ? `${vibe.emoji} ${vibe.label}`
    : vibe.label;

  // Allow per-plugin style override; fall back to vibe-specific style
  const style = cfg.style || vibe.style;

  return { text, style };
}
