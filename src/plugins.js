// src/plugins.js — Plugin discovery and loading
// Zero dependencies. Node 18+ ESM.
//
// Scans ~/.claude/oh-my-claude/plugins/<name>/segment.js for user-defined segments.
// Each plugin must export `meta` (object with `name` string) and `render` (function).
// Bad or missing plugins are silently skipped — never crash the statusline.

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

const PLUGINS_DIR = join(homedir(), '.claude', 'oh-my-claude', 'plugins');

/**
 * Discover and load all valid plugins from the plugins directory.
 *
 * @returns {Promise<Record<string, { meta: object, render: function }>>}
 *   A map of { [meta.name]: module } for all valid plugins.
 *   Returns an empty object if the directory doesn't exist or no valid plugins are found.
 */
export async function discoverPlugins() {
  const plugins = {};

  // 1. List subdirectories — bail silently if dir doesn't exist
  let entries;
  try {
    entries = readdirSync(PLUGINS_DIR);
  } catch {
    return plugins;
  }

  // 2. For each entry, check if it's a directory with a segment.js
  for (const entry of entries) {
    try {
      const entryPath = join(PLUGINS_DIR, entry);
      const stat = statSync(entryPath);
      if (!stat.isDirectory()) continue;

      const segmentPath = join(entryPath, 'segment.js');

      // Verify segment.js exists before attempting import
      try {
        statSync(segmentPath);
      } catch {
        continue;
      }

      // 3. Dynamic import — use file:// URL for cross-platform ESM compatibility
      const mod = await import(pathToFileURL(segmentPath).href);

      // 4. Validate exports: must have meta.name (string) and render (function)
      if (!mod.meta || typeof mod.meta.name !== 'string' || !mod.meta.name) continue;
      if (typeof mod.render !== 'function') continue;

      plugins[mod.meta.name] = mod;
    } catch {
      // Bad plugin — skip silently, never crash the statusline
      continue;
    }
  }

  return plugins;
}

/**
 * Return the plugins directory path (used by CLI commands).
 * @returns {string}
 */
export function getPluginsDir() {
  return PLUGINS_DIR;
}
