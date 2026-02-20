#!/usr/bin/env node

// bin/omc.js — oh-my-claude CLI
// Usage: npx oh-my-claude [command]
// Commands: install, install <url>, theme, themes, uninstall, list, validate, create

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, chmodSync, accessSync, constants, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';
import { execSync, execFileSync } from 'node:child_process';
import { loadConfig } from '../src/config.js';
import { MOCK_DATA } from '../src/mock-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, '..');
const OMC_DIR = join(homedir(), '.claude', 'oh-my-claude');
const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');
const CONFIG_PATH = join(OMC_DIR, 'config.json');
const PLUGINS_DIR = join(OMC_DIR, 'plugins');

// ─── Colors ──────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(msg = '') { console.log(msg); }
function info(msg) { log(`${C.cyan}${msg}${C.reset}`); }
function success(msg) { log(`${C.green}✓${C.reset} ${msg}`); }
function warn(msg) { log(`${C.yellow}!${C.reset} ${msg}`); }

// ─── Prompts ─────────────────────────────────────

function ask(question, options) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    if (options) {
      log(`\n${C.bold}${question}${C.reset}`);
      options.forEach((opt, i) => log(`  ${C.cyan}${i + 1}${C.reset}) ${opt}`));
      rl.question(`\nChoose [1-${options.length}]: `, (answer) => {
        rl.close();
        const idx = parseInt(answer, 10) - 1;
        resolve(idx >= 0 && idx < options.length ? options[idx] : options[0]);
      });
    } else {
      rl.question(`${question} `, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

// ─── Install ─────────────────────────────────────

async function install() {
  log(`\n${C.bold}${C.cyan}  oh-my-claude${C.reset} installer\n`);
  log(`${C.dim}The framework for Claude Code statuslines.${C.reset}\n`);

  // 1. Choose theme
  const themes = readdirSync(join(PACKAGE_ROOT, 'themes'))
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  const theme = await ask('Which theme?', themes);
  log(`${C.dim}  → ${theme}${C.reset}`);

  // 2. Budget
  const budgetStr = await ask(`\n${C.bold}Monthly cost budget in USD?${C.reset} (default: 10) `);
  const budget = parseFloat(budgetStr) || 10;
  log(`${C.dim}  → $${budget}${C.reset}`);

  // 3. Create directories
  mkdirSync(OMC_DIR, { recursive: true });
  mkdirSync(join(OMC_DIR, 'plugins'), { recursive: true });

  // 4. Copy framework files
  const srcDest = join(OMC_DIR, 'src');
  const themesDest = join(OMC_DIR, 'themes');
  const pluginsDest = join(OMC_DIR, 'plugins');
  cpSync(join(PACKAGE_ROOT, 'src'), srcDest, { recursive: true });
  cpSync(join(PACKAGE_ROOT, 'themes'), themesDest, { recursive: true });
  cpSync(join(PACKAGE_ROOT, 'package.json'), join(OMC_DIR, 'package.json'));
  // Copy bundled script plugins (only new ones — don't overwrite user's existing plugins)
  if (existsSync(join(PACKAGE_ROOT, 'plugins'))) {
    for (const entry of readdirSync(join(PACKAGE_ROOT, 'plugins'))) {
      const dest = join(pluginsDest, entry);
      if (!existsSync(dest)) {
        cpSync(join(PACKAGE_ROOT, 'plugins', entry), dest, { recursive: true });
      }
    }
  }

  // 5. Write user config
  const config = {
    theme,
    plugins: {
      'cost-budget': { budget },
    },
  };
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  success('Config written to ' + CONFIG_PATH);

  // 6. Update Claude Code settings.json
  let settings = {};
  if (existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
      settings = {};
    }
  } else {
    mkdirSync(dirname(SETTINGS_PATH), { recursive: true });
  }

  settings.statusLine = {
    type: 'command',
    command: `node ${join(OMC_DIR, 'src', 'runner.js')}`,
  };

  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  success('Updated ' + SETTINGS_PATH);

  // 7. Show preview
  log(`\n${C.bold}Preview:${C.reset}\n`);

  try {
    const preview = execSync(`echo '${JSON.stringify(MOCK_DATA)}' | node ${join(OMC_DIR, 'src', 'runner.js')}`, { encoding: 'utf8' });
    log(preview);
  } catch {
    log(`${C.dim}(preview unavailable)${C.reset}`);
  }

  log(`\n${C.green}${C.bold}Done!${C.reset} Restart Claude Code to see your new statusline.`);
  log(`${C.dim}Config: ${CONFIG_PATH}`);
  log(`Themes: omc themes`);
  log(`Uninstall: omc uninstall${C.reset}\n`);
}

// ─── Install Plugin from URL/Path ────────────────

/**
 * Extract a plugin name from a git URL or local path.
 * Strips .git suffix, takes the last path component, lowercases it.
 */
function extractRepoName(urlOrPath) {
  const cleaned = urlOrPath.replace(/\/+$/, '').replace(/\.git$/, '');
  const parts = cleaned.split('/');
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Install a single plugin from a directory into the plugins dir.
 * Returns the plugin name, or null on failure.
 */
function installSinglePlugin(sourceDir, name) {
  const dest = join(PLUGINS_DIR, name);

  if (existsSync(dest)) {
    warn(`Plugin "${name}" already exists — skipping`);
    return null;
  }

  // Copy the plugin directory
  cpSync(sourceDir, dest, { recursive: true });

  // Check for valid plugin: plugin.js or executable plugin
  const hasPluginJs = existsSync(join(dest, 'plugin.js'));
  const pluginScript = join(dest, 'plugin');
  let hasPluginScript = false;

  if (existsSync(pluginScript)) {
    try { chmodSync(pluginScript, 0o755); } catch {}
    hasPluginScript = true;
  }

  if (!hasPluginJs && !hasPluginScript) {
    try { execSync(`rm -rf ${dest}`, { stdio: 'pipe' }); } catch {}
    return null;
  }

  // Resolve name from manifest
  let pluginName = name;
  let description = '';
  try {
    const manifest = JSON.parse(readFileSync(join(dest, 'plugin.json'), 'utf8'));
    if (manifest.name) pluginName = manifest.name;
    if (manifest.description) description = manifest.description;
  } catch {}

  const pluginType = hasPluginJs ? 'JS' : 'script';
  success(`${C.bold}${pluginName}${C.reset} (${pluginType})${description ? ` — ${C.dim}${description}${C.reset}` : ''}`);

  return pluginName;
}

/**
 * Detect monorepo: has subdirectories containing plugin.json files.
 */
function detectMonorepo(dir) {
  const plugins = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('.')) continue;
      const entryPath = join(dir, entry);
      try {
        if (!statSync(entryPath).isDirectory()) continue;
        if (existsSync(join(entryPath, 'plugin.json')) ||
            existsSync(join(entryPath, 'plugin.js')) ||
            existsSync(join(entryPath, 'plugin'))) {
          plugins.push({ name: entry, path: entryPath });
        }
      } catch {}
    }
  } catch {}
  return plugins;
}

