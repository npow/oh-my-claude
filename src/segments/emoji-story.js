// src/segments/emoji-story.js — Summarize the session as a growing sequence of emojis
// Zero dependencies. Node 18+ ESM.
//
// On each render, checks conditions in priority order and appends the FIRST
// matching emoji that isn't already the last element of the story array.
// The story grows over time, capped at maxLength (default 12).
// Module-level state: the story array persists across renders within a process.

/** @type {string[]} */
const story = [];

/**
 * Condition table — checked in order, first match wins.
 * Each entry: { test(data) -> boolean, emoji: string }
 */
const CONDITIONS = [
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) > 0,
    emoji: '\u{1F4DD}',  // 📝
  },
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) > 50,
    emoji: '\u270F\uFE0F', // ✏️
  },
  {
    test: (d) =>
      (d?.cost?.total_lines_removed ?? 0) > (d?.cost?.total_lines_added ?? 0),
    emoji: '\u{1F5D1}\uFE0F', // 🗑️
  },
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) > 200,
    emoji: '\u{1F3D7}\uFE0F', // 🏗️
  },
  {
    test: (d) => (d?.cost?.total_cost_usd ?? 0) > 5,
    emoji: '\u{1F4B0}', // 💰
  },
  {
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 50,
    emoji: '\u23F3', // ⏳
  },
  {
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 80,
    emoji: '\u{1F525}', // 🔥
  },
  {
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 95,
    emoji: '\u{1F480}', // 💀
  },
  {
    test: (d) => (d?.cost?.total_duration_ms ?? 0) > 1_800_000,
    emoji: '\u2615', // ☕
  },
  {
    test: (d) => (d?.cost?.total_duration_ms ?? 0) > 3_600_000,
    emoji: '\u{1F3C3}', // 🏃
  },
];

export const meta = {
  name: 'emoji-story',
  description: 'Summarize the session as a growing sequence of emojis',
  requires: [],
  defaultConfig: {
    style: 'dim',
    maxLength: 12,
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  const maxLen = cfg.maxLength ?? 12;
  const last = story.length > 0 ? story[story.length - 1] : null;

  // Find the first matching condition whose emoji isn't already the last one
  for (const cond of CONDITIONS) {
    if (cond.test(data) && cond.emoji !== last) {
      story.push(cond.emoji);
      break;
    }
  }

  // Cap length by shifting from front
  while (story.length > maxLen) {
    story.shift();
  }

  if (story.length === 0) return null;

  const text = story.join('');
  const style = cfg.style || 'dim';

  return { text, style };
}
