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
];

export const builtinPlugins = {};
for (const plug of allPlugins) {
  if (plug.meta?.name) {
    builtinPlugins[plug.meta.name] = plug;
  }
}
