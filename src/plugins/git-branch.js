// src/plugins/git-branch.js — Current git branch name
// Zero dependencies. Node 18+ ESM.

import { cachedExec } from '../cache.js';

export const meta = {
  name: 'git-branch',
  description: 'Shows the current git branch name',
  requires: ['git'],
  defaultConfig: {
    style: 'green',
    icon: false,
    maxLength: 30,
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const branch = cachedExec('git-branch', 'git rev-parse --abbrev-ref HEAD');
  if (!branch) return null;

  let display = branch;
  if (display.length > cfg.maxLength) {
    display = display.slice(0, cfg.maxLength - 3) + '...';
  }

  const text = cfg.icon ? `\uE0A0 ${display}` : display;

  return { text, style: cfg.style };
}
