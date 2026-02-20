// src/plugins/coworker.js — Fake Slack messages from a simulated coworker watching you code
// Zero dependencies. Node 18+ ESM.
//
// Message selection (priority order, first match wins):
//   1.  context >= 90%                         -> "we need to talk about your context usage"
//   2.  context >= 75%                         -> "getting a bit full in here"
//   3.  cost >= $20                            -> "finance wants to chat"
//   4.  cost >= $10                            -> "that's coming out of your bonus"
//   5.  lines_added > 500                      -> "are you rewriting the whole thing?"
//   6.  lines_added > 200                      -> "ship it already"
//   7.  removed > added AND removed > 50       -> "delete is my favorite key too"
//   8.  duration > 2hr                         -> "do you even go outside?"
//   9.  duration > 1hr                         -> "still going huh"
//  10.  duration < 1min                        -> "oh here we go again"
//  11.  default                                -> random pick from "looking good" / "LGTM" / "carry on"
//
// Anti-flicker: message only changes every 5 renders.

export const meta = {
  name: 'coworker',
  description: 'Fake Slack messages from a simulated coworker reacting to your session',
  requires: [],
  defaultConfig: {
    style: 'dim',
    botName: 'bot',
  },
};

// Module-level state for anti-flicker
let lastMessage = '';
let renderCount = 0;

/**
 * Simple deterministic pick from an array based on a numeric seed.
 *
 * @param {string[]} choices
 * @param {number} seed
 * @returns {string}
 */
function pick(choices, seed) {
  return choices[Math.abs(seed) % choices.length];
}

/**
 * Resolve the coworker message based on session state, in priority order.
 *
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {string} botName - Display name for the fake coworker
 * @param {number} seed - Deterministic seed for default message picks
 * @returns {string}
 */
function resolveMessage(data, botName, seed) {
  const contextPct = data?.context_window?.used_percentage ?? 0;
  const cost = data?.cost?.total_cost_usd ?? 0;
  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const linesRemoved = data?.cost?.total_lines_removed ?? 0;
  const duration = data?.cost?.total_duration_ms ?? 0;

  // 1. Context >= 90%
  if (contextPct >= 90) {
    return `@${botName}: 'we need to talk about your context usage'`;
  }

  // 2. Context >= 75%
  if (contextPct >= 75) {
    return `@${botName}: 'getting a bit full in here'`;
  }

  // 3. Cost >= $20
  if (cost >= 20) {
    return `@${botName}: 'finance wants to chat'`;
  }

  // 4. Cost >= $10
  if (cost >= 10) {
    return `@${botName}: 'that's coming out of your bonus'`;
  }

  // 5. Lines added > 500
  if (linesAdded > 500) {
    return `@${botName}: 'are you rewriting the whole thing?'`;
  }

  // 6. Lines added > 200
  if (linesAdded > 200) {
    return `@${botName}: 'ship it already'`;
  }

  // 7. Net deletion with significant removal
  if (linesRemoved > linesAdded && linesRemoved > 50) {
    return `@${botName}: 'delete is my favorite key too'`;
  }

  // 8. Duration > 2 hours
  if (duration > 7_200_000) {
    return `@${botName}: 'do you even go outside?'`;
  }

  // 9. Duration > 1 hour
  if (duration > 3_600_000) {
    return `@${botName}: 'still going huh'`;
  }

  // 10. Duration < 1 minute
  if (duration < 60_000) {
    return `@${botName}: 'oh here we go again'`;
  }

  // 11. Default — pick one deterministically
  return pick(
    [
      `@${botName}: 'looking good'`,
      `@${botName}: 'LGTM'`,
      `@${botName}: 'carry on'`,
    ],
    seed,
  );
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Only update the message every 5 renders to prevent flickering
  if (renderCount % 5 === 0) {
    const seed = Math.floor(renderCount / 5);
    lastMessage = resolveMessage(data, cfg.botName, seed);
  }

  renderCount++;

  return { text: lastMessage, style: cfg.style };
}
