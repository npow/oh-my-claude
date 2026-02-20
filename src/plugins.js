// src/plugins.js — Plugin discovery and loading
// Zero dependencies. Node 18+ ESM.
//
// Scans ~/.claude/oh-my-claude/plugins/<name>/plugin.js for user-defined plugins.
// Each plugin must export `meta` (object with `name` string) and `render` (function).
// Bad or missing plugins are silently skipped — never crash the statusline.

import { readdirSync, statSync, accessSync, readFileSync, constants } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { cachedExecPlugin } from './cache.js';

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

  // 2. For each entry, check if it's a directory with a plugin.js or executable plugin
  for (const entry of entries) {
    try {
      const entryPath = join(PLUGINS_DIR, entry);
      const stat = statSync(entryPath);
      if (!stat.isDirectory()) continue;

      // Try plugin.js first (in-process, fast)
      const pluginJsPath = join(entryPath, 'plugin.js');
      let loaded = false;

      try {
        statSync(pluginJsPath);
        const mod = await import(pathToFileURL(pluginJsPath).href);
        if (mod.meta && typeof mod.meta.name === 'string' && mod.meta.name && typeof mod.render === 'function') {
          plugins[mod.meta.name] = mod;
          loaded = true;
        }
      } catch {
        // plugin.js not found or invalid — try script fallback
      }

      if (loaded) continue;

      // Fallback: check for executable `plugin` file (script plugin)
      const scriptPath = join(entryPath, 'plugin');
      try {
        accessSync(scriptPath, constants.X_OK);
      } catch {
        continue; // Not executable or doesn't exist
      }

      const manifest = loadManifest(entryPath, entry);
      const wrapped = wrapScriptPlugin(scriptPath, manifest);
      plugins[manifest.name] = wrapped;
    } catch {
      // Bad plugin — skip silently, never crash the statusline
      continue;
    }
  }

  return plugins;
}

/**
 * Load plugin.json manifest from a plugin directory, or return defaults.
 *
 * @param {string} pluginDir - Absolute path to plugin directory
 * @param {string} dirName - Directory name (used as fallback plugin name)
 * @returns {{ name: string, description: string, cacheTtl: number, defaultConfig: object }}
 */
function loadManifest(pluginDir, dirName) {
  const defaults = {
    name: dirName,
    description: '',
    cacheTtl: 5000,
    defaultConfig: {},
  };

  try {
    const raw = readFileSync(join(pluginDir, 'plugin.json'), 'utf8');
    const manifest = JSON.parse(raw);
    return {
      name: (typeof manifest.name === 'string' && manifest.name) || defaults.name,
      description: manifest.description || defaults.description,
      cacheTtl: typeof manifest.cacheTtl === 'number' ? manifest.cacheTtl : defaults.cacheTtl,
      defaultConfig: manifest.defaultConfig || defaults.defaultConfig,
    };
  } catch {
    return defaults;
  }
}

/**
 * Wrap a script plugin as a {meta, render} object compatible with the plugin contract.
 *
 * @param {string} scriptPath - Absolute path to the executable plugin file
 * @param {{ name: string, description: string, cacheTtl: number, defaultConfig: object }} manifest
 * @returns {{ meta: object, render: function }}
 */
function wrapScriptPlugin(scriptPath, manifest) {
  return {
    meta: {
      name: manifest.name,
      description: manifest.description,
      requires: [],
      defaultConfig: manifest.defaultConfig,
    },
    render(data, config) {
      const payload = JSON.stringify({ ...data, _config: config });
      return cachedExecPlugin(manifest.name, scriptPath, payload, manifest.cacheTtl);
    },
  };
}

/**
 * Return the plugins directory path (used by CLI commands).
 * @returns {string}
 */
export function getPluginsDir() {
  return PLUGINS_DIR;
}
