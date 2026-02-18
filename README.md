# oh-my-claude

**Like oh-my-zsh, but for Claude Code.** An extensible statusline framework with themes and plugins.

[![npm version](https://img.shields.io/npm/v/@npow/oh-my-claude)](https://www.npmjs.com/package/@npow/oh-my-claude)
[![license](https://img.shields.io/github/license/npow/oh-my-claude)](LICENSE)

```bash
npx @npow/oh-my-claude
```

---

## Pick your vibe

```ansi
 (^.^)  [36m✨ vibing[0m  [2;3m🥠 "Weeks of coding can save hours of planning"[0m
 [2m🏕️ Base Camp (12%) +47 gold[0m          [32m=^._.^= *perks up*[0m  [1m[████][0m
```
Tamagotchi pet, vibe check, fortune cookies, dungeon crawl, cat companion, draining coffee cup.

```ansi
 [36mLv.3 STR:10 DEX:5 INT:12 WIS:8 CHA:0[0m               [1;32m⏱️ 12:30 [A][0m
 [32m▁▂▃▄▅▆[0m  [2m🎵 lo-fi beats[0m  [33m$OMC ▲ $4.56[0m          [1;36m🏆 First Blood[0m
```
RPG stats, speedrun rating, token sparkline, soundtrack, stock ticker, achievements.

```ansi
 [1;36mOpus[0m  [37mmyproject[0m  [32mmain[0m [33m+2 ~1[0m                          [2m+83 -21[0m  [2m15m 0s[0m
 [32m▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%[0m                                      [2m$4.56[0m
```
Model, git branch, context bar, cost, lines changed, session timer. The essentials.

```ansi
 [37mmyproject[0m [2m·[0m [32mmain[0m [2m·[0m [37m35%[0m [2m·[0m [2m$4.56[0m
```
Or just one line. Your call.

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
| `separator-arrow` | Powerline arrow `` |
| `separator-space` | Whitespace |
| `flex-space` | Right-alignment marker |
| `custom-text` | Static text string |
| `output-style` | Active output style |

---

## Context bar changes color as it fills

```ansi
 [32m▓▓▓▓▓▓░░░░░░░░░░░░░░ 30%[0m   ← green, you're fine
 [1;33m▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 60%[0m   ← [1;33myellow, heads up[0m
 [1;31m▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 80%[0m   ← [1;31mred, time to /compact[0m
```

Cost tracking auto-detects your plan (Pro/Max) and warns at the right thresholds.

---

## 3 themes

**default** -- two lines, works everywhere:
```ansi
 [1;36mOpus[0m  [37mmyproject[0m  [32mmain[0m [33m+2 ~1[0m                          [2m+83 -21[0m  [2m15m 0s[0m
 [32m▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%[0m                                      [2m$1.23[0m
```

**minimal** -- single line, text only:
```ansi
 [37mmyproject[0m [2m·[0m [32mmain +2 ~1[0m                                    [37m35%[0m [2m·[0m [2m$1.23[0m
```

**powerline** -- Nerd Font icons and arrows:
```ansi
 [1;36m Opus[0m [34m[0m [34m~/c/myproject[0m [34m[0m [32m main[0m [33m+2 ~1[0m       [2m+83 -21[0m [34m[0m [2m 15m 0s[0m
 [32m███████░░░░░░░░ 35%[0m [34m[0m [2m84k/200k[0m                    [37m$1.23[0m [34m[0m [1;32mNORMAL[0m
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

## Configuration

Config lives at `~/.claude/oh-my-claude/config.json`:

```json
{
  "theme": "default",
  "segments": {
    "session-cost": { "plan": "pro" },
    "context-bar": { "warnAt": 60, "criticalAt": 80 }
  }
}
```

Pick a theme, override any segment config, done.

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
