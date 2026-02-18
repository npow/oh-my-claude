# oh-my-claude

**Like oh-my-zsh, but for Claude Code.**

A statusline framework for Claude Code's `--statusline` feature. 41 segments, 3 themes, a plugin system, one command to install.

<!-- badges -->
<!-- ![npm version](https://img.shields.io/npm/v/oh-my-claude) -->
<!-- ![license](https://img.shields.io/github/license/...) -->

---

### What it looks like

**Default theme** -- two lines, works in every terminal:

```
 Opus  myproject  main +2 ~1                          +83 -21  15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                      $4.56
```

Context filling up? The bar changes color so you know before you hit the wall:

```
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 80%    <-- turns red here
```

---

## Install

```bash
npx @npow/oh-my-claude
```

That's it. Picks a theme, writes the config, wires up Claude Code. Restart Claude Code and you're done.

---

## Why oh-my-claude?

- **Know when to /compact** -- Context bar turns yellow at 60%, red at 80%. Never hit the wall blind.
- **Track what you're spending** -- Auto-detects your plan (Pro/Max). Session cost turns yellow before you blow budget.
- **See your git state** -- Branch + dirty files always visible. Never commit to the wrong branch again.
- **Make it yours** -- 41 segments, 3 themes, a plugin system, JSON config. From minimal to full dashboard.

---

## Segment Showcase

41 segments. Mix and match to build the statusline that fits how you work. Here are four setups to show the range.

**The Productivity Setup:**
```
 Opus  myproject  main +2 ~1                          +83 -21  15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                      $4.56
```
Context bar, git info, cost tracking, lines changed, session timer. Everything you need, nothing you don't.

**The Fun Setup:**
```
 (^.^)  ✨ vibing  🥠 "Weeks of coding can save hours of planning"
 🏕️ Base Camp (12%) +47 gold            =^._.^= *perks up*  [████]
```
Tamagotchi pet, vibe check, fortune cookie, battle log, cat companion, coffee cup. Your terminal has personality now.

**The Gamer Setup:**
```
 Lv.3 STR:10 DEX:5 INT:12 WIS:8 CHA:0               ⏱️ 12:30 [A]
 ▁▂▃▄▅▆  🎵 lo-fi beats  $OMC ▲ $4.56          🏆 First Blood
```
RPG stats, speedrun timer, token sparkline, soundtrack, stock ticker, achievements. Every session is a run.

**The Minimal Setup:**
```
 myproject · main · 35% · $4.56
```
Single line. Text only. No bars, no icons, no fuss. The `minimal` theme does this out of the box.

---

## All 41 Segments

Organized by what you're trying to do.

### "I want to be productive"

The bread and butter. Context awareness, cost tracking, git state, and helpful nudges.

| Segment | What it shows | Example |
|---------|---------------|---------|
| `context-bar` | Visual progress bar for context window | `▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%` |
| `context-percent` | Context usage as a number | `35%` |
| `context-tokens` | Token count as used/total | `84k/200k` |
| `session-cost` | Running session cost in USD | `$4.56` |
| `cost-budget` | Cost vs your budget | `$3.50/$10.00` |
| `git-branch` | Current branch name | `main` |
| `git-status` | Staged, modified, untracked counts | `+2 ~1 ?3` |
| `lines-changed` | Lines added and removed | `+83 -21` |
| `smart-nudge` | Context-aware suggestions | `/compact` at 75%, `commit?` at 100 lines |
| `token-sparkline` | ASCII sparkline of context over time | `▁▂▃▄▅▆▇█` |

### "I want to have fun while I wait"

Entertainment and personality. None of these are on by default -- add them to your theme when you want some life in your terminal.

| Segment | What it does | Example |
|---------|--------------|---------|
| `tamagotchi` | Virtual pet that reacts to your session | `(^.^)` happy, `(x_x) RIP` at 95% context |
| `cat` | A cat doing cat things | `=^._.^= *sits on context window*` |
| `vibe-check` | One-word mood derived from session metrics | `vibing`, `shipping`, `burning cash` |
| `fortune-cookie` | Rotating developer wisdom | `"Weeks of coding can save hours of planning"` |
| `narrator` | Third-person text adventure narration | `The walls close in...` |
| `soundtrack` | Suggests a music genre for the moment | `lo-fi beats`, `boss battle music` |
| `garden` | ASCII plants that grow as you code | `(.)` seed to `(tree)` at 500 lines |
| `coffee-cup` | Coffee that drains over a 2-hour session | `[████]` full to `[    ] refill?` |

### "I want to gamify my session"

Turn your coding session into a game. Achievements, stats, and timers to keep you going.

| Segment | What it does | Example |
|---------|--------------|---------|
| `achievement` | Unlockable badges for session milestones | `Centurion` at 100 lines, `Whale` at $20 |
| `rpg-stats` | Session stats as D&D attributes | `Lv.3 STR:10 DEX:5 INT:12 WIS:8 CHA:0` |
| `speedrun` | Timer with cost-efficiency rating | `12:30 [A]` |
| `streak` | Consecutive-day usage streak | `5d streak` |
| `battle-log` | Session framed as a dungeon crawl | `Deep Dungeon (65%) +47 gold` |
| `stock-ticker` | Session cost as a stock price | `$OMC ▲ $4.56` |
| `emoji-story` | Growing sequence of emojis summarizing the session | A new emoji appended for each milestone |

### "I want useful information"

Identity, navigation, and situational awareness. The segments that tell you where you are and what's happening.

| Segment | What it shows | Example |
|---------|---------------|---------|
| `model-name` | Current model display name | `Opus` |
| `directory` | Working directory (basename, fish, or full) | `myproject` |
| `session-timer` | How long this session has been running | `15m 0s` |
| `api-timer` | Cumulative API wait time | `api 3m 40s` |
| `vim-mode` | Current vim mode when active | `NORMAL` |
| `version` | Claude Code version string | `v2.1.34` |
| `weather-report` | Session conditions as a weather forecast | `Clear Skies`, `Stormy` at 85% context |
| `horoscope` | Daily coding horoscope by zodiac sign | `Mercury is in retrograde. Avoid force-pushing.` |
| `coworker` | Fake Slack messages reacting to your session | `@bot: 'ship it already'` |
| `commit-msg` | What the commit message should be | `git commit -m "feat: rewrite the entire codebase"` |

### "I want to build my own layout"

Building blocks for custom themes. Separators, spacing, and raw text.

| Segment | Purpose |
|---------|---------|
| `separator-pipe` | Vertical pipe `│` between segments |
| `separator-arrow` | Powerline arrow `` separator |
| `separator-space` | Whitespace for breathing room |
| `flex-space` | Right-alignment marker for the compositor |
| `custom-text` | Your own static text string |
| `output-style` | Shows active output style (hidden when "default") |

---

## Themes

### default

Two-line layout. No special fonts. Works everywhere.

```
 Opus  myproject  main +2 ~1                          +83 -21  15m 0s
 ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 35%                                      $1.23
```

Line 1: model, directory, git branch, git status (left) / lines changed, session timer (right)
Line 2: context bar (left) / session cost (right)

### minimal

Single line. Text only. No bars, no icons, no fuss.

```
 myproject · main +2 ~1                                    35% · $1.23
```

### powerline

Two-line layout with Nerd Font icons and arrow separators. Requires a [Nerd Font](https://www.nerdfonts.com/).

```
  Opus   ~/c/myproject   main +2 ~1              +83 -21   15m 0s
 ███████░░░░░░░░ 35%  84k/200k                    $1.23  NORMAL
```

Line 1: model, directory (fish-style), git branch, git status / lines changed, session timer
Line 2: context bar, token count / session cost, vim mode

---

## Configuration

After install, your config lives at `~/.claude/oh-my-claude/config.json`:

```json
{
  "theme": "default",
  "segments": {
    "cost-budget": {
      "budget": 10
    },
    "session-cost": {
      "plan": "pro"
    },
    "context-bar": {
      "warnAt": 60,
      "criticalAt": 80
    }
  }
}
```

Pick a theme, override any segment config you want, done. Segment configs in `config.json` merge on top of the theme defaults.

### Switch themes

Edit `config.json` and change `"theme"` to `"default"`, `"minimal"`, or `"powerline"`. Or run:

```bash
omc themes
```

### Plan detection

The `session-cost` segment auto-detects your plan from context window size:
- 1M context = Max plan
- 200k context = Pro plan

Override it in config if needed: `"plan": "pro"`, `"max5"`, `"max20"`, or `"api"`.

---

## Add your own segment

You don't need to fork the repo. Plugins live in their own directory:

```bash
omc create my-segment
```

This creates `~/.claude/oh-my-claude/plugins/my-segment/segment.js`:

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

Add it to your theme's lines in `config.json`, restart Claude Code, done.

Three rules:
1. Export `meta` with a `name`
2. Export `render(data, config)`
3. Return `{ text, style }` or `null`

The `data` object contains everything Claude Code sends -- model info, context window stats, cost, git state, and more. `null` means "hide this segment for now." Full data field reference: [docs/segment-contract.md](docs/segment-contract.md)

### Share your segment

Made something cool? Two options:
- **PR it** -- Add your segment to `src/segments/` and open a pull request. We accept all reasonable contributions.
- **Share the file** -- Post your `segment.js` anywhere. Others can drop it in their plugins directory.

---

## CLI commands

```
omc install      Interactive install wizard
omc create       Scaffold a new plugin segment
omc themes       List available themes
omc list         List all 41 segments with descriptions
omc validate     Check that all segments export the correct shape
omc uninstall    Remove oh-my-claude from Claude Code
omc help         Show help
```

---

## Requirements

- Node 18+
- Zero npm dependencies

---

## Contributing

PRs welcome. If you're adding a segment:

1. One file per segment in `src/segments/`
2. Export `meta` and `render` -- no exceptions
3. Handle missing data gracefully (never crash the statusline)
4. Add a test in `tests/` covering normal data, null fields, and edge cases
5. Run `npm run validate` to check the contract

---

## License

MIT
