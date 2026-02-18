#!/usr/bin/env node

// bin/omc.js — oh-my-claude CLI
// Usage: npx oh-my-claude [command]
// Commands: install, themes, uninstall, list, validate, create

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';

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
    segments: {
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
      log(`     ${C.dim}Lines: ${theme.lines?.length || 0} | Segments: ${[...(theme.lines || [])].flatMap(l => [...(l.left || []), ...(l.right || [])]).length}${C.reset}`);
    } catch {}
  }
  log('');
}

// ─── List Segments ───────────────────────────────

async function listSegments() {
  log(`\n${C.bold}Built-in segments:${C.reset}\n`);
  const segDir = existsSync(join(OMC_DIR, 'src', 'segments'))
    ? join(OMC_DIR, 'src', 'segments')
    : join(PACKAGE_ROOT, 'src', 'segments');

  const MOCK_DATA = {
    model: { id: 'claude-opus-4-6', display_name: 'Opus' },
    context_window: { used_percentage: 42, context_window_size: 200000, total_input_tokens: 84000, total_output_tokens: 12000 },
    cost: { total_cost_usd: 4.56, total_duration_ms: 750000, total_api_duration_ms: 180000, total_lines_added: 83, total_lines_removed: 21 },
    workspace: { current_dir: '/Users/dev/myproject', project_dir: '/Users/dev/myproject' },
    session_id: 'demo', version: '2.1.34',
  };

  const files = readdirSync(segDir).filter(f => f.endsWith('.js') && f !== 'index.js').sort();

  for (const file of files) {
    try {
      const mod = await import(join(segDir, file));
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
  log(`\n${C.dim}${files.length} segments available${C.reset}`);

  // List plugins
  let pluginCount = 0;
  if (existsSync(PLUGINS_DIR)) {
    try {
      const pluginEntries = readdirSync(PLUGINS_DIR).sort();
      const validPlugins = [];

      for (const entry of pluginEntries) {
        const entryPath = join(PLUGINS_DIR, entry);
        const segmentPath = join(entryPath, 'segment.js');
        try {
          const { statSync: statSyncFs } = await import('node:fs');
          const stat = statSyncFs(entryPath);
          if (!stat.isDirectory()) continue;
          if (!existsSync(segmentPath)) continue;

          const { pathToFileURL } = await import('node:url');
          const mod = await import(pathToFileURL(segmentPath).href);
          if (!mod.meta || typeof mod.meta.name !== 'string' || typeof mod.render !== 'function') {
            validPlugins.push({
              name: entry,
              desc: `${C.red}(invalid: missing meta.name or render)${C.reset}`,
              path: segmentPath,
            });
          } else {
            validPlugins.push({
              name: mod.meta.name,
              desc: mod.meta.description || '',
              path: segmentPath,
            });
          }
        } catch (err) {
          validPlugins.push({
            name: entry,
            desc: `${C.red}(error: ${err.message})${C.reset}`,
            path: segmentPath,
          });
        }
      }

      if (validPlugins.length > 0) {
        log(`\n${C.bold}Plugins:${C.reset}\n`);
        for (const p of validPlugins) {
          log(`  ${C.magenta}${p.name}${C.reset} — ${p.desc}`);
          log(`    ${C.dim}${p.path}${C.reset}`);
        }
        pluginCount = validPlugins.length;
        log(`\n${C.dim}${pluginCount} plugin(s) found${C.reset}`);
      }
    } catch {}
  }

  if (pluginCount === 0) {
    log(`\n${C.dim}No plugins installed. Run ${C.reset}${C.cyan}omc create <name>${C.reset}${C.dim} to create one.${C.reset}`);
  }

  log('');
}

// ─── Create Plugin ───────────────────────────────

function createPlugin(name) {
  if (!name || typeof name !== 'string') {
    warn('Usage: omc create <segment-name>');
    log(`\n${C.dim}Example: omc create my-segment${C.reset}\n`);
    process.exit(1);
  }

  // Validate segment name: lowercase letters, numbers, hyphens only
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    warn(`Invalid segment name: "${name}"`);
    log(`\n${C.dim}Names must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.${C.reset}`);
    log(`${C.dim}Example: my-segment, cpu-usage, weather-v2${C.reset}\n`);
    process.exit(1);
  }

  const pluginDir = join(PLUGINS_DIR, name);
  const segmentPath = join(pluginDir, 'segment.js');

  // Check if plugin already exists
  if (existsSync(segmentPath)) {
    warn(`Plugin "${name}" already exists at:`);
    log(`  ${C.dim}${segmentPath}${C.reset}\n`);
    process.exit(1);
  }

  // Create plugin directory and segment file
  mkdirSync(pluginDir, { recursive: true });

  const template = `// ${segmentPath}
// Custom segment for oh-my-claude.
// Add "${name}" to your theme's lines array to use it.

export const meta = {
  name: '${name}',
  description: 'My custom segment',
  requires: [],
  defaultConfig: {},
};

/**
 * Render this segment.
 *
 * @param {object} data - JSON from Claude Code (use optional chaining: data?.model?.display_name)
 * @param {object} config - Per-segment config from your theme/config.json
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
  // Return null to hide the segment when data is unavailable.
  // Never throw — return null instead.

  return { text: 'Hello from ${name}!', style: 'cyan' };
}
`;

  writeFileSync(segmentPath, template);

  log(`\n${C.green}${C.bold}Plugin created!${C.reset}\n`);
  success(`File: ${segmentPath}`);
  log(`\n${C.bold}To use it:${C.reset}\n`);
  log(`  1. Edit the segment file to customize it:`);
  log(`     ${C.dim}${segmentPath}${C.reset}\n`);
  log(`  2. Add ${C.cyan}"${name}"${C.reset} to a theme's lines array in your config:`);
  log(`     ${C.dim}${CONFIG_PATH}${C.reset}\n`);
  log(`     Example config.json snippet:`);
  log(`     ${C.dim}{`);
  log(`       "lines": [`);
  log(`         { "left": ["model-name", "${name}"], "right": ["session-cost"] }`);
  log(`       ]`);
  log(`     }${C.reset}\n`);
  log(`  3. Restart Claude Code to see your segment.\n`);
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
  case 'install':
    install().catch(err => { console.error(err); process.exit(1); });
    break;
  case 'themes':
  case 'theme':
    listThemes();
    break;
  case 'list':
  case 'segments':
    listSegments().catch(err => { console.error(err); process.exit(1); });
    break;
  case 'create':
    createPlugin(process.argv[3]);
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
    log(`  ${C.cyan}install${C.reset}     Install oh-my-claude (interactive wizard)`);
    log(`  ${C.cyan}themes${C.reset}      List available themes`);
    log(`  ${C.cyan}list${C.reset}        List all available segments`);
    log(`  ${C.cyan}create${C.reset}      Create a new plugin segment (omc create <name>)`);
    log(`  ${C.cyan}validate${C.reset}    Run the segment contract validator`);
    log(`  ${C.cyan}uninstall${C.reset}   Remove oh-my-claude from Claude Code`);
    log(`  ${C.cyan}help${C.reset}        Show this help message\n`);
    break;
  default:
    warn(`Unknown command: ${command}`);
    log(`Run ${C.cyan}omc help${C.reset} for available commands.`);
    process.exit(1);
}
