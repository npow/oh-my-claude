// src/segments/directory.js — Current working directory display
// Zero dependencies. Node 18+ ESM.

import { homedir } from 'node:os';

export const meta = {
  name: 'directory',
  description: 'Shows the current working directory',
  requires: [],
  defaultConfig: {
    style: 'white',
    format: 'basename',
    icon: false,
  },
};

/**
 * Fish-style path abbreviation: abbreviate all path components except the last
 * to their first character, and replace $HOME with ~.
 *
 * Example: /Users/npow/code/myproject -> ~/c/m/myproject
 *
 * @param {string} dirPath - Full directory path
 * @returns {string}
 */
function fishFormat(dirPath) {
  const home = homedir();
  let p = dirPath;

  // Replace home dir with ~
  if (p === home) return '~';
  if (p.startsWith(home + '/')) {
    p = '~' + p.slice(home.length);
  }

  const parts = p.split('/');
  if (parts.length <= 1) return p;

  // Abbreviate all components except the last to their first character
  const abbreviated = parts.map((part, i) => {
    if (i === parts.length - 1) return part;
    if (part === '~') return '~';
    if (part === '') return '';
    return part[0];
  });

  return abbreviated.join('/');
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const dirPath = data?.workspace?.current_dir;
  if (!dirPath) return null;

  let display;
  if (cfg.format === 'full') {
    display = dirPath;
  } else if (cfg.format === 'fish') {
    display = fishFormat(dirPath);
  } else {
    // basename
    const parts = dirPath.split('/');
    display = parts[parts.length - 1] || dirPath;
  }

  const text = cfg.icon ? `\uF115 ${display}` : display;

  return { text, style: cfg.style };
}
