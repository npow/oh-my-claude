# oh-my-claude

**Themes and plugins for [Claude Code's](https://docs.anthropic.com/en/docs/claude-code) status bar.**

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) has a [statusline](https://docs.anthropic.com/en/docs/claude-code/settings#statusline) -- a bar pinned to the bottom of your terminal. It's blank by default. oh-my-claude gives it something to say.

![oh-my-claude themes](screenshots/hero.gif)

[![npm version](https://img.shields.io/npm/v/@npow/oh-my-claude)](https://www.npmjs.com/package/@npow/oh-my-claude)
[![CI](https://img.shields.io/github/actions/workflow/status/npow/oh-my-claude/ci.yml?label=CI)](https://github.com/npow/oh-my-claude/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![node](https://img.shields.io/node/v/@npow/oh-my-claude)](package.json)

Claude Code streams your session data (model, context usage, cost, git info) into the statusline as JSON. oh-my-claude picks it up, runs it through a pipeline of **plugins** -- small functions that each render one piece of the bar -- and writes styled output back. A **theme** is just a layout: which plugins, in what order, left or right aligned.

Some plugins show data straight: `42%`, `$2.41`, `main`. Others get creative -- `battle-log` turns context usage into a dungeon crawl (`⚔️ Boss Battle (85%)`), `garden` grows an ASCII plant as you add lines of code, and `coffee-cup` drains over a 2-hour session. A few are just for fun (`fortune-cookie`, `cat`). Themes mix and match all of these.

| Your session | `default` | `boss-battle` | `tamagotchi` |
|---|---|---|---|
| 42% context | `██████░░░░ 42%` | `🗡️ Mid Dungeon (42%)` | `(^.^)` happy pet |
| 85% context | `████████████░░ 85%` | `⚔️ Boss Battle (85%)` | `(×_×)!!` panicking pet |
| 250 lines added | `+250` | `+250 gold` | `(🌿)` growing garden |
| 45min in | `45m 0s` | `45m 0s` | `[█░░░]` coffee half-empty |

## Install

```bash
npm install -g @npow/oh-my-claude
omc install
```

That's it -- takes effect immediately, no restart needed.

---

## Pick your vibe

```bash
omc theme tamagotchi
```

### `tamagotchi` -- virtual pet, growing garden, draining coffee

![tamagotchi theme](screenshots/tamagotchi.png)

```json
{ "theme": "tamagotchi" }
```

---

### `boss-battle` -- dungeon crawl with weather and battle music

![boss-battle theme](screenshots/boss-battle.png)

```json
{ "theme": "boss-battle" }
```

---

### `danger-zone` -- 3 hours in, $18 spent, everything on fire

![danger-zone theme](screenshots/danger-zone.png)

```json
{ "theme": "danger-zone" }
```

---

### `rpg` -- D&D character sheet, speedrun timer, cat companion

![rpg theme](screenshots/rpg-developer.png)

```json
{ "theme": "rpg" }
```

---

### `coworker` -- fake Slack messages and fortune cookie wisdom

![coworker theme](screenshots/coworker.png)

```json
{ "theme": "coworker" }
```

---

### `narrator` -- third-person text adventure with vibes

![narrator theme](screenshots/narrator.png)

```json
{ "theme": "narrator" }
```

---

### `default` -- clean and informative, no config needed

![default theme](screenshots/fresh-start.png)

---

Run `npm run showcase` to see all themes live in your terminal.

---

## 74 plugins, mix and match

### Stay productive

| Plugin | What it shows | Example |
|---------|---------------|---------|
| `context-bar` | Visual context progress bar | `██████░░░░░░░░░ 38%` |
| `context-percent` | Context usage as number | `38%` |
| `context-tokens` | Token count used/total | `84k/200k` |
| `context-remaining` | Tokens left in context | `115k left` |
| `context-eta` | Time until context is full | `ETA 22m` |
| `compact-hint` | Suggests /compact at threshold | `/compact` |
| `token-sparkline` | Context history sparkline | `▁▂▃▄▅▆▇█` |
| `trend-arrow` | Context usage trend | `↑↑` rising, `→` flat |
| `session-cost` | Session cost in USD | `$2.41` |
| `cost-budget` | Cost vs budget | `$3.50/$10.00` |
| `cost-rate` | Dollars per minute burn rate | `$0.36/m` |
| `cost-per-line` | Cost per line of code | `3¢/line` |
| `cost-sparkline` | Cost as sparkline bar | `$4.56 ▅` |
| `tokens-per-dollar` | Token efficiency | `18k tok/$` |
| `input-output-ratio` | Input vs output tokens | `6.5:1 i/o` |
| `token-rate` | Token consumption per minute | `7.2k tok/m` |
| `efficiency-score` | Lines per API minute | `14 L/m` |
| `model-name` | Current model | `Opus` |
| `session-timer` | Session duration | `25m 0s` |
| `api-timer` | API wait time | `api 3m 40s` |
| `idle-timer` | Time spent thinking | `idle 9m 30s` |
| `lines-changed` | Lines added/removed | `+250 -23` |
| `lines-sparkline` | Lines changed as sparkline | `▄ 104L` |
| `smart-nudge` | Contextual suggestions | `💡 /compact` at 75% |
| `directory` | Working directory | `myproject` |
| `package-version` | Version from package.json | `v0.3.1` |
| `vim-mode` | Vim mode indicator | `NORMAL` |
| `version` | Claude Code version | `v2.1.34` |
| `output-style` | Active output style | `streamlined` |

### Git

| Plugin | What it shows | Example |
|---------|---------------|---------|
| `git-branch` | Current branch | `main` |
| `git-status` | Staged, modified, untracked | `+2 ~1 ?3` |
| `git-stash` | Stash count | `stash:3` |
| `git-ahead-behind` | Commits ahead/behind remote | `↑2 ↓1` |
| `git-last-commit` | Time since last commit | `2h ago` |
| `git-tag` | Current/nearest tag | `v1.2.3` |

### Time

| Plugin | What it shows | Example |
|---------|---------------|---------|
| `clock` | Current time | `2:30pm` |
| `date-display` | Today's date | `Feb 20` |
| `day-progress` | Workday progress bar | `▓▓▓▓▓░░░░░` |
| `week-progress` | Workweek progress | `Wed ▓▓▓░░` |
| `year-progress` | Year percentage | `14% of 2026` |
| `countdown` | Days until target date | `launch in 12d` |
| `pomodoro` | Pomodoro timer | `🍅 13m` work, `☕ break 3m` |
| `break-reminder` | Break reminder | `take a break` after 60m |

### Have fun while you wait

| Plugin | What it does | Example |
|---------|--------------|---------|
| `tamagotchi` | Virtual pet reacts to your session | `(^.^)` happy, `(x_x) RIP` at 95% |
| `cat` | A cat doing cat things | `=^._.^= *sits on context window*` |
| `vibe-check` | One-word session mood | `vibing`, `cooking`, `burning cash` |
| `fortune-cookie` | Rotating developer wisdom | `"Weeks of coding can save hours of planning"` |
| `narrator` | Third-person text adventure | `The walls close in...` |
| `soundtrack` | Music genre for the moment | `lo-fi beats`, `boss battle music` |
| `garden` | ASCII plants grow as you code | `(.)` seed to `(🌳)` at 500 lines |
| `coffee-cup` | Drains over a 2-hour session | `[████]` full to `[    ] refill?` |
| `horoscope` | Daily coding horoscope | `Mercury is in retrograde. Avoid force-pushing.` |
| `coworker` | Fake Slack reactions | `@chad: 'ship it already'` |
| `commit-msg` | Suggested commit message | `git commit -m "feat: rewrite everything"` |
| `weather-report` | Session as weather forecast | `Clear Skies`, `Stormy` at 85% |
| `dad-joke` | Rotating developer dad jokes | `Why do programmers prefer dark mode?` |
| `magic-8ball` | Periodic predictions | `🎱 Outlook good` |
| `compliment` | Rotating encouragement | `Your git history is a work of art` |
| `mood-ring` | Color-coded session health | `💚` green, `💛` yellow, `❤️` red |
| `loading-spinner` | Animated spinner | `⠋` (dots, line, moon styles) |

### Gamify your session

| Plugin | What it does | Example |
|---------|--------------|---------|
| `achievement` | Unlockable badges | `Centurion` at 100 lines, `Whale` at $20 |
| `rpg-stats` | D&D character sheet | `Lv.9 STR:18 DEX:4 INT:11 WIS:18 CHA:0` |
| `xp-bar` | XP progress bar | `Lv3 █░░░░░░░ 58xp` |
| `level` | Title based on session progress | `Journeyman`, `Expert`, `Legend` |
| `combo-meter` | Activity intensity | `x3 SUPER`, `x5 GODLIKE` |
| `boss-health` | Context as boss HP | `CONTEXT [████████░░░░] 58%` |
| `quest-log` | Current quest objective | `⚔️ Quest: Survive the context limit` |
| `loot-drop` | Random drops at milestones | `🟢 Rubber Duck+1`, `🟡 Golden Commit` |
| `speedrun` | Timer + efficiency rating | `47:00 [C]` |
| `streak` | Consecutive-day streak | `🔥 7d streak` |
| `battle-log` | Session as dungeon crawl | `Boss Battle (85%) +892 gold` |
| `stock-ticker` | Cost as stock price | `$OMC ▲▲ $4.56` |
| `emoji-story` | Growing emoji narrative | `📝✏️🏗️💰⏳` |

### Layout building blocks

| Plugin | Purpose |
|---------|---------|
| `separator-pipe` | Pipe `│` between plugins |
| `separator-arrow` | Powerline arrow separator |
| `separator-space` | Whitespace |
| `flex-space` | Right-alignment marker |
| `custom-text` | Static text string |

---

## Context bar changes color as it fills

```diff
  ██████░░░░░░░░░ 30%     ← green, you're fine
! █████████░░░░░░ 60%     ← yellow, heads up
- ████████████░░░ 80%     ← red, time to /compact
```

Cost tracking auto-detects your plan (Pro/Max) and warns at the right thresholds.

---

## 9 themes

### Built-in layouts

**default** -- two lines, works everywhere:
```
 Opus myproject main +2 ~1                                    +83 -21 15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                         $1.23
```

**minimal** -- single line, text only:
```
 myproject · main +2 ~1                                       35% · $1.23
```

**powerline** -- Nerd Font icons and arrows:
```
 󰧩 Opus  ~/c/myproject  main +2 ~1                    +83 -21  15m 0s
 ███████░░░░░░░░ 35% 84k/200k                           $1.23 NORMAL
```

### Personality themes

| Theme | Vibe |
|-------|------|
| **tamagotchi** | Pet, garden, coffee, vibes |
| **boss-battle** | Dungeon crawl, weather, soundtrack |
| **rpg** | D&D stats, speedrun, cat, horoscope |
| **coworker** | Fake Slack messages, fortune cookies |
| **danger-zone** | Everything on fire |
| **narrator** | Third-person text adventure |

See [screenshots above](#pick-your-vibe) for each theme in action.

---

## Add a plugin

Three ways to get a plugin:

**1. Install from git** -- grab a community or first-party plugin:

```bash
omc install https://github.com/npow/omc-plugin-weather
omc add weather
```

Also works with local paths: `omc install /path/to/my-plugin`

**2. Create with the CLI** -- scaffold a new plugin from scratch:

```bash
omc create my-plugin             # JS plugin
omc create my-plugin --script    # Script plugin (Python, Bash, etc.)
```

**3. Ask Claude** -- if you have the [skill](#claude-code-skill) installed:

> "Create an oh-my-claude plugin that shows my current CPU temperature"

Claude scaffolds, implements, tests, and wires it up.

There's also a starter template at `templates/plugin/` you can copy manually.

---

## Write your own plugin

### JS plugins

A JS plugin is a single file at `~/.claude/oh-my-claude/plugins/<name>/plugin.js`. It exports two things:

```js
export const meta = {
  name: 'my-plugin',
  description: 'Shows something useful',
  requires: [],
  defaultConfig: {
    style: 'cyan',
    threshold: 50,       // users override this with: omc config my-plugin threshold=75
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  if (pct == null) return null;   // hide when data is missing

  const style = pct >= cfg.threshold ? 'bold red' : cfg.style;
  return { text: `${Math.round(pct)}%`, style };
}
```

Three rules: export `meta`, export `render`, return `{ text, style }` or `null`.

### Available data fields

`render(data, config)` receives JSON from Claude Code. Use optional chaining for all access.

```js
data?.model?.display_name          // "Opus", "Sonnet"
data?.model?.id                    // "claude-opus-4-6"
data?.context_window?.used_percentage   // 0-100
data?.context_window?.context_window_size  // 200000
data?.cost?.total_cost_usd         // 4.56
data?.cost?.total_duration_ms      // session wall-clock time
data?.cost?.total_lines_added      // 83
data?.cost?.total_lines_removed    // 21
data?.workspace?.current_dir       // "/Users/dev/myproject"
data?.session_id                   // unique session id
data?.version                      // Claude Code version
data?.vim?.mode                    // "NORMAL" if vim active
```

Full reference: [docs/plugin-contract.md](docs/plugin-contract.md)

### Shell commands

Plugins that run shell commands must use the cache layer -- raw `execSync` blocks the entire statusline:

```js
import { cachedExec } from '../../src/cache.js';

export function render(data, config) {
  // cachedExec(key, command, ttlMs) — runs at most once per TTL
  const count = cachedExec('stash-count', 'git stash list | wc -l', 5000);
  if (!count || count.trim() === '0') return null;
  return { text: `stash:${count.trim()}`, style: 'yellow' };
}
```

### Script plugins (Python, Bash, etc.)

For non-JS plugins, create an executable `plugin` file instead of `plugin.js`:

```bash
omc create my-plugin --script --lang=python
```

This creates `~/.claude/oh-my-claude/plugins/my-plugin/plugin` (executable) and `plugin.json` (metadata). The script reads JSON on stdin and writes `{ "text": "...", "style": "..." }` to stdout:

```python
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
cost = data.get("cost", {}).get("total_cost_usd")
if cost is None:
    sys.exit(1)  # exit non-zero = hide plugin

config = data.get("_config", {})  # per-plugin config merged here
json.dump({"text": f"${cost:.2f}", "style": "green"}, sys.stdout)
```

### Dependencies

oh-my-claude itself has zero npm dependencies by design. Plugins follow the same principle:

- **JS plugins** can only use Node 18+ built-ins (`node:fs`, `node:child_process`, etc.) and oh-my-claude's own `cachedExec`. No `node_modules`, no `import` from npm packages.
- **Script plugins** can use whatever their language provides -- a Python plugin can `import requests`, a Bash plugin can shell out to `jq`, etc. The host machine just needs those tools installed.

The `meta.requires` field (e.g. `requires: ['git']`) is declarative metadata today -- shown in `omc info` and `omc list` so users know what a plugin needs. Automatic dependency checking is on the roadmap.

If your plugin needs something that isn't a Node built-in, make it a script plugin.

### Plugin config

Users configure plugins without editing code:

```bash
omc config my-plugin                    # show current values
omc config my-plugin threshold=75       # set a value
omc config my-plugin style="bold red"   # set a string
```

Values are stored in `~/.claude/oh-my-claude/config.json` under `plugins.<name>` and merged on top of `defaultConfig` at runtime.

### Test and add to statusline

```bash
omc test my-plugin           # run with mock data, verify output
omc add my-plugin            # add to line 1, right side (default)
omc add my-plugin --line 2 --left  # or pick a specific spot
omc show                     # see the full layout with preview
omc doctor                   # verify everything is healthy
```

### Share your plugin

A shareable plugin is a git repo with this structure:

```
omc-plugin-<name>/
  plugin.js          # or executable `plugin` for script plugins
  plugin.json        # optional: name, description, defaultConfig
  README.md          # optional: usage instructions
```

Others install it with:

```bash
omc install https://github.com/<user>/omc-plugin-<name>
omc add <name>
```

Or PR it into `src/plugins/` to make it a built-in.

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
omc add <name>            Add a plugin to the statusline
                            --line N (default: 1)  --left (default: right)
omc remove <name>         Remove a plugin from the statusline
omc set <line>            Set an entire line's plugins
                            --left p1 p2 ... --right p3 p4 ...
```

### Themes

```
omc theme <name>          Switch theme (e.g. omc theme tamagotchi)
omc themes                List available themes
omc theme save <name>     Save your current setup as a reusable theme
```

### Plugins

```
omc list                  List all built-in + installed plugins
omc info <name>           Show plugin details, config, statusline location
omc config <name>         Show/set plugin config values
                            omc config weather units=f refresh=30
omc test <name>           Run a plugin with mock data and show output
omc create <name>         Scaffold a new plugin
```

### Diagnostics

```
omc doctor                Check config, theme, and every plugin for issues
omc validate              Run the plugin contract validator
```

### Common workflows

**Tweak a plugin's config:**
```bash
omc info context-bar      # see what options exist
omc config context-bar    # see current values
omc config context-bar width=15 warnAt=75
omc test context-bar      # preview the change
```

**Redesign your layout:**
```bash
omc show                  # see what you have now
omc set 1 --left model-name git-branch --right session-cost
omc show                  # verify
omc theme save my-layout  # save for later
```

**Debug a broken statusline:**
```bash
omc doctor                # checks everything, suggests fixes
omc test <plugin>         # test one plugin in isolation
```

---

## Claude Code skill

If you use Claude Code to develop, there's a `/create-plugin` skill that builds plugins for you interactively. It knows the plugin contract, data fields, and CLI commands.

To install it, copy the skill into your project:

```bash
# Already included if you cloned this repo — it's at .claude/skills/create-plugin/
```

Then just ask Claude:

> "Create an oh-my-claude plugin that shows my current git stash count"

Claude will scaffold the plugin, implement the render logic, test it with `omc test`, and wire it into your statusline.

---

## Requirements

- Node 18+ (ships with Claude Code)
- Zero npm dependencies

## Contributing

PRs welcome. One file per plugin, export `meta` + `render`, handle nulls, run `npm run validate`.

## License

MIT
