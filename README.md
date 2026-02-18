# oh-my-claude

**Like oh-my-zsh, but for Claude Code.** An extensible statusline framework with themes and plugins.

[![npm version](https://img.shields.io/npm/v/@npow/oh-my-claude)](https://www.npmjs.com/package/@npow/oh-my-claude)
[![CI](https://img.shields.io/github/actions/workflow/status/npow/oh-my-claude/ci.yml?label=CI)](https://github.com/npow/oh-my-claude/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![node](https://img.shields.io/node/v/@npow/oh-my-claude)](package.json)

## Install

```bash
npx @npow/oh-my-claude
```

Picks a theme, writes the config, wires up Claude Code. Restart Claude Code and you're done.

Config lives at `~/.claude/oh-my-claude/config.json` -- pick a theme, toggle segments, set budgets:

```json
{
  "theme": "default",
  "segments": {
    "session-cost": { "plan": "pro" },
    "context-bar": { "warnAt": 60, "criticalAt": 80 }
  }
}
```

---

## Pick your vibe

```
 (^.^)  ✨ vibing  🥠 "Weeks of coding can save hours of planning"
 🏕️ Base Camp (12%) +47 gold          =^._.^= *perks up*  [████]
```
Tamagotchi pet, vibe check, fortune cookies, dungeon crawl, cat companion, draining coffee cup.

```
 Lv.3 STR:10 DEX:5 INT:12 WIS:8 CHA:0               ⏱️ 12:30 [A]
 ▁▂▃▄▅▆  🎵 lo-fi beats  $OMC ▲ $4.56          🏆 First Blood
```
RPG stats, speedrun rating, token sparkline, soundtrack, stock ticker, achievements.

```
 Opus  myproject  main +2 ~1                          +83 -21  15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                      $4.56
```
Model, git branch, context bar, cost, lines changed, session timer. The essentials.

```
 myproject · main · 35% · $4.56
```
Or just one line. Your call.

> All examples are color-coded in your actual terminal -- green/yellow/red context bars, cyan model names, dim secondary info. Plain text here doesn't do it justice.

---

## 41 segments, mix and match

### Have fun while you wait

| Segment | What it does | Example |
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
| `coworker` | Fake Slack reactions | `@bot: 'ship it already'` |
| `commit-msg` | Suggested commit message | `git commit -m "feat: rewrite the entire codebase"` |
| `weather-report` | Session as weather forecast | `Clear Skies`, `Stormy` at 85% context |

### Gamify your session

| Segment | What it does | Example |
|---------|--------------|---------|
| `achievement` | Unlockable badges | `Centurion` at 100 lines, `Whale` at $20 |
| `rpg-stats` | D&D character sheet | `Lv.3 STR:10 DEX:5 INT:12 WIS:8 CHA:0` |
| `speedrun` | Timer + efficiency rating | `12:30 [A]` |
| `streak` | Consecutive-day streak | `🔥 5d streak` |
| `battle-log` | Session as dungeon crawl | `Deep Dungeon (65%) +47 gold` |
| `stock-ticker` | Cost as stock price | `$OMC ▲▲ $4.56` |
| `emoji-story` | Growing emoji narrative | `📝✏️🏗️💰⏳` |

### Stay productive

| Segment | What it shows | Example |
|---------|---------------|---------|
| `context-bar` | Visual context progress bar | `▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%` |
| `context-percent` | Context usage as number | `35%` |
| `context-tokens` | Token count used/total | `84k/200k` |
| `session-cost` | Session cost in USD | `$4.56` |
| `cost-budget` | Cost vs budget | `$3.50/$10.00` |
| `git-branch` | Current branch | `main` |
| `git-status` | Staged, modified, untracked | `+2 ~1 ?3` |
| `lines-changed` | Lines added/removed | `+83 -21` |
| `smart-nudge` | Contextual suggestions | `💡 /compact` at 75%, `💡 commit?` at 100 lines |
| `token-sparkline` | Context history sparkline | `▁▂▃▄▅▆▇█` |
| `model-name` | Current model | `Opus` |
| `directory` | Working directory | `myproject` |
| `session-timer` | Session duration | `15m 0s` |
| `api-timer` | API wait time | `api 3m 40s` |
| `vim-mode` | Vim mode indicator | `NORMAL` |
| `version` | Claude Code version | `v2.1.34` |

### Layout building blocks

| Segment | Purpose |
|---------|---------|
| `separator-pipe` | Pipe `│` between segments |
| `separator-arrow` | Powerline arrow separator |
| `separator-space` | Whitespace |
| `flex-space` | Right-alignment marker |
| `custom-text` | Static text string |
| `output-style` | Active output style |

---

## Context bar changes color as it fills

```diff
  ▓▓▓▓▓▓░░░░░░░░░░░░░░ 30%     ← green, you're fine
! ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 60%     ← yellow, heads up
- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 80%     ← red, time to /compact
```

Cost tracking auto-detects your plan (Pro/Max) and warns at the right thresholds.

---

## 3 themes

**default** -- two lines, works everywhere:
```
 Opus  myproject  main +2 ~1                          +83 -21  15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                      $1.23
```

**minimal** -- single line, text only:
```
 myproject · main +2 ~1                                    35% · $1.23
```

**powerline** -- Nerd Font icons and arrows:
```
  Opus    ~/c/myproject    main  +2 ~1         +83 -21    15m 0s
 ███████░░░░░░░░ 35%   84k/200k                    $1.23   NORMAL
```

---

## Add your own segment

No fork needed. Plugins live in their own directory:

```bash
omc create my-segment
```

Creates `~/.claude/oh-my-claude/plugins/my-segment/segment.js`:

```js
export const meta = {
  name: 'my-segment',
  description: 'My custom segment',
  requires: [],
  defaultConfig: {},
};

export function render(data, config) {
  return { text: 'Hello!', style: 'cyan' };
}
```

Add it to your theme, restart Claude Code, done. Three rules: export `meta`, export `render`, return `{ text, style }` or `null`.

Full data field reference: [docs/segment-contract.md](docs/segment-contract.md)

**Share your segment:** PR it into `src/segments/` or post your `segment.js` anywhere -- others drop it in their plugins directory.

---

## CLI

```
npx @npow/oh-my-claude   Install (interactive wizard)
omc create <name>         Scaffold a new plugin segment
omc themes                List available themes
omc list                  List all 41 segments
omc validate              Check segment contract compliance
omc uninstall             Remove from Claude Code
```

---

## Requirements

- Node 18+ (ships with Claude Code)
- Zero npm dependencies

## Contributing

PRs welcome. One file per segment, export `meta` + `render`, handle nulls, run `npm run validate`.

## License

MIT
