// src/runner.js — Main entry point
// Zero dependencies. Node 18+ ESM.
// Claude Code pipes JSON to stdin, we output a formatted statusline to stdout.
//
// CRITICAL: This script runs as a piped subprocess. Claude Code may kill the
// pipe at any time (e.g., user starts typing, debounce fires). We MUST handle
// EPIPE gracefully and ensure ANSI state is always reset to avoid corrupting
// the terminal.

import { loadConfig } from './config.js';
import { compose } from './compositor.js';
import { builtinPlugins } from './plugins/index.js';
import { discoverPlugins } from './plugins.js';

// Silently ignore EPIPE — Claude Code closing the pipe is normal, not an error.
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0);
});
process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE') process.exit(0);
  process.exit(0); // Any other crash: exit cleanly, never hang
});

/**
 * Read all of stdin as a string.
 * @returns {Promise<string>}
 */
function readStdin() {
  return new Promise((resolve) => {
    let data = '';

    // If stdin is a TTY (no piped data), resolve immediately with empty string
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', () => {
      resolve('');
    });
  });
}

/**
 * Main execution.
 */
async function main() {
  try {
    // 1. Read stdin JSON
    const raw = await readStdin();
    if (!raw.trim()) {
      process.stdout.write('');
      return;
    }

    // 2. Parse JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      process.stdout.write('');
      return;
    }

    // 3. Load config
    const config = loadConfig();
    const separator = config.separator || ' | ';

    // 4. Discover plugins and merge with built-ins
    //    User plugins override built-ins if they share the same name.
    let allPlugins = builtinPlugins;
    try {
      const userPlugins = await discoverPlugins();
      if (Object.keys(userPlugins).length > 0) {
        allPlugins = { ...builtinPlugins, ...userPlugins };
      }
    } catch {
      // Plugin discovery failed — continue with built-ins only
    }

    // 5. Process each line from config
    const lineResults = [];

    const configLines = config.lines;
    if (!configLines || !Array.isArray(configLines)) {
      process.stdout.write('');
      return;
    }

    for (const lineDef of configLines) {
      if (!lineDef) continue;

      const leftParts = renderPlugins(lineDef.left, data, config, allPlugins);
      const rightParts = renderPlugins(lineDef.right, data, config, allPlugins);

      lineResults.push({ left: leftParts, right: rightParts });
    }

    // 6. Compose and output — always end with ANSI reset to prevent state leaking
    const output = compose(lineResults, undefined, separator);
    process.stdout.write(output + '\x1b[0m');
  } catch {
    // If ANYTHING fails, reset ANSI and exit cleanly
    try { process.stdout.write('\x1b[0m'); } catch {}
  }
}

/**
 * Render an array of plugin names into an array of {text, style} results.
 *
 * @param {string[]} pluginNames - Array of plugin names from config
 * @param {object} data - Parsed stdin JSON data
 * @param {object} config - Full merged config
 * @param {Record<string, { render: function }>} pluginRegistry - Map of plugin name to module
 * @returns {Array<{text: string, style: string}>}
 */
function renderPlugins(pluginNames, data, config, pluginRegistry) {
  if (!pluginNames || !Array.isArray(pluginNames)) return [];

  const results = [];

  for (const name of pluginNames) {
    if (!name || typeof name !== 'string') continue;

    const plugin = pluginRegistry[name];
    if (!plugin || typeof plugin.render !== 'function') continue;

    const pluginConfig = (config.plugins && config.plugins[name]) || {};

    try {
      const result = plugin.render(data, pluginConfig);
      if (result == null) continue;
      if (typeof result === 'string') {
        results.push({ text: result, style: pluginConfig.style || '' });
      } else if (result.text != null) {
        results.push({
          text: String(result.text),
          style: result.style || pluginConfig.style || '',
        });
      }
    } catch {
      // Plugin threw — skip it silently
      continue;
    }
  }

  return results;
}

main();