/**
 * Install a plugin from a git URL or local path.
 * Auto-detects monorepos (subdirectories with plugin.json).
 */
function installPlugin(urlOrPath) {
  if (!urlOrPath) {
    warn('Usage: omc install <git-url-or-path>');
    log(`\n${C.dim}Example: omc install https://github.com/user/omc-plugin-hello${C.reset}`);
    log(`${C.dim}         omc install https://github.com/user/omc-plugins${C.reset}\n`);
    process.exit(1);
  }

  mkdirSync(PLUGINS_DIR, { recursive: true });

  // Clone to a temp directory first
  const tmpDir = join(PLUGINS_DIR, '.tmp-install-' + Date.now());

  log(`\n${C.bold}Installing from:${C.reset} ${urlOrPath}\n`);

  try {
    execSync(`git clone --depth 1 ${urlOrPath} ${tmpDir}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });
  } catch (err) {
    warn(`Failed to clone: ${err.message || 'unknown error'}`);
    process.exit(1);
  }

  // Check if it's a single plugin (plugin.js or plugin at root)
  const isSingle = existsSync(join(tmpDir, 'plugin.js')) || existsSync(join(tmpDir, 'plugin'));

  if (isSingle) {
    const name = extractRepoName(urlOrPath);
    const pluginName = installSinglePlugin(tmpDir, name);

    // Clean up temp dir (installSinglePlugin copies it)
    try { execSync(`rm -rf ${tmpDir}`, { stdio: 'pipe' }); } catch {}

    if (!pluginName) {
      warn('Plugin already exists or is invalid.');
      process.exit(1);
    }

    log(`\n${C.bold}Next:${C.reset} Run ${C.cyan}omc add ${pluginName}${C.reset} to add it to your statusline.\n`);
    return;
  }

  // Check for monorepo
  const subPlugins = detectMonorepo(tmpDir);

  if (subPlugins.length === 0) {
    warn('No plugins found in cloned repo.');
    log(`${C.dim}Expected: plugin.js or plugin at root, or subdirectories with plugin.json${C.reset}`);
    try { execSync(`rm -rf ${tmpDir}`, { stdio: 'pipe' }); } catch {}
    process.exit(1);
  }

  log(`  Found ${C.bold}${subPlugins.length}${C.reset} plugins:\n`);

  const installed = [];
  for (const { name, path: srcPath } of subPlugins) {
    const pluginName = installSinglePlugin(srcPath, name);
    if (pluginName) installed.push(pluginName);
  }

  // Clean up temp dir
  try { execSync(`rm -rf ${tmpDir}`, { stdio: 'pipe' }); } catch {}

  if (installed.length === 0) {
    warn('No new plugins installed (all may already exist).');
  } else {
    log(`\n${C.bold}Installed ${installed.length} plugin(s).${C.reset}`);
    log(`\n${C.bold}Next:${C.reset} Add the ones you want:`);
    for (const name of installed) {
      log(`  ${C.cyan}omc add ${name}${C.reset}`);
    }
  }
  log('');
}

// ─── Add / Remove Plugin from Statusline ─────────

/**
 * Read user config, or return a default skeleton.
 */
function readConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Add a plugin to the statusline via the inject config.
 */
async function addPlugin(name, args) {
  if (!name || typeof name !== 'string') {
    warn('Usage: omc add <plugin-name> [--line N] [--left]');
    log(`\n${C.dim}Example: omc add weather`);
    log(`         omc add weather --line 2 --left${C.reset}\n`);
    process.exit(1);
  }

  // Validate plugin exists
  const known = allPluginNames();
  if (!known.includes(name)) {
    const suggestions = fuzzyMatch(name, known);
    warn(`Plugin "${name}" not found.${suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''}`);
    log(`${C.dim}Adding anyway — plugin may be installed later.${C.reset}`);
  }

  // Check for required dependencies (from plugin.json)
  checkPluginDeps(name);

  // Parse flags
  const lineFlag = args.find(a => a.startsWith('--line'));
  let lineNum = 1;
  if (lineFlag) {
    const lineVal = lineFlag.includes('=') ? lineFlag.split('=')[1] : args[args.indexOf(lineFlag) + 1];
    lineNum = parseInt(lineVal, 10) || 1;
  }
  const side = args.includes('--left') ? 'left' : 'right';

  const config = readConfig();

  // Check if already injected
  if (config.inject) {
    const lineKey = String(lineNum);
    const existing = config.inject[lineKey]?.[side];
    if (Array.isArray(existing) && existing.includes(name)) {
      warn(`"${name}" is already on line ${lineNum} ${side} side.`);
      process.exit(0);
    }
  }

  // Add to inject
  if (!config.inject) config.inject = {};
  const lineKey = String(lineNum);
  if (!config.inject[lineKey]) config.inject[lineKey] = {};
  if (!Array.isArray(config.inject[lineKey][side])) config.inject[lineKey][side] = [];
  config.inject[lineKey][side].push(name);

  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  success(`Added ${C.bold}${name}${C.reset} → line ${lineNum}, ${side} side`);
  log(`${C.dim}Restart Claude Code to see it.${C.reset}\n`);
}

/**
 * Remove a plugin from the statusline inject config.
 */
function removePlugin(name) {
  if (!name || typeof name !== 'string') {
    warn('Usage: omc remove <plugin-name>');
    process.exit(1);
  }

  const config = readConfig();
  if (!config.inject) {
    warn(`"${name}" is not in your statusline config.`);
    process.exit(0);
  }

  let removed = false;
  for (const [lineKey, rule] of Object.entries(config.inject)) {
    for (const side of ['left', 'right']) {
      if (Array.isArray(rule[side])) {
        const idx = rule[side].indexOf(name);
        if (idx !== -1) {
          rule[side].splice(idx, 1);
          removed = true;
          // Clean up empty arrays and objects
          if (rule[side].length === 0) delete rule[side];
        }
      }
    }
    if (Object.keys(config.inject[lineKey]).length === 0) {
      delete config.inject[lineKey];
    }
  }
  if (Object.keys(config.inject).length === 0) {
    delete config.inject;
  }

  if (!removed) {
    warn(`"${name}" is not in your statusline config.`);
    process.exit(0);
  }

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  success(`Removed ${C.bold}${name}${C.reset} from statusline`);
  log(`${C.dim}Restart Claude Code to apply.${C.reset}\n`);
}

// ─── Themes ──────────────────────────────────────

function listThemes() {
  log(`\n${C.bold}Available themes:${C.reset}\n`);
  const themesDir = existsSync(join(OMC_DIR, 'themes')) ? join(OMC_DIR, 'themes') : join(PACKAGE_ROOT, 'themes');
  const themes = readdirSync(themesDir).filter(f => f.endsWith('.json'));

  for (const file of themes) {
    try {
      const theme = JSON.parse(readFileSync(join(themesDir, file), 'utf8'));
      const name = file.replace('.json', '');

      // Check if active
      let active = false;
      if (existsSync(CONFIG_PATH)) {
        try {
          const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
          active = cfg.theme === name;
        } catch {}
      }

      const marker = active ? `${C.green} ●${C.reset}` : '  ';
      log(`${marker} ${C.bold}${name}${C.reset} — ${C.dim}${theme.description || ''}${C.reset}`);
      log(`     ${C.dim}Lines: ${theme.lines?.length || 0} | Plugins: ${[...(theme.lines || [])].flatMap(l => [...(l.left || []), ...(l.right || [])]).length}${C.reset}`);
    } catch {}
  }
  log('');
}

// ─── List Plugins ────────────────────────────────

async function listPlugins() {
  log(`\n${C.bold}Built-in plugins:${C.reset}\n`);
  const plugDir = existsSync(join(OMC_DIR, 'src', 'plugins'))
    ? join(OMC_DIR, 'src', 'plugins')
    : join(PACKAGE_ROOT, 'src', 'plugins');

  const files = readdirSync(plugDir).filter(f => f.endsWith('.js') && f !== 'index.js').sort();

  for (const file of files) {
    try {
      const mod = await import(join(plugDir, file));
      const name = mod.meta?.name || file.replace('.js', '');
      const desc = mod.meta?.description || '';
      const requires = mod.meta?.requires?.length ? ` ${C.yellow}[${mod.meta.requires.join(', ')}]${C.reset}` : '';

      let preview = '';
      try {
        const result = mod.render(MOCK_DATA, mod.meta?.defaultConfig || {});
        if (result?.text) preview = ` ${C.dim}→${C.reset} ${result.text}`;
      } catch {}

      log(`  ${C.cyan}${name}${C.reset} — ${desc}${requires}${preview}`);
    } catch {}
  }
  log(`\n${C.dim}${files.length} plugins available${C.reset}`);

  // List plugins
  let pluginCount = 0;
  if (existsSync(PLUGINS_DIR)) {
    try {
      const pluginEntries = readdirSync(PLUGINS_DIR).sort();
      const validPlugins = [];

      for (const entry of pluginEntries) {
        const entryPath = join(PLUGINS_DIR, entry);
        try {
          const { statSync: statSyncFs } = await import('node:fs');
          const stat = statSyncFs(entryPath);
          if (!stat.isDirectory()) continue;

          // Try plugin.js first
          const pluginJsPath = join(entryPath, 'plugin.js');
          if (existsSync(pluginJsPath)) {
            try {
              const { pathToFileURL } = await import('node:url');
              const mod = await import(pathToFileURL(pluginJsPath).href);
              if (!mod.meta || typeof mod.meta.name !== 'string' || typeof mod.render !== 'function') {
                validPlugins.push({
                  name: entry,
                  desc: `${C.red}(invalid: missing meta.name or render)${C.reset}`,
                  path: pluginJsPath,
                  type: 'js',
                });
              } else {
                validPlugins.push({
                  name: mod.meta.name,
                  desc: mod.meta.description || '',
                  path: pluginJsPath,
                  type: 'js',
                });
              }
            } catch (err) {
              validPlugins.push({
                name: entry,
                desc: `${C.red}(error: ${err.message})${C.reset}`,
                path: pluginJsPath,
                type: 'js',
              });
            }
            continue;
          }

          // Fallback: check for executable plugin (script plugin)
          const scriptPath = join(entryPath, 'plugin');
          if (existsSync(scriptPath)) {
            let isExecutable = false;
            try { accessSync(scriptPath, constants.X_OK); isExecutable = true; } catch {}

            let pluginName = entry;
            let pluginDesc = '';
            try {
              const manifest = JSON.parse(readFileSync(join(entryPath, 'plugin.json'), 'utf8'));
              if (manifest.name) pluginName = manifest.name;
              if (manifest.description) pluginDesc = manifest.description;
            } catch {}

            validPlugins.push({
              name: pluginName,
              desc: pluginDesc + (isExecutable ? '' : ` ${C.red}(not executable)${C.reset}`),
              path: scriptPath,
              type: 'script',
            });
          }
        } catch (err) {
          validPlugins.push({
            name: entry,
            desc: `${C.red}(error: ${err.message})${C.reset}`,
            path: join(entryPath, 'plugin'),
            type: 'unknown',
          });
        }
      }

      if (validPlugins.length > 0) {
        log(`\n${C.bold}Plugins:${C.reset}\n`);
        for (const p of validPlugins) {
          const typeLabel = p.type === 'script' ? `${C.yellow}[script]${C.reset} ` : '';
          log(`  ${C.magenta}${p.name}${C.reset} ${typeLabel}— ${p.desc}`);
          log(`    ${C.dim}${p.path}${C.reset}`);
        }
        pluginCount = validPlugins.length;
        log(`\n${C.dim}${pluginCount} plugin(s) found${C.reset}`);
      }
    } catch {}
  }

  if (pluginCount === 0) {
    log(`\n${C.dim}No plugins installed. Run ${C.reset}${C.cyan}omc create <name>${C.reset}${C.dim} to create one, or ${C.reset}${C.cyan}omc install <url>${C.reset}${C.dim} to install from git.${C.reset}`);
  }

  log('');
}

// ─── Create Plugin ───────────────────────────────

function createPlugin(name, args) {
  if (!name || typeof name !== 'string') {
    warn('Usage: omc create <plugin-name> [--script] [--lang=python|bash]');
    log(`\n${C.dim}Example: omc create my-plugin`);
    log(`         omc create my-plugin --script --lang=python${C.reset}\n`);
    process.exit(1);
  }

  // Validate plugin name: lowercase letters, numbers, hyphens only
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    warn(`Invalid plugin name: "${name}"`);
    log(`\n${C.dim}Names must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.${C.reset}`);
    log(`${C.dim}Example: my-plugin, cpu-usage, weather-v2${C.reset}\n`);
    process.exit(1);
  }

  // Parse flags
  const isScript = args.includes('--script');
  const langFlag = args.find(a => a.startsWith('--lang='));
  const lang = langFlag ? langFlag.split('=')[1] : 'python';

  const pluginDir = join(PLUGINS_DIR, name);

  // Check if plugin already exists
  if (existsSync(pluginDir)) {
    warn(`Plugin "${name}" already exists at:`);
    log(`  ${C.dim}${pluginDir}${C.reset}\n`);
    process.exit(1);
  }

  mkdirSync(pluginDir, { recursive: true });

  if (isScript) {
    // Script plugin: executable plugin + plugin.json
    const scriptPath = join(pluginDir, 'plugin');
    const manifestPath = join(pluginDir, 'plugin.json');

    const manifest = {
      name,
      description: 'My custom script plugin',
      cacheTtl: 5000,
      defaultConfig: {},
    };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    let scriptContent;
    if (lang === 'bash') {
      scriptContent = `#!/usr/bin/env bash
# ${name} — script plugin for oh-my-claude
# Reads Claude Code JSON from stdin, outputs {text, style} JSON to stdout.
# Exit non-zero to hide the plugin.

set -euo pipefail

# Read stdin JSON
INPUT=$(cat)

# Extract a field (requires jq — or use other tools)
# MODEL=$(echo "$INPUT" | jq -r '.model.display_name // empty')
# CONFIG_VAL=$(echo "$INPUT" | jq -r '._config.myKey // empty')

# Output JSON
echo '{"text": "Hello from ${name}!", "style": "cyan"}'
`;
    } else {
      // Default: Python
      scriptContent = `#!/usr/bin/env python3
"""${name} — script plugin for oh-my-claude.

Reads Claude Code JSON from stdin, outputs {text, style} JSON to stdout.
Exit non-zero to hide the plugin.
"""

import json
import sys


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(1)

    # Access Claude Code data fields
    # model_name = data.get("model", {}).get("display_name", "")
    # cost = data.get("cost", {}).get("total_cost_usd", 0)

    # Access per-plugin config (merged under _config key)
    # config = data.get("_config", {})

    # Output JSON to stdout
    json.dump({"text": "Hello from ${name}!", "style": "cyan"}, sys.stdout)


if __name__ == "__main__":
    main()
`;
    }

    writeFileSync(scriptPath, scriptContent);
    chmodSync(scriptPath, 0o755);

    log(`\n${C.green}${C.bold}Script plugin created!${C.reset}\n`);
    success(`Script: ${scriptPath}`);
    success(`Manifest: ${manifestPath}`);
  } else {
    // JS plugin: plugin.js
    const pluginPath = join(pluginDir, 'plugin.js');

    const template = `// ${pluginPath}
// Custom plugin for oh-my-claude.
// Add "${name}" to your theme's lines array to use it.

export const meta = {
  name: '${name}',
  description: 'My custom plugin',
  requires: [],
  defaultConfig: {},
};

/**
 * Render this plugin.
 *
 * @param {object} data - JSON from Claude Code (use optional chaining: data?.model?.display_name)
 * @param {object} config - Per-plugin config from your theme/config.json
 * @returns {{ text: string, style: string } | null} Return { text, style } or null to hide
 */
export function render(data, config) {
  // Example: show a greeting. Replace this with your own logic.
  // Available data fields:
  //   data?.model?.display_name       - "Opus", "Sonnet", etc.
  //   data?.model?.id                 - "claude-opus-4-6", etc.
  //   data?.context_window?.used_percentage
  //   data?.cost?.total_cost_usd
  //   data?.workspace?.current_dir
  //   data?.session_id
  //   data?.version
  //
  // Return null to hide the plugin when data is unavailable.
  // Never throw — return null instead.

  return { text: 'Hello from ${name}!', style: 'cyan' };
}
`;

    writeFileSync(pluginPath, template);

    log(`\n${C.green}${C.bold}Plugin created!${C.reset}\n`);
    success(`File: ${pluginPath}`);
  }

  log(`\n${C.bold}To use it:${C.reset}\n`);
  log(`  1. Edit the plugin file to customize it:`);
  log(`     ${C.dim}${pluginDir}${C.reset}\n`);
  log(`  2. Add ${C.cyan}"${name}"${C.reset} to a theme's lines array in your config:`);
  log(`     ${C.dim}${CONFIG_PATH}${C.reset}\n`);
  log(`     Example config.json snippet:`);
  log(`     ${C.dim}{`);
  log(`       "lines": [`);
  log(`         { "left": ["model-name", "${name}"], "right": ["session-cost"] }`);
  log(`       ]`);
  log(`     }${C.reset}\n`);
  log(`  3. Restart Claude Code to see your plugin.\n`);
}

// ─── Set Theme ──────────────────────────────────

async function setTheme(name) {
  // Resolve "omc theme set <name>" → skip the "set" keyword
  if (name === 'set' || name === 'use') {
    name = process.argv[4];
  }

  if (!name) {
    warn('Usage: omc theme <name>');
    log(`\nRun ${C.cyan}omc themes${C.reset} to see available themes.\n`);
    process.exit(1);
  }

  // Sync themes from package to install dir so new themes are available
  const installedThemesDir = join(OMC_DIR, 'themes');
  if (existsSync(installedThemesDir)) {
    const packageThemes = readdirSync(join(PACKAGE_ROOT, 'themes')).filter(f => f.endsWith('.json'));
    for (const file of packageThemes) {
      const dest = join(installedThemesDir, file);
      if (!existsSync(dest)) {
        cpSync(join(PACKAGE_ROOT, 'themes', file), dest);
      }
    }
  }

  // Find themes directory
  const themesDir = existsSync(installedThemesDir) ? installedThemesDir : join(PACKAGE_ROOT, 'themes');
  const themePath = join(themesDir, `${name}.json`);

  if (!existsSync(themePath)) {
    warn(`Theme "${name}" not found.`);
    log(`\nAvailable themes:`);
    const available = readdirSync(themesDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    for (const t of available) {
      log(`  ${C.cyan}${t}${C.reset}`);
    }
    log('');
    process.exit(1);
  }

  // Read existing config or create new one
  let config = {};
  if (existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    } catch {}
  } else {
    mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  }

  const oldTheme = config.theme || 'default';
  config.theme = name;

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  // Load theme description
  let desc = '';
  try {
    const themeData = JSON.parse(readFileSync(themePath, 'utf8'));
    desc = themeData.description || '';
  } catch {}

  log('');
  success(`Theme: ${C.bold}${oldTheme}${C.reset} → ${C.bold}${C.cyan}${name}${C.reset}`);
  if (desc) log(`  ${C.dim}${desc}${C.reset}`);

  // Show preview
  try {
    const preview = execSync(`echo '${JSON.stringify(MOCK_DATA)}' | node ${join(OMC_DIR, 'src', 'runner.js')}`, { encoding: 'utf8' });
    log(`\n${C.bold}Preview:${C.reset}\n`);
    log(preview);
  } catch {}

  log(`${C.dim}Restart Claude Code to apply.${C.reset}\n`);
}

// ─── Uninstall ───────────────────────────────────

function uninstall() {
  log(`\n${C.bold}Uninstalling oh-my-claude...${C.reset}\n`);

  // Remove statusLine from settings
  if (existsSync(SETTINGS_PATH)) {
    try {
      const settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
      delete settings.statusLine;
      writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
      success('Removed statusLine from ' + SETTINGS_PATH);
    } catch {
      warn('Could not update settings.json');
    }
  }

  log(`\n${C.dim}To fully remove, delete: ${OMC_DIR}${C.reset}`);
  log(`${C.green}Done.${C.reset}\n`);
}

// ─── Shared Helpers ──────────────────────────────

/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Suggest similar names for a typo. Returns top 3 within distance <= 3.
 */
function fuzzyMatch(input, candidates) {
  if (!input || !candidates.length) return [];
  const scored = candidates
    .map(c => ({ name: c, dist: levenshtein(input.toLowerCase(), c.toLowerCase()) }))
    .filter(c => c.dist <= 3 || c.name.includes(input) || input.includes(c.name))
    .sort((a, b) => a.dist - b.dist);
  return scored.slice(0, 3).map(s => s.name);
}

/**
 * List all known plugin names (built-in + installed).
 */
function allPluginNames() {
  const names = new Set();

  // Built-in plugins
  const builtinDir = existsSync(join(OMC_DIR, 'src', 'plugins'))
    ? join(OMC_DIR, 'src', 'plugins')
    : join(PACKAGE_ROOT, 'src', 'plugins');
  try {
    for (const f of readdirSync(builtinDir)) {
      if (f.endsWith('.js') && f !== 'index.js') names.add(f.replace('.js', ''));
    }
  } catch {}

  // Installed plugins
  if (existsSync(PLUGINS_DIR)) {
    try {
      for (const entry of readdirSync(PLUGINS_DIR)) {
        const entryPath = join(PLUGINS_DIR, entry);
        try {
          if (!statSync(entryPath).isDirectory()) continue;
          if (existsSync(join(entryPath, 'plugin.js')) || existsSync(join(entryPath, 'plugin'))) {
            // Use manifest name if available
            try {
              const manifest = JSON.parse(readFileSync(join(entryPath, 'plugin.json'), 'utf8'));
              if (manifest.name) { names.add(manifest.name); continue; }
            } catch {}
            names.add(entry);
          }
        } catch {}
      }
    } catch {}
  }

  return [...names].sort();
}

/**
 * Resolve a plugin by name. Returns { source, meta, render, path } or null.
 */
async function resolvePlugin(name) {
  if (!name) return null;

  // 1. Built-in
  const builtinDir = existsSync(join(OMC_DIR, 'src', 'plugins'))
    ? join(OMC_DIR, 'src', 'plugins')
    : join(PACKAGE_ROOT, 'src', 'plugins');
  const builtinPath = join(builtinDir, `${name}.js`);
  if (existsSync(builtinPath)) {
    try {
      const mod = await import(pathToFileURL(builtinPath).href);
      if (mod.meta && typeof mod.render === 'function') {
        return { source: 'builtin', meta: mod.meta, render: mod.render, path: builtinPath };
      }
    } catch {}
  }

  // 2. Installed JS plugin
  if (existsSync(PLUGINS_DIR)) {
    // Try direct directory match first
    const dirs = [name];
    // Also scan all dirs for matching manifest name
    try {
      for (const entry of readdirSync(PLUGINS_DIR)) {
        if (!dirs.includes(entry)) dirs.push(entry);
      }
    } catch {}

    for (const dir of dirs) {
      const entryPath = join(PLUGINS_DIR, dir);
      try { if (!statSync(entryPath).isDirectory()) continue; } catch { continue; }

      // plugin.js
      const jsPath = join(entryPath, 'plugin.js');
      if (existsSync(jsPath)) {
        try {
          const mod = await import(pathToFileURL(jsPath).href);
          if (mod.meta?.name === name && typeof mod.render === 'function') {
            return { source: 'installed-js', meta: mod.meta, render: mod.render, path: jsPath };
          }
        } catch {}
      }

      // executable plugin script
      const scriptPath = join(entryPath, 'plugin');
      if (existsSync(scriptPath)) {
        let manifestName = dir;
        try {
          const manifest = JSON.parse(readFileSync(join(entryPath, 'plugin.json'), 'utf8'));
          if (manifest.name) manifestName = manifest.name;
        } catch {}

        if (manifestName === name) {
          let isExec = false;
          try { accessSync(scriptPath, constants.X_OK); isExec = true; } catch {}
          const manifest = { name: manifestName, description: '', cacheTtl: 5000, timeout: 5000, defaultConfig: {} };
          try {
            const raw = JSON.parse(readFileSync(join(entryPath, 'plugin.json'), 'utf8'));
            if (raw.description) manifest.description = raw.description;
            if (typeof raw.cacheTtl === 'number') manifest.cacheTtl = raw.cacheTtl;
            if (typeof raw.timeout === 'number') manifest.timeout = raw.timeout;
            if (raw.defaultConfig) manifest.defaultConfig = raw.defaultConfig;
          } catch {}

          return {
            source: 'installed-script',
            meta: { name: manifestName, description: manifest.description, requires: [], defaultConfig: manifest.defaultConfig },
            render: (data, config) => {
              const payload = JSON.stringify({ ...data, _config: config });
              try {
                const stdout = execFileSync(scriptPath, [], {
                  input: payload, encoding: 'utf8', timeout: manifest.timeout,
                  maxBuffer: 64 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
                }).trim();
                if (!stdout) return null;
                try {
                  const parsed = JSON.parse(stdout);
                  if (parsed && typeof parsed.text === 'string') return { text: parsed.text, style: parsed.style || '' };
                  return null;
                } catch {
                  const firstLine = stdout.split('\n')[0].trim();
                  return firstLine ? { text: firstLine, style: '' } : null;
                }
              } catch { return null; }
            },
            path: scriptPath,
            executable: isExec,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Infer type of a CLI value based on the default value's type.
 */
function inferType(rawValue, defaultValue) {
  if (typeof defaultValue === 'number') {
    const n = parseFloat(rawValue);
    return isNaN(n) ? rawValue : n;
  }
  if (typeof defaultValue === 'boolean') {
    const lower = rawValue.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lower)) return true;
    if (['false', '0', 'no', 'off'].includes(lower)) return false;
    return rawValue;
  }
  return rawValue;
}

/**
 * Check if a plugin's required dependencies are available.
 * Reads plugin.json requires field and checks each command.
 */
function checkPluginDeps(name) {
  // Check installed plugins dir
  const dirs = [join(PLUGINS_DIR, name), join(PACKAGE_ROOT, 'plugins', name)];
  for (const dir of dirs) {
    const manifestPath = join(dir, 'plugin.json');
    if (!existsSync(manifestPath)) continue;

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      if (!Array.isArray(manifest.requires)) return;

      for (const dep of manifest.requires) {
        if (dep.command) {
          // Check if command exists
          try {
            execSync(`command -v ${dep.command}`, { stdio: 'pipe', timeout: 3000 });
          } catch {
            const url = dep.url ? ` — install: ${dep.url}` : '';
            if (dep.optional) {
              log(`${C.dim}  Note: ${dep.name || dep.command} not found (optional)${url}${C.reset}`);
            } else {
              warn(`${name} requires "${dep.name || dep.command}"${url}`);
              log(`${C.dim}  Plugin will hide if the dependency is not available.${C.reset}`);
            }
          }
        } else if (dep.message) {
          log(`${C.dim}  Note: ${dep.message}${C.reset}`);
        }
      }
    } catch {}
    return;
  }
}

// ─── Config Command ─────────────────────────────

async function configPlugin(name, kvPairs) {
  if (!name) {
    warn('Usage: omc config <plugin> [key=value ...]');
    log(`\n${C.dim}Show config:  omc config weather`);
    log(`Set values:   omc config weather units=f refresh=30${C.reset}\n`);
    process.exit(1);
  }

  const resolved = await resolvePlugin(name);
  if (!resolved) {
    const suggestions = fuzzyMatch(name, allPluginNames());
    warn(`Plugin "${name}" not found.`);
    if (suggestions.length) log(`${C.dim}Did you mean: ${suggestions.join(', ')}?${C.reset}`);
    process.exit(1);
  }

  const defaults = resolved.meta.defaultConfig || {};
  const config = readConfig();
  const overrides = (config.plugins && config.plugins[name]) || {};

  if (!kvPairs || kvPairs.length === 0) {
    // Show current config
    log(`\n${C.bold}Config for ${C.cyan}${name}${C.reset}${C.bold}:${C.reset}\n`);
    const allKeys = new Set([...Object.keys(defaults), ...Object.keys(overrides)]);
    if (allKeys.size === 0) {
      log(`  ${C.dim}(no config options)${C.reset}`);
    } else {
      for (const key of [...allKeys].sort()) {
        const def = defaults[key];
        const cur = overrides[key] !== undefined ? overrides[key] : def;
        const isOverridden = overrides[key] !== undefined;
        const marker = isOverridden ? `${C.green}*${C.reset}` : ' ';
        const defStr = def !== undefined ? ` ${C.dim}(default: ${JSON.stringify(def)})${C.reset}` : '';
        log(`  ${marker} ${C.bold}${key}${C.reset} = ${JSON.stringify(cur)}${defStr}`);
      }
      log(`\n${C.dim}  * = user override${C.reset}`);
    }
    log('');
    return;
  }

  // Set values
  if (!config.plugins) config.plugins = {};
  if (!config.plugins[name]) config.plugins[name] = {};

  for (const pair of kvPairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      warn(`Invalid format: "${pair}" — use key=value`);
      continue;
    }
    const key = pair.slice(0, eqIdx);
    const rawValue = pair.slice(eqIdx + 1);

    if (!(key in defaults)) {
      warn(`Unknown key "${key}" for ${name} — setting anyway`);
    }

    const value = key in defaults ? inferType(rawValue, defaults[key]) : rawValue;
    config.plugins[name][key] = value;
    success(`${name}.${key} = ${JSON.stringify(value)}`);
  }

  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  log(`\n${C.dim}Restart Claude Code to apply.${C.reset}\n`);
}

// ─── Info Command ───────────────────────────────

async function pluginInfo(name) {
  if (!name) {
    warn('Usage: omc info <plugin>');
    process.exit(1);
  }

  const resolved = await resolvePlugin(name);
  if (!resolved) {
    const suggestions = fuzzyMatch(name, allPluginNames());
    warn(`Plugin "${name}" not found.`);
    if (suggestions.length) log(`${C.dim}Did you mean: ${suggestions.join(', ')}?${C.reset}`);
    process.exit(1);
  }

  const { source, meta, path: pluginPath } = resolved;
  const defaults = meta.defaultConfig || {};
  const config = readConfig();
  const overrides = (config.plugins && config.plugins[name]) || {};

  log(`\n${C.bold}${C.cyan}${meta.name}${C.reset}`);
  if (meta.description) log(`  ${meta.description}`);
  log('');
  log(`  ${C.bold}Source:${C.reset}  ${source}`);
  log(`  ${C.bold}Path:${C.reset}    ${pluginPath}`);
  if (meta.requires?.length) log(`  ${C.bold}Requires:${C.reset} ${meta.requires.join(', ')}`);

  // Config options table
  const allKeys = new Set([...Object.keys(defaults), ...Object.keys(overrides)]);
  if (allKeys.size > 0) {
    log(`\n  ${C.bold}Config options:${C.reset}`);
    for (const key of [...allKeys].sort()) {
      const def = defaults[key];
      const cur = overrides[key] !== undefined ? overrides[key] : def;
      const type = def !== undefined ? typeof def : typeof cur;
      const isOverridden = overrides[key] !== undefined;
      const marker = isOverridden ? `${C.green}*${C.reset}` : ' ';
      log(`  ${marker} ${key} (${C.dim}${type}${C.reset}) = ${JSON.stringify(cur)}${def !== undefined ? ` ${C.dim}[default: ${JSON.stringify(def)}]${C.reset}` : ''}`);
    }
  }

  // Check if on statusline
  const fullConfig = loadConfig();
  const lines = fullConfig.lines || [];
  const locations = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.left?.includes(name)) locations.push(`line ${i + 1} left`);
    if (line.right?.includes(name)) locations.push(`line ${i + 1} right`);
  }
  if (locations.length) {
    log(`\n  ${C.bold}Statusline:${C.reset} ${C.green}active${C.reset} — ${locations.join(', ')}`);
  } else {
    log(`\n  ${C.bold}Statusline:${C.reset} ${C.dim}not active${C.reset}`);
  }
  log('');
}

// ─── Test Command ───────────────────────────────

async function testPlugin(name) {
  if (!name) {
    warn('Usage: omc test <plugin>');
    process.exit(1);
  }

  const resolved = await resolvePlugin(name);
  if (!resolved) {
    const suggestions = fuzzyMatch(name, allPluginNames());
    warn(`Plugin "${name}" not found.`);
    if (suggestions.length) log(`${C.dim}Did you mean: ${suggestions.join(', ')}?${C.reset}`);
    process.exit(1);
  }

  const { source, meta, render } = resolved;
  const config = readConfig();
  const pluginConfig = { ...(meta.defaultConfig || {}), ...((config.plugins && config.plugins[name]) || {}) };

  log(`\n${C.bold}Testing ${C.cyan}${name}${C.reset}${C.bold} (${source}):${C.reset}\n`);

  // Run with MOCK_DATA
  log(`  ${C.bold}Input:${C.reset} MOCK_DATA (model=${MOCK_DATA.model.display_name}, cost=$${MOCK_DATA.cost.total_cost_usd})`);
  log(`  ${C.bold}Config:${C.reset} ${JSON.stringify(pluginConfig)}`);

  let result;
  let error = null;
  try {
    result = render(MOCK_DATA, pluginConfig);
  } catch (err) {
    error = err;
  }

  if (error) {
    log(`\n  ${C.red}ERROR:${C.reset} render() threw: ${error.message}`);
  } else if (result === null) {
    log(`\n  ${C.bold}Result:${C.reset} ${C.dim}null${C.reset} (plugin hidden)`);
  } else {
    log(`\n  ${C.bold}Result:${C.reset}`);
    log(`    text:  ${JSON.stringify(result.text)}`);
    log(`    style: ${JSON.stringify(result.style || '')}`);
    log(`    ${C.dim}rendered: ${result.text}${C.reset}`);
  }

  // Test with empty data
  let emptyResult;
  let emptyError = null;
  try {
    emptyResult = render({}, {});
  } catch (err) {
    emptyError = err;
  }

  log(`\n  ${C.bold}Empty data test:${C.reset} ${emptyError ? `${C.red}THREW: ${emptyError.message}${C.reset}` : emptyResult === null ? `${C.green}OK${C.reset} (returns null)` : `${C.green}OK${C.reset} → ${JSON.stringify(emptyResult?.text)}`}`);
  log('');
}

// ─── Show Command ───────────────────────────────

function showLayout() {
  const userConfig = readConfig();
  const fullConfig = loadConfig();
  const themeName = userConfig.theme || 'default';
  const lines = fullConfig.lines || [];

  // Load raw theme to distinguish theme vs inject plugins
  let themeLines = [];
  const themesDir = existsSync(join(OMC_DIR, 'themes')) ? join(OMC_DIR, 'themes') : join(PACKAGE_ROOT, 'themes');
  try {
    const theme = JSON.parse(readFileSync(join(themesDir, `${themeName}.json`), 'utf8'));
    themeLines = theme.lines || [];
  } catch {}

  log(`\n${C.bold}Current layout${C.reset} ${C.dim}(theme: ${themeName})${C.reset}\n`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const themeLine = themeLines[i] || { left: [], right: [] };
    const themeLeft = new Set(themeLine.left || []);
    const themeRight = new Set(themeLine.right || []);

    const annotate = (name, themeSet) => {
      if (themeSet.has(name)) return `${C.cyan}${name}${C.reset}`;
      return `${C.magenta}${name}${C.reset} ${C.dim}(inject)${C.reset}`;
    };

    const leftStr = (line.left || []).map(n => annotate(n, themeLeft)).join('  ');
    const rightStr = (line.right || []).map(n => annotate(n, themeRight)).join('  ');

    log(`  ${C.bold}Line ${i + 1}:${C.reset}`);
    log(`    left:  ${leftStr || `${C.dim}(empty)${C.reset}`}`);
    log(`    right: ${rightStr || `${C.dim}(empty)${C.reset}`}`);
  }

  // Render preview
  log(`\n${C.bold}Preview:${C.reset}\n`);
  const runnerPath = existsSync(join(OMC_DIR, 'src', 'runner.js'))
    ? join(OMC_DIR, 'src', 'runner.js')
    : join(PACKAGE_ROOT, 'src', 'runner.js');
  try {
    const preview = execSync(`echo '${JSON.stringify(MOCK_DATA)}' | node ${runnerPath}`, { encoding: 'utf8' });
    log(preview);
  } catch {
    log(`  ${C.dim}(preview unavailable)${C.reset}`);
  }
  log('');
}

// ─── Set Line Command ───────────────────────────

function setLine(lineArg, args) {
  const lineNum = parseInt(lineArg, 10);
  if (!lineNum || lineNum < 1) {
    warn('Usage: omc set <line> --left p1 p2 ... --right p3 p4 ...');
    log(`\n${C.dim}Example: omc set 1 --left model-name git-branch --right session-cost${C.reset}\n`);
    process.exit(1);
  }

  // Parse --left and --right sections
  let left = [];
  let right = [];
  let current = null;
  for (const arg of args) {
    if (arg === '--left') { current = 'left'; continue; }
    if (arg === '--right') { current = 'right'; continue; }
    if (current === 'left') left.push(arg);
    else if (current === 'right') right.push(arg);
  }

  if (left.length === 0 && right.length === 0) {
    warn('Specify at least --left or --right with plugin names.');
    log(`\n${C.dim}Example: omc set 1 --left model-name --right session-cost${C.reset}\n`);
    process.exit(1);
  }

  // Validate plugin names
  const known = allPluginNames();
  for (const name of [...left, ...right]) {
    if (!known.includes(name)) {
      const suggestions = fuzzyMatch(name, known);
      warn(`Plugin "${name}" not found.${suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''}`);
    }
  }

  const config = readConfig();

  // Copy-on-first-write: if user hasn't set lines, copy from theme
  if (!Array.isArray(config.lines)) {
    const fullConfig = loadConfig();
    config.lines = JSON.parse(JSON.stringify(fullConfig.lines || []));
  }

  // Ensure enough lines exist
  while (config.lines.length < lineNum) {
    config.lines.push({ left: [], right: [] });
  }

  const idx = lineNum - 1;
  config.lines[idx] = { left, right };

  // Remove inject for this line since we're setting it directly
  if (config.inject && config.inject[String(lineNum)]) {
    delete config.inject[String(lineNum)];
    if (Object.keys(config.inject).length === 0) delete config.inject;
  }

  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  success(`Line ${lineNum} set:`);
  log(`  left:  ${left.join(', ') || '(empty)'}`);
  log(`  right: ${right.join(', ') || '(empty)'}`);
  log(`\n${C.dim}Restart Claude Code to apply.${C.reset}\n`);
}

// ─── Theme Save Command ─────────────────────────

function saveTheme(name) {
  if (!name) {
    warn('Usage: omc theme save <name>');
    process.exit(1);
  }

  // Validate name
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    warn(`Invalid theme name: "${name}"`);
    log(`${C.dim}Names must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.${C.reset}\n`);
    process.exit(1);
  }

  const fullConfig = loadConfig();
  const theme = {
    name,
    description: `Custom theme saved from current config`,
    lines: fullConfig.lines || [],
    separator: fullConfig.separator || ' ',
    plugins: fullConfig.plugins || {},
  };

  const themesDir = join(OMC_DIR, 'themes');
  mkdirSync(themesDir, { recursive: true });
  const themePath = join(themesDir, `${name}.json`);
  writeFileSync(themePath, JSON.stringify(theme, null, 2));

  success(`Theme saved: ${C.bold}${name}${C.reset}`);
  log(`  ${C.dim}${themePath}${C.reset}`);
  log(`\n${C.dim}Apply it: omc theme ${name}${C.reset}\n`);
}

// ─── Doctor Command ─────────────────────────────

async function doctor() {
  log(`\n${C.bold}oh-my-claude diagnostics${C.reset}\n`);

  let ok = 0, warnings = 0, errors = 0;

  const check = (label, status, msg) => {
    if (status === 'ok') { ok++; log(`  ${C.green}OK${C.reset}   ${label}`); }
    else if (status === 'warn') { warnings++; log(`  ${C.yellow}WARN${C.reset} ${label} — ${msg}`); }
    else { errors++; log(`  ${C.red}ERR${C.reset}  ${label} — ${msg}`); }
  };

  // 1. Config file
  let config = null;
  if (!existsSync(CONFIG_PATH)) {
    check('config.json', 'warn', `Not found at ${CONFIG_PATH} — using defaults`);
  } else {
    try {
      config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      check('config.json', 'ok');
    } catch (err) {
      check('config.json', 'err', `Parse error: ${err.message}`);
    }
  }

  // 2. Theme file
  const themeName = config?.theme || 'default';
  const themesDir = existsSync(join(OMC_DIR, 'themes')) ? join(OMC_DIR, 'themes') : join(PACKAGE_ROOT, 'themes');
  const themePath = join(themesDir, `${themeName}.json`);
  if (existsSync(themePath)) {
    try {
      JSON.parse(readFileSync(themePath, 'utf8'));
      check(`theme "${themeName}"`, 'ok');
    } catch (err) {
      check(`theme "${themeName}"`, 'err', `Parse error: ${err.message}`);
    }
  } else {
    check(`theme "${themeName}"`, 'err', `Not found at ${themePath}`);
  }

  // 3. Check each plugin in resolved lines
  log('');
  const fullConfig = loadConfig();
  const lines = fullConfig.lines || [];
  const pluginNames = new Set();
  for (const line of lines) {
    for (const name of [...(line.left || []), ...(line.right || [])]) {
      pluginNames.add(name);
    }
  }

  const known = allPluginNames();

  for (const name of [...pluginNames].sort()) {
    // Check existence
    const resolved = await resolvePlugin(name);
    if (!resolved) {
      const suggestions = fuzzyMatch(name, known);
      check(`plugin "${name}"`, 'err', `Not found${suggestions.length ? ` — did you mean: ${suggestions.join(', ')}?` : ''}`);
      continue;
    }

    // Try rendering with MOCK_DATA
    const pluginConfig = { ...(resolved.meta.defaultConfig || {}), ...((fullConfig.plugins && fullConfig.plugins[name]) || {}) };
    try {
      const result = resolved.render(MOCK_DATA, pluginConfig);
      if (result === null) {
        check(`plugin "${name}"`, 'ok', `(hidden with mock data)`);
        ok--; // undo the ok from check
        warnings++;
        log(`  ${C.yellow}WARN${C.reset} plugin "${name}" — returns null with mock data`);
      } else {
        check(`plugin "${name}"`, 'ok');
      }
    } catch (err) {
      check(`plugin "${name}"`, 'err', `render() threw: ${err.message}`);
    }
  }

  // 4. Warn on orphaned plugin configs
  log('');
  if (config?.plugins) {
    for (const name of Object.keys(config.plugins)) {
      if (!pluginNames.has(name) && !known.includes(name)) {
        check(`config for "${name}"`, 'warn', 'Config exists but plugin not found');
      }
    }
  }

  // 5. Warn on empty lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((!line.left || line.left.length === 0) && (!line.right || line.right.length === 0)) {
      check(`line ${i + 1}`, 'warn', 'Empty line (no plugins)');
    }
  }

  // Summary
  log(`\n${C.bold}Summary:${C.reset} ${C.green}${ok} OK${C.reset}, ${C.yellow}${warnings} WARN${C.reset}, ${C.red}${errors} ERROR${C.reset}\n`);
}

