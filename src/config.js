// src/config.js — Configuration loader
// Zero dependencies. Node 18+ ESM.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, '..');
const THEMES_DIR = join(PACKAGE_ROOT, 'themes');
const DEFAULT_USER_CONFIG_PATH = join(homedir(), '.claude', 'oh-my-claude', 'config.json');

/**
 * Deep merge source into target (mutates target).
 * Arrays are replaced, not merged.
 *
 * @param {object} target
 * @param {object} source
 * @returns {object} The merged target
 */
function deepMerge(target, source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return target;
  if (!target || typeof target !== 'object' || Array.isArray(target)) return source;

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) &&
      tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)
    ) {
      target[key] = deepMerge(tgtVal, srcVal);
    } else {
      target[key] = srcVal;
    }
  }

  return target;
}

/**
 * Read and parse a JSON file. Returns null on any failure.
 *
 * @param {string} filepath
 * @returns {object|null}
 */
function readJson(filepath) {
  try {
    const raw = readFileSync(filepath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Returns the hardcoded default theme configuration.
 * Used as ultimate fallback if no theme files are found.
 *
 * @returns {object}
 */
export function getDefaultConfig() {
  return {
    separator: ' | ',
    lines: [
      {
        left: ['model', 'context', 'cost'],
        right: ['project'],
      },
    ],
    segments: {
      model: {
        style: 'bold cyan',
      },
      context: {
        style: 'yellow',
        warn_threshold: 60,
        critical_threshold: 80,
        warn_style: 'bold yellow',
        critical_style: 'bold red',
      },
      cost: {
        style: 'green',
        warn_threshold: 5,
        critical_threshold: 10,
        warn_style: 'bold yellow',
        critical_style: 'bold red',
      },
      project: {
        style: 'blue',
      },
    },
  };
}

/**
 * Load a theme file by name from the themes/ directory.
 *
 * @param {string} themeName - Theme name (without .json extension)
 * @returns {object|null} Parsed theme config or null
 */
function loadTheme(themeName) {
  if (!themeName || typeof themeName !== 'string') return null;
  const themePath = join(THEMES_DIR, `${themeName}.json`);
  return readJson(themePath);
}

/**
 * Load the full configuration by merging theme + user overrides.
 *
 * Resolution order:
 *   1. Start with hardcoded default config
 *   2. Load theme file specified by user config (or "default" theme)
 *   3. Deep merge theme on top of defaults
 *   4. Deep merge user's per-segment config on top
 *   5. Return final config
 *
 * @param {string} [userConfigPath] - Path to user config file (defaults to ~/.claude/oh-my-claude/config.json)
 * @returns {object} Final merged configuration
 */
export function loadConfig(userConfigPath) {
  const configPath = userConfigPath || DEFAULT_USER_CONFIG_PATH;

  // Start with hardcoded defaults
  let config = getDefaultConfig();

  // Read user config to determine theme name
  const userConfig = readJson(configPath);
  const themeName = (userConfig && userConfig.theme) || 'default';

  // Load and merge theme
  const themeConfig = loadTheme(themeName);
  if (themeConfig) {
    config = deepMerge(config, themeConfig);
  }

  // Merge user per-segment overrides
  if (userConfig && userConfig.segments) {
    if (!config.segments) config.segments = {};
    config.segments = deepMerge(config.segments, userConfig.segments);
  }

  return config;
}
