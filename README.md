# oh-my-claude

**A statusline framework for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Track context, cost, git, and time -- or add a virtual pet.**

[![npm version](https://img.shields.io/npm/v/@npow/oh-my-claude)](https://www.npmjs.com/package/@npow/oh-my-claude)
[![CI](https://img.shields.io/github/actions/workflow/status/npow/oh-my-claude/ci.yml?label=CI)](https://github.com/npow/oh-my-claude/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![node](https://img.shields.io/node/v/@npow/oh-my-claude)](package.json)

![oh-my-claude themes](screenshots/hero.gif)

Claude Code has a [statusline](https://docs.anthropic.com/en/docs/claude-code/settings#statusline) pinned to the bottom of your terminal. It's blank by default. oh-my-claude fills it with context usage, cost tracking, git status, session metrics, and whatever else you want.

```bash
npm install -g @npow/oh-my-claude
omc install
```

---

## What you get

Out of the box, the default theme shows:

```
 Opus myproject main ~2 ?1                               2h ago +83 -21 15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                             $1.23
```

Context bar changes color as it fills -- green under 60%, yellow to 80%, red above. Cost tracking warns at plan-appropriate thresholds. Git branch, status, and time since last commit update in real time.

Switch to a different layout:

```bash
omc theme analytics     # cost-rate, token-rate, efficiency, context ETA
omc theme productivity  # clock, work/break cycle, day progress
omc theme powerline     # Nerd Font icons and arrow separators
omc theme minimal       # single line, text only
```

Or go full personality:

```bash
omc theme tamagotchi    # virtual pet, growing garden, draining coffee
omc theme rpg           # D&D stats, speedrun timer, cat companion
omc theme coworker      # fake Slack messages, fortune cookie wisdom
```

---

## 11 themes

### For working

| Theme | Lines | What it shows |
|-------|-------|---------------|
| **default** | 2 | Branch, status, last commit, context bar, cost |
| **minimal** | 1 | Directory, branch, context %, cost. Text only. |
| **powerline** | 2 | Nerd Font icons, arrows, tokens remaining, vim mode |
| **analytics** | 2 | Cost rate, token rate, efficiency, context ETA |
| **productivity** | 2 | Clock, work/break cycle, day progress, package version |

### For fun

| Theme | Lines | Vibe |
|-------|-------|------|
| **tamagotchi** | 3 | Pet, garden, coffee, vibes |
| **boss-battle** | 3 | Dungeon crawl, battle music, weather |
| **rpg** | 3 | D&D stats, speedrun, cat, horoscope |
| **coworker** | 3 | Fake Slack messages, fortune cookies |
| **narrator** | 3 | Third-person text adventure, garden, streak |
| **danger-zone** | 3 | Everything on fire |

See [screenshots](#screenshots) for each theme in action.

---

## 74 built-in plugins

### Context & cost tracking

| Plugin | Example |
|--------|---------|
| `context-bar` | `██████░░░░░░░░░ 38%` |
| `context-percent` | `38%` |
| `context-tokens` | `84k/200k` |
| `context-remaining` | `115k left` |
| `context-eta` | `ETA 22m` |
| `context-level` | `↑↑` high, `→` low |
| `compact-hint` | `/compact` at 70% |
| `token-sparkline` | `▁▂▃▄▅▆▇█` |
| `session-cost` | `$2.41` |
| `cost-budget` | `$3.50/$10.00` |
| `cost-rate` | `$0.36/m` |
| `cost-per-line` | `3¢/line` |
| `cost-gauge` | `$4.56 ▅` |
| `tokens-per-dollar` | `18k tok/$` |
| `input-output-ratio` | `6.5:1 i/o` |
| `token-rate` | `7.2k tok/m` |
| `efficiency-score` | `14 L/m` |
| `smart-nudge` | `💡 /compact` at 75% |

### Git

| Plugin | Example |
|--------|---------|
| `git-branch` | `main` |
| `git-status` | `+2 ~1 ?3` |
| `git-stash` | `stash:3` |
| `git-ahead-behind` | `↑2 ↓1` |
| `git-last-commit` | `2h ago` |
| `git-tag` | `v1.2.3` |

### Session info

| Plugin | Example |
|--------|---------|
| `model-name` | `Opus` |
| `directory` | `myproject` |
| `package-version` | `v0.3.1` |
| `session-timer` | `25m 0s` |
| `api-timer` | `api 3m 40s` |
| `think-timer` | `you 9m 30s` |
| `lines-changed` | `+250 -23` |
| `lines-gauge` | `▄ 104L` |
| `vim-mode` | `NORMAL` |
| `version` | `v2.1.34` |

### Time

| Plugin | Example |
|--------|---------|
| `clock` | `2:30pm` |
| `date-display` | `Feb 20` |
| `day-progress` | `▓▓▓▓▓░░░░░` |
| `week-progress` | `Wed ▓▓▓░░` |
| `year-progress` | `14% of 2026` |
| `countdown` | `launch in 12d` |
| `work-cycle` | `🍅 13m` / `☕ break 3m` |
| `break-reminder` | `take a break` |

### Fun & personality

| Plugin | Example |
|--------|---------|
| `tamagotchi` | `(^.^)` happy, `(x_x) RIP` |
| `cat` | `=^._.^= *sits on context window*` |
| `vibe-check` | `vibing`, `burning cash` |
| `fortune-cookie` | `"Weeks of coding can save hours of planning"` |
| `narrator` | `The walls close in...` |
| `soundtrack` | `lo-fi beats`, `boss battle music` |
| `garden` | `(.)` seed → `(🌳)` tree |
| `coffee-cup` | `[████]` → `[    ] refill?` |
| `horoscope` | `Mercury is in retrograde.` |
| `coworker` | `@chad: 'ship it already'` |
| `commit-msg` | `git commit -m "feat: rewrite everything"` |
| `weather-report` | `Clear Skies`, `Stormy` |
| `dad-joke` | `Why do programmers prefer dark mode?` |
| `magic-8ball` | `🎱 Outlook good` |
| `compliment` | `Your git history is a work of art` |
| `mood-ring` | `💚` / `💛` / `❤️` |
| `loading-spinner` | `⠋` (dots, line, moon) |

### Gamification

| Plugin | Example |
|--------|---------|
| `achievement` | `Centurion` at 100 lines |
| `rpg-stats` | `Lv.9 STR:18 DEX:4 INT:11` |
| `xp-bar` | `Lv3 █░░░░░░░ 58xp` |
| `level` | `Journeyman` → `Legend` |
| `combo-meter` | `x3 SUPER`, `x5 GODLIKE` |
| `boss-health` | `CONTEXT [████░░░░] 58%` |
| `quest-log` | `⚔️ Survive the context limit` |
| `loot-drop` | `🟢 Rubber Duck+1` |
| `speedrun` | `47:00 [C]` |
| `streak` | `🔥 7d streak` |
| `battle-log` | `Boss Battle (85%) +892 gold` |
| `stock-ticker` | `$OMC ▲▲ $4.56` |
| `emoji-story` | `📝✏️🏗️💰⏳` |

### Layout building blocks

`separator-pipe` `separator-arrow` `separator-space` `flex-space` `custom-text` `output-style`

---

## External plugins

Plugins that need APIs, platform-specific tools, or non-Node dependencies live in separate repos:

| Plugin | What it does | Install |
|--------|-------------|---------|
| [weather](https://github.com/npow/omc-plugin-weather) | Current weather via wttr.in | `omc install https://github.com/npow/omc-plugin-weather` |

After installing, add it to your statusline:

```bash
omc add weather
omc config weather location="San Francisco" units=c
```

---

## Add a plugin

Three ways:

**1. Install from git:**

```bash
omc install https://github.com/npow/omc-plugin-weather
omc add weather
```

**2. Create with the CLI:**

```bash
omc create my-plugin             # JS plugin
omc create my-plugin --script    # Script plugin (Python, Bash, etc.)
```

**3. Ask Claude** (if you have the [skill](#claude-code-skill) installed):

> "Create an oh-my-claude plugin that shows my current CPU temperature"

---

## Write your own plugin

### JS plugins

A plugin is a single file at `~/.claude/oh-my-claude/plugins/<name>/plugin.js`:

```js
export const meta = {
  name: 'my-plugin',
  description: 'Shows something useful',
  requires: [],
  defaultConfig: {
    style: 'cyan',
    threshold: 50,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  const pct = data?.context_window?.used_percentage;
  if (pct == null) return null;
  return { text: `${Math.round(pct)}%`, style: pct >= cfg.threshold ? 'bold red' : cfg.style };
}
```

Three rules: export `meta`, export `render`, return `{ text, style }` or `null`.

### Available data fields

```js
data?.model?.display_name          // "Opus", "Sonnet"
data?.context_window?.used_percentage   // 0-100
data?.cost?.total_cost_usd         // 4.56
data?.cost?.total_duration_ms      // session wall-clock time
data?.cost?.total_lines_added      // 83
data?.workspace?.current_dir       // "/Users/dev/myproject"
data?.session_id                   // unique session id
data?.vim?.mode                    // "NORMAL" if vim active
```

Full reference: [docs/plugin-contract.md](docs/plugin-contract.md)

### Shell commands

Use the cache layer -- raw `execSync` blocks the entire statusline:

```js
import { cachedExec } from '../../src/cache.js';

export function render(data, config) {
  const count = cachedExec('stash-count', 'git stash list | wc -l', 5000);
  if (!count || count.trim() === '0') return null;
  return { text: `stash:${count.trim()}`, style: 'yellow' };
}
```

### Script plugins (Python, Bash, etc.)

```bash
omc create my-plugin --script --lang=python
```

The script reads JSON on stdin and writes `{ "text": "...", "style": "..." }` to stdout:

```python
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
cost = data.get("cost", {}).get("total_cost_usd")
if cost is None:
    sys.exit(1)  # exit non-zero = hide plugin

json.dump({"text": f"${cost:.2f}", "style": "green"}, sys.stdout)
```

### Dependencies

oh-my-claude has zero npm dependencies. Plugins follow the same principle:

- **JS plugins**: Node 18+ built-ins only. No npm packages.
- **Script plugins**: can use whatever the host has (Python libs, system tools, etc.)

The `meta.requires` field (e.g. `requires: ['git']`) is declarative metadata today. Automatic dependency checking is on the roadmap.

### Test and add

```bash
omc test my-plugin           # run with mock data
omc add my-plugin            # add to statusline
omc show                     # verify layout
```

### Share it

```
omc-plugin-<name>/
  plugin.js          # or executable `plugin` for script plugins
  plugin.json        # optional: name, description, defaultConfig
  README.md
```

```bash
omc install https://github.com/<user>/omc-plugin-<name>
```

---

## CLI

### Setup
```
omc install               Interactive setup wizard
omc uninstall             Remove from Claude Code
```

### Layout
```
omc show                  Show current layout with live preview
omc add <name>            Add a plugin (--line N, --left)
omc remove <name>         Remove a plugin
omc set <line>            Set a line (--left p1 p2 --right p3 p4)
```

### Themes
```
omc theme <name>          Switch theme
omc themes                List available themes
omc theme save <name>     Save current setup as theme
```

### Plugins
```
omc list                  List all plugins
omc info <name>           Plugin details and config
omc config <name>         Show/set config (omc config weather units=f)
omc test <name>           Test with mock data
omc create <name>         Scaffold a new plugin
```

### Diagnostics
```
omc doctor                Check everything for issues
omc validate              Plugin contract validator
```

---

## Claude Code skill

There's a `/create-plugin` skill that builds plugins interactively. Already included at `.claude/skills/create-plugin/`.

> "Create an oh-my-claude plugin that shows my current git stash count"

---

## Screenshots

### `default`
![default theme](screenshots/fresh-start.png)

### `tamagotchi`
![tamagotchi theme](screenshots/tamagotchi.png)

### `boss-battle`
![boss-battle theme](screenshots/boss-battle.png)

### `rpg`
![rpg theme](screenshots/rpg-developer.png)

### `coworker`
![coworker theme](screenshots/coworker.png)

### `narrator`
![narrator theme](screenshots/narrator.png)

### `danger-zone`
![danger-zone theme](screenshots/danger-zone.png)

---

## Requirements

- Node 18+ (ships with Claude Code)
- Zero npm dependencies

## Contributing

PRs welcome. One file per plugin, export `meta` + `render`, handle nulls, run `npm run validate`.

## License

MIT
