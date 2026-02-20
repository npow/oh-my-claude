// src/plugins/streak.js — Consecutive-day usage streak with file persistence
// Zero dependencies. Node 18+ ESM.

import { readFileSync, writeFileSync } from 'node:fs';

const STATE_FILE = '/tmp/omc-streak.json';

export const meta = {
  name: 'streak',
  description: 'Shows consecutive days using Claude Code, persisted to disk',
  requires: [],
  defaultConfig: {
    style: 'bold',
    minDays: 3,
  },
};

// Module-level flag: only write the state file once per process
let initialized = false;
let cachedCount = 0;

/**
 * Get today's date as YYYY-MM-DD in local time.
 * @returns {string}
 */
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Check whether dateA is exactly one calendar day before dateB.
 * Both are YYYY-MM-DD strings.
 *
 * @param {string} dateA - The earlier date
 * @param {string} dateB - The later date (should be today)
 * @returns {boolean}
 */
function isYesterday(dateA, dateB) {
  // Parse as local midnight to avoid timezone/DST pitfalls
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  const diffMs = b.getTime() - a.getTime();
  // 86400000 = 24 * 60 * 60 * 1000
  return diffMs === 86_400_000;
}

/**
 * Read state, compute updated streak count, write once per process.
 * @returns {number} Current streak count
 */
function resolveStreak() {
  const today = todayStr();

  // Try to read existing state
  let state = null;
  try {
    const raw = readFileSync(STATE_FILE, 'utf8');
    state = JSON.parse(raw);
  } catch {
    // File missing or corrupt — will be created fresh
  }

  let count;

  if (state && typeof state.lastDate === 'string' && typeof state.count === 'number') {
    if (state.lastDate === today) {
      // Already recorded today — keep current count
      count = state.count;
    } else if (isYesterday(state.lastDate, today)) {
      // Consecutive day — increment
      count = state.count + 1;
    } else {
      // Gap — reset
      count = 1;
    }
  } else {
    // No valid state — start fresh
    count = 1;
  }

  // Write once per process
  if (!initialized) {
    initialized = true;
    try {
      writeFileSync(STATE_FILE, JSON.stringify({ lastDate: today, count }), 'utf8');
    } catch {
      // Non-fatal: streak display still works, just won't persist
    }
  }

  return count;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Resolve streak only once; subsequent renders use cached value
  if (!cachedCount) {
    cachedCount = resolveStreak();
  }

  const minDays = cfg.minDays ?? 3;

  // Don't show until the streak is interesting
  if (cachedCount < minDays) return null;

  // Build display text
  const prefix = cachedCount >= 7 ? '\u{1F525} ' : '';
  const text = `${prefix}${cachedCount}d streak`;

  // Escalating style based on streak length
  let style;
  if (cachedCount >= 14) {
    style = 'bold red';
  } else if (cachedCount >= 7) {
    style = 'bold yellow';
  } else {
    style = cfg.style;
  }

  return { text, style };
}
