#!/usr/bin/env node

// bin/omc.js — oh-my-claude CLI
// Usage: npx oh-my-claude [command]
// Commands: install, install <url>, theme, themes, uninstall, list, validate, create

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, chmodSync, accessSync, constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';
import { execSync } from 'node:child_process';

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
  cpSync(join(PACKAGE_ROOT, 'src'), srcDest, { recursive: true });
  cpSync(join(PACKAGE_ROOT, 'themes'), themesDest, { recursive: true });
  cpSync(join(PACKAGE_ROOT, 'package.json'), join(OMC_DIR, 'package.json'));

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

  const mockData = JSON.stringify({
    model: { display_name: 'Opus', id: 'claude-opus-4-6' },
    context_window: { used_percentage: 35, context_window_size: 200000, total_input_tokens: 70000, total_output_tokens: 10000 },
    cost: { total_cost_usd: 2.45, total_duration_ms: 900000, total_api_duration_ms: 220000, total_lines_added: 83, total_lines_removed: 21 },
    workspace: { current_dir: process.cwd(), project_dir: process.cwd() },
    session_id: 'preview', version: '2.1.34',
  });

  const { execSync } = await import('node:child_process');
  try {
    const preview = execSync(`echo '${mockData}' | node ${join(OMC_DIR, 'src', 'runner.js')}`, { encoding: 'utf8' });
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
 * Install a plugin from a git URL or local path.
 */
function installPlugin(urlOrPath) {
  if (!urlOrPath) {
    warn('Usage: omc install <git-url-or-path>');
    log(`\n${C.dim}Example: omc install https://github.com/user/omc-plugin-hello${C.reset}`);
    log(`${C.dim}         omc install /path/to/local/plugin${C.reset}\n`);
    process.exit(1);
  }

  const name = extractRepoName(urlOrPath);
  const dest = join(PLUGINS_DIR, name);

  if (existsSync(dest)) {
    warn(`Plugin "${name}" already exists at:`);
    log(`  ${C.dim}${dest}${C.reset}`);
    log(`\n${C.dim}To reinstall, remove it first: rm -rf ${dest}${C.reset}\n`);
    process.exit(1);
  }

  mkdirSync(PLUGINS_DIR, { recursive: true });

  log(`\n${C.bold}Installing plugin:${C.reset} ${name}\n`);

  try {
    execSync(`git clone --depth 1 ${urlOrPath} ${dest}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });
  } catch (err) {
    warn(`Failed to clone: ${err.message || 'unknown error'}`);
    process.exit(1);
  }

  // Check for valid plugin: plugin.js or executable plugin
  const hasPluginJs = existsSync(join(dest, 'plugin.js'));
  const pluginScript = join(dest, 'plugin');
  let hasPluginScript = false;

  if (existsSync(pluginScript)) {
    // Ensure executable bit is set
    try {
      chmodSync(pluginScript, 0o755);
      hasPluginScript = true;
    } catch {
      // chmod failed — try to use it anyway
      hasPluginScript = true;
    }
  }

  if (!hasPluginJs && !hasPluginScript) {
    warn(`No plugin.js or executable plugin file found in cloned repo.`);
    log(`${C.dim}Cleaning up ${dest}${C.reset}`);
    try { execSync(`rm -rf ${dest}`, { stdio: 'pipe' }); } catch {}
    process.exit(1);
  }

  const pluginType = hasPluginJs ? 'JS (plugin.js)' : 'Script (plugin)';

  success(`Installed ${C.bold}${name}${C.reset} → ${dest}`);
  log(`  ${C.dim}Type: ${pluginType}${C.reset}`);

  // Show plugin.json info if present
  try {
    const manifest = JSON.parse(readFileSync(join(dest, 'plugin.json'), 'utf8'));
    if (manifest.description) log(`  ${C.dim}${manifest.description}${C.reset}`);
  } catch {}

  log(`\n${C.bold}To use it:${C.reset}`);
  log(`  Add ${C.cyan}"${name}"${C.reset} to a theme's lines array in your config:`);
  log(`  ${C.dim}${CONFIG_PATH}${C.reset}\n`);
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

  const MOCK_DATA = {
    model: { id: 'claude-opus-4-6', display_name: 'Opus' },
    context_window: { used_percentage: 42, context_window_size: 200000, total_input_tokens: 84000, total_output_tokens: 12000 },
    cost: { total_cost_usd: 4.56, total_duration_ms: 750000, total_api_duration_ms: 180000, total_lines_added: 83, total_lines_removed: 21 },
    workspace: { current_dir: '/Users/dev/myproject', project_dir: '/Users/dev/myproject' },
    session_id: 'demo', version: '2.1.34',
  };

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
  const mockData = JSON.stringify({
    model: { display_name: 'Opus', id: 'claude-opus-4-6' },
    context_window: { used_percentage: 35, context_window_size: 200000, total_input_tokens: 70000, total_output_tokens: 10000 },
    cost: { total_cost_usd: 2.45, total_duration_ms: 900000, total_api_duration_ms: 220000, total_lines_added: 83, total_lines_removed: 21 },
    workspace: { current_dir: process.cwd(), project_dir: process.cwd() },
    session_id: 'preview', version: '2.1.34',
  });

  const { execSync } = await import('node:child_process');
  try {
    const preview = execSync(`echo '${mockData}' | node ${join(OMC_DIR, 'src', 'runner.js')}`, { encoding: 'utf8' });
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
    if (process.argv[3]) {
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
  case 'uninstall':
  case 'remove':
    uninstall();
    break;
  case 'validate':
    import(join(PACKAGE_ROOT, 'scripts', 'validate.js'));
    break;
  case '--help':
  case '-h':
  case 'help':
    log(`\n${C.bold}oh-my-claude${C.reset} — The framework for Claude Code statuslines\n`);
    log(`${C.bold}Usage:${C.reset} omc <command>\n`);
    log(`${C.bold}Commands:${C.reset}`);
    log(`  ${C.cyan}install${C.reset}          Install oh-my-claude (interactive wizard)`);
    log(`  ${C.cyan}install <url>${C.reset}    Install a plugin from a git URL or local path`);
    log(`  ${C.cyan}theme${C.reset}            Set theme (omc theme <name>) or list themes`);
    log(`  ${C.cyan}list${C.reset}             List all available plugins`);
    log(`  ${C.cyan}create <name>${C.reset}    Create a new JS plugin`);
    log(`  ${C.cyan}create <name> --script${C.reset}`);
    log(`                     Create a script plugin (any language)`);
    log(`                     ${C.dim}--lang=python|bash (default: python)${C.reset}`);
    log(`  ${C.cyan}validate${C.reset}         Run the plugin contract validator`);
    log(`  ${C.cyan}uninstall${C.reset}        Remove oh-my-claude from Claude Code`);
    log(`  ${C.cyan}help${C.reset}             Show this help message\n`);
    break;
  default:
    warn(`Unknown command: ${command}`);
    log(`Run ${C.cyan}omc help${C.reset} for available commands.`);
    process.exit(1);
}
