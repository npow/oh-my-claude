// Built-in plugin registry
// Each plugin is imported and registered by its meta.name.

import * as modelName from './model-name.js';
import * as contextBar from './context-bar.js';
import * as contextPercent from './context-percent.js';
import * as contextTokens from './context-tokens.js';
import * as sessionCost from './session-cost.js';
import * as costBudget from './cost-budget.js';
import * as gitBranch from './git-branch.js';
import * as gitStatus from './git-status.js';
import * as directory from './directory.js';
import * as sessionTimer from './session-timer.js';
import * as apiTimer from './api-timer.js';
import * as linesChanged from './lines-changed.js';
import * as vimMode from './vim-mode.js';
import * as version from './version.js';
import * as outputStyle from './output-style.js';
import * as separatorPipe from './separator-pipe.js';
import * as separatorArrow from './separator-arrow.js';
import * as separatorSpace from './separator-space.js';
import * as flexSpace from './flex-space.js';
import * as customText from './custom-text.js';
import * as tamagotchi from './tamagotchi.js';
import * as smartNudge from './smart-nudge.js';
import * as narrator from './narrator.js';
import * as streak from './streak.js';
import * as soundtrack from './soundtrack.js';
import * as vibeCheck from './vibe-check.js';
import * as achievement from './achievement.js';
import * as tokenSparkline from './token-sparkline.js';
import * as fortuneCookie from './fortune-cookie.js';
import * as horoscope from './horoscope.js';
import * as coworker from './coworker.js';
import * as commitMsg from './commit-msg.js';
import * as garden from './garden.js';
import * as coffeeCup from './coffee-cup.js';
import * as battleLog from './battle-log.js';
import * as cat from './cat.js';
import * as weatherReport from './weather-report.js';
import * as emojiStory from './emoji-story.js';
import * as speedrun from './speedrun.js';
import * as stockTicker from './stock-ticker.js';
import * as rpgStats from './rpg-stats.js';
// New: context & token management
import * as contextRemaining from './context-remaining.js';
import * as contextEta from './context-eta.js';
import * as compactHint from './compact-hint.js';
import * as inputOutputRatio from './input-output-ratio.js';
import * as tokenRate from './token-rate.js';
import * as costRate from './cost-rate.js';
import * as costPerLine from './cost-per-line.js';
import * as tokensPerDollar from './tokens-per-dollar.js';
import * as efficiencyScore from './efficiency-score.js';
import * as idleTimer from './idle-timer.js';
// New: time & productivity
import * as clock from './clock.js';
import * as dateDisplay from './date-display.js';
import * as dayProgress from './day-progress.js';
import * as weekProgress from './week-progress.js';
import * as yearProgress from './year-progress.js';
import * as countdown from './countdown.js';
import * as pomodoro from './pomodoro.js';
import * as breakReminder from './break-reminder.js';
// New: git
import * as gitStash from './git-stash.js';
import * as gitAheadBehind from './git-ahead-behind.js';
import * as gitLastCommit from './git-last-commit.js';
import * as gitTag from './git-tag.js';
import * as packageVersion from './package-version.js';
// New: data viz
import * as trendArrow from './trend-arrow.js';
import * as costSparkline from './cost-sparkline.js';
import * as linesSparkline from './lines-sparkline.js';
// New: fun
import * as moodRing from './mood-ring.js';
import * as dadJoke from './dad-joke.js';
import * as magic8ball from './magic-8ball.js';
import * as compliment from './compliment.js';
import * as loadingSpinner from './loading-spinner.js';
// New: gamification
import * as xpBar from './xp-bar.js';
import * as level from './level.js';
import * as comboMeter from './combo-meter.js';
import * as bossHealth from './boss-health.js';
import * as questLog from './quest-log.js';
import * as lootDrop from './loot-drop.js';

const allPlugins = [
  modelName, contextBar, contextPercent, contextTokens,
  sessionCost, costBudget, gitBranch, gitStatus,
  directory, sessionTimer, apiTimer, linesChanged,
  vimMode, version, outputStyle,
  separatorPipe, separatorArrow, separatorSpace, flexSpace, customText,
  tamagotchi, vibeCheck, achievement, tokenSparkline,
  smartNudge, narrator, streak, soundtrack, fortuneCookie, horoscope,
  coworker, commitMsg, garden, coffeeCup,
  battleLog, cat, weatherReport,
  emojiStory, speedrun,
  stockTicker, rpgStats,
  // Context & token management
  contextRemaining, contextEta, compactHint, inputOutputRatio,
  tokenRate, costRate, costPerLine, tokensPerDollar,
  efficiencyScore, idleTimer,
  // Time & productivity
  clock, dateDisplay, dayProgress, weekProgress, yearProgress,
  countdown, pomodoro, breakReminder,
  // Git
  gitStash, gitAheadBehind, gitLastCommit, gitTag, packageVersion,
  // Data viz
  trendArrow, costSparkline, linesSparkline,
  // Fun
  moodRing, dadJoke, magic8ball, compliment, loadingSpinner,
  // Gamification
  xpBar, level, comboMeter, bossHealth, questLog, lootDrop,
];

export const builtinPlugins = {};
for (const plug of allPlugins) {
  if (plug.meta?.name) {
    builtinPlugins[plug.meta.name] = plug;
  }
}