// ─── Main ────────────────────────────────────────

const command = process.argv[2] || 'install';

switch (command) {
  case 'install': {
    // Disambiguate: if arg looks like a URL or path, install a plugin
    const installArg = process.argv[3];
    if (installArg && (installArg.includes('/') || installArg.includes(':') || installArg.startsWith('.'))) {
      installPlugin(installArg);
    } else {
      install().catch(err => { console.error(err); process.exit(1); });
    }
    break;
  }
  case 'themes':
    listThemes();
    break;
  case 'theme':
    if (process.argv[3] === 'save') {
      saveTheme(process.argv[4]);
    } else if (process.argv[3]) {
      setTheme(process.argv[3]).catch(err => { console.error(err); process.exit(1); });
    } else {
      listThemes();
    }
    break;
  case 'list':
  case 'plugins':
    listPlugins().catch(err => { console.error(err); process.exit(1); });
    break;
  case 'create':
    createPlugin(process.argv[3], process.argv.slice(4));
    break;
  case 'add':
    addPlugin(process.argv[3], process.argv.slice(4)).catch(err => { console.error(err); process.exit(1); });
    break;
  case 'remove':
    removePlugin(process.argv[3]);
    break;
  case 'uninstall':
    uninstall();
    break;
  case 'config':
    configPlugin(process.argv[3], process.argv.slice(4)).catch(err => { console.error(err); process.exit(1); });
    break;
  case 'info':
    pluginInfo(process.argv[3]).catch(err => { console.error(err); process.exit(1); });
    break;
  case 'test':
    testPlugin(process.argv[3]).catch(err => { console.error(err); process.exit(1); });
    break;
  case 'show':
    showLayout();
    break;
  case 'set':
    setLine(process.argv[3], process.argv.slice(4));
    break;
  case 'doctor':
    doctor().catch(err => { console.error(err); process.exit(1); });
    break;
  case 'validate':
    import(join(PACKAGE_ROOT, 'scripts', 'validate.js'));
    break;
  case '--help':
  case '-h':
  case 'help':
    log(`\n${C.bold}oh-my-claude${C.reset} — The framework for Claude Code statuslines\n`);
    log(`${C.bold}Usage:${C.reset} omc <command>\n`);
    log(`${C.bold}Setup:${C.reset}`);
    log(`  ${C.cyan}install${C.reset}          Install oh-my-claude (interactive wizard)`);
    log(`  ${C.cyan}install <url>${C.reset}    Install a plugin from a git URL or local path`);
    log(`  ${C.cyan}uninstall${C.reset}        Remove oh-my-claude from Claude Code`);
    log(`\n${C.bold}Layout:${C.reset}`);
    log(`  ${C.cyan}show${C.reset}             Show current layout with preview`);
    log(`  ${C.cyan}add <name>${C.reset}       Add a plugin to the statusline`);
    log(`                     ${C.dim}--line N (default: 1)  --left (default: right)${C.reset}`);
    log(`  ${C.cyan}remove <name>${C.reset}    Remove a plugin from the statusline`);
    log(`  ${C.cyan}set <line>${C.reset}       Set an entire line's plugins`);
    log(`                     ${C.dim}--left p1 p2 ... --right p3 p4 ...${C.reset}`);
    log(`\n${C.bold}Themes:${C.reset}`);
    log(`  ${C.cyan}theme${C.reset}            Set theme (omc theme <name>) or list themes`);
    log(`  ${C.cyan}theme save <n>${C.reset}   Save current config as a reusable theme`);
    log(`\n${C.bold}Plugins:${C.reset}`);
    log(`  ${C.cyan}list${C.reset}             List all available plugins`);
    log(`  ${C.cyan}info <name>${C.reset}      Show plugin details and config options`);
    log(`  ${C.cyan}config <name>${C.reset}    Show/set plugin config values`);
    log(`                     ${C.dim}omc config weather units=f refresh=30${C.reset}`);
    log(`  ${C.cyan}test <name>${C.reset}      Test a plugin with mock data`);
    log(`  ${C.cyan}create <name>${C.reset}    Create a new JS plugin`);
    log(`  ${C.cyan}create <name> --script${C.reset}`);
    log(`                     Create a script plugin (any language)`);
    log(`                     ${C.dim}--lang=python|bash (default: python)${C.reset}`);
    log(`\n${C.bold}Diagnostics:${C.reset}`);
    log(`  ${C.cyan}doctor${C.reset}           Run diagnostics on your setup`);
    log(`  ${C.cyan}validate${C.reset}         Run the plugin contract validator`);
    log(`  ${C.cyan}help${C.reset}             Show this help message\n`);
    break;
  default:
    warn(`Unknown command: ${command}`);
    log(`Run ${C.cyan}omc help${C.reset} for available commands.`);
    process.exit(1);
}
