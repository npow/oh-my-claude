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

## 41 plugins, mix and match

### Have fun while you wait

| Plugin | What it does | Example |
|---------|--------------|---------|
| `tamagotchi` | Virtual pet reacts to your session | `(^.^)` happy, `(x_x) RIP` at 95% context |
| `cat` | A cat doing cat things | `=^._.^= *sits on context window*` |
| `vibe-check` | One-word session mood | `vibing`, `cooking`, `burning cash` |
| `fortune-cookie` | Rotating developer wisdom | `"Weeks of coding can save hours of planning"` |
| `narrator` | Third-person text adventure | `The walls close in...` |
| `soundtrack` | Music genre for the moment | `lo-fi beats`, `boss battle music` |
| `garden` | ASCII plants grow as you code | `(.)` seed to `(🌳)` at 500 lines |
| `coffee-cup` | Drains over a 2-hour session | `[████]` full to `[    ] refill?` |
| `horoscope` | Daily coding horoscope | `Mercury is in retrograde. Avoid force-pushing.` |
| `coworker` | Fake Slack reactions | `@chad: 'ship it already'` |
| `commit-msg` | Suggested commit message | `git commit -m "feat: rewrite the entire codebase"` |
| `weather-report` | Session as weather forecast | `Clear Skies`, `Stormy` at 85% context |

### Gamify your session

| Plugin | What it does | Example |
|---------|--------------|---------|
| `achievement` | Unlockable badges | `Centurion` at 100 lines, `Whale` at $20 |
| `rpg-stats` | D&D character sheet | `Lv.9 STR:18 DEX:4 INT:11 WIS:18 CHA:0` |
| `speedrun` | Timer + efficiency rating | `47:00 [C]` |
| `streak` | Consecutive-day streak | `🔥 7d streak` |
| `battle-log` | Session as dungeon crawl | `Boss Battle (85%) +892 gold` |
| `stock-ticker` | Cost as stock price | `$OMC ▲▲ $4.56` |
| `emoji-story` | Growing emoji narrative | `📝✏️🏗️💰⏳` |

### Stay productive

| Plugin | What it shows | Example |
|---------|---------------|---------|
| `context-bar` | Visual context progress bar | `██████░░░░░░░░░ 38%` |
| `context-percent` | Context usage as number | `38%` |
| `context-tokens` | Token count used/total | `84k/200k` |
| `session-cost` | Session cost in USD | `$2.41` |
| `cost-budget` | Cost vs budget | `$3.50/$10.00` |
| `git-branch` | Current branch | `main` |
| `git-status` | Staged, modified, untracked | `+2 ~1 ?3` |
| `lines-changed` | Lines added/removed | `+250 -23` |
| `smart-nudge` | Contextual suggestions | `💡 /compact` at 75%, `💡 commit?` at 100 lines |
| `token-sparkline` | Context history sparkline | `▁▂▃▄▅▆▇█` |
| `model-name` | Current model | `Opus` |
| `directory` | Working directory | `myproject` |
| `session-timer` | Session duration | `25m 0s` |
| `api-timer` | API wait time | `api 3m 40s` |
| `vim-mode` | Vim mode indicator | `NORMAL` |
| `version` | Claude Code version | `v2.1.34` |

### Layout building blocks

| Plugin | Purpose |
|---------|---------|
| `separator-pipe` | Pipe `│` between plugins |
| `separator-arrow` | Powerline arrow separator |
| `separator-space` | Whitespace |
| `flex-space` | Right-alignment marker |
| `custom-text` | Static text string |
| `output-style` | Active output style |

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

## Write your own

No fork needed:

```bash
omc create my-plugin
```

Creates `~/.claude/oh-my-claude/plugins/my-plugin/plugin.js`:

```js
export const meta = {
  name: 'my-plugin',
  description: 'My custom plugin',
  requires: [],
  defaultConfig: {},
};

export function render(data, config) {
  return { text: 'Hello!', style: 'cyan' };
}
```

Add it to your theme and it takes effect immediately. Three rules: export `meta`, export `render`, return `{ text, style }` or `null`.

Full data field reference: [docs/plugin-contract.md](docs/plugin-contract.md)

**Share it:** PR it into `src/plugins/` or post your `plugin.js` anywhere -- others drop it in their plugins directory and go.

---

## CLI

```
omc install               Interactive setup wizard
omc theme <name>          Switch theme (e.g. omc theme tamagotchi)
omc themes                List available themes
omc create <name>         Scaffold a new plugin
omc list                  List all 41 built-in plugins
omc validate              Check plugin contract compliance
omc uninstall             Remove from Claude Code
```

---

## Requirements

- Node 18+ (ships with Claude Code)
- Zero npm dependencies

## Contributing

PRs welcome. One file per plugin, export `meta` + `render`, handle nulls, run `npm run validate`.

## License

MIT
