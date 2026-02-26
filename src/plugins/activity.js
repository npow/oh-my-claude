// src/plugins/activity.js — Shows current tool activity from hooks data
// Zero dependencies. Node 18+ ESM.
//
// Reads data._hooks.last_tool to show what Claude is doing right now.
// Only visible when a tool ran recently (< stale_after_ms). Returns null otherwise.
// Pure Starship philosophy: invisible when irrelevant.

export const meta = {
  name: 'activity',
  description: 'Shows current tool activity (powered by hooks)',
  requires: [],
  defaultConfig: {
    style: 'dim',
    stale_after_ms: 10000,
  },
};

/**
 * Map tool names to human-friendly labels.
 */
const TOOL_LABELS = {
  Read: 'Reading...',
  Edit: 'Editing...',
  Write: 'Writing...',
  Bash: 'Running...',
  Glob: 'Searching...',
  Grep: 'Searching...',
  WebFetch: 'Fetching...',
  WebSearch: 'Searching...',
  Task: 'Delegating...',
  NotebookEdit: 'Editing...',
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code (with _hooks merged)
 * @param {object} config - Per-plugin config
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const lastTool = data?._hooks?.last_tool;
  if (!lastTool?.name || !lastTool?.ts) return null;

  const ageMs = Date.now() - lastTool.ts;
  if (ageMs > cfg.stale_after_ms) return null;

  const label = TOOL_LABELS[lastTool.name] || `${lastTool.name}...`;

  return { text: label, style: cfg.style };
}
