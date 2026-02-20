// src/plugins/git-status.js — Git working tree status indicators
// Zero dependencies. Node 18+ ESM.

import { cachedExec } from '../cache.js';

export const meta = {
  name: 'git-status',
  description: 'Shows git status indicators: staged, modified, untracked counts',
  requires: ['git'],
  defaultConfig: {
    style: 'yellow',
    format: 'short',
  },
};

/**
 * Parse the trimmed output of `wc -l` to an integer.
 * @param {string} output
 * @returns {number}
 */
function parseCount(output) {
  const n = parseInt(output.trim(), 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const staged = parseCount(cachedExec('git-staged', 'git diff --cached --numstat | wc -l'));
  const modified = parseCount(cachedExec('git-modified', 'git diff --numstat | wc -l'));
  const untracked = parseCount(cachedExec('git-untracked', 'git ls-files --others --exclude-standard | wc -l'));

  if (staged === 0 && modified === 0 && untracked === 0) return null;

  let text;
  if (cfg.format === 'detailed') {
    const parts = [];
    if (staged > 0) parts.push(`staged:${staged}`);
    if (modified > 0) parts.push(`mod:${modified}`);
    if (untracked > 0) parts.push(`new:${untracked}`);
    text = parts.join(' ');
  } else {
    const parts = [];
    if (staged > 0) parts.push(`+${staged}`);
    if (modified > 0) parts.push(`~${modified}`);
    if (untracked > 0) parts.push(`?${untracked}`);
    text = parts.join(' ');
  }

  return { text, style: cfg.style };
}
