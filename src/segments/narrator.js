// src/segments/narrator.js — Third-person narrator describing the session like a text adventure
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'narrator',
  description: 'A tiny third-person narrator that describes session activity like a text adventure',
  requires: [],
  defaultConfig: {
    style: 'dim italic',
  },
};

// Module-level state: stabilize messages across renders
let lastMessage = '';
let renderCount = 0;

/**
 * Simple deterministic pick from an array based on a numeric seed.
 * Uses integer modulo — no randomness, fully stable within a 3-render window.
 *
 * @param {string[]} choices
 * @param {number} seed
 * @returns {string}
 */
function pick(choices, seed) {
  return choices[Math.abs(seed) % choices.length];
}

/**
 * Resolve the narrator message based on session state, in priority order.
 *
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {number} seed - Deterministic seed for "random" picks
 * @returns {string}
 */
function resolveMessage(data, seed) {
  const contextPct = data?.context_window?.used_percentage ?? 0;
  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const linesRemoved = data?.cost?.total_lines_removed ?? 0;
  const apiDuration = data?.cost?.total_api_duration_ms ?? 0;
  const totalDuration = data?.cost?.total_duration_ms ?? 0;
  const cost = data?.cost?.total_cost_usd ?? 0;

  // 1. Context >= 90%
  if (contextPct >= 90) {
    return pick(
      ['The walls close in...', 'Memory fades...', 'Context overflows...'],
      seed,
    );
  }

  // 2. Context >= 70%
  if (contextPct >= 70) {
    return pick(
      ['The tome grows heavy...', 'Pages fill rapidly...', 'Ink runs low...'],
      seed,
    );
  }

  // 3. Large refactoring (lots added AND lots removed)
  if (linesAdded > 200 && linesRemoved > 50) {
    return 'A great refactoring unfolds...';
  }

  // 4. Significant additions
  if (linesAdded > 100) {
    return pick(
      ['Code springs to life...', 'The architect builds...', 'Creation in progress...'],
      seed,
    );
  }

  // 5. Net deletion (gardening)
  if (linesRemoved > linesAdded && linesRemoved > 20) {
    return 'The gardener prunes...';
  }

  // 6. API-bound session (waiting on LLM)
  if (totalDuration > 0 && apiDuration > totalDuration * 0.6) {
    return pick(
      ['Waiting for the oracle...', 'The machine thinks...', 'Patience...'],
      seed,
    );
  }

  // 7. Expensive session
  if (cost > 10) {
    return 'Gold coins scatter...';
  }

  // 8. Long session (> 1 hour)
  if (totalDuration > 3_600_000) {
    return 'The session stretches on...';
  }

  // 9. Brand new session (< 1 minute)
  if (totalDuration < 60_000) {
    return pick(
      ['A new quest begins...', 'The journey starts...', 'Once upon a session...'],
      seed,
    );
  }

  // 10. Default
  return pick(
    ['The developer watches...', 'Keys clack softly...', 'All is well...'],
    seed,
  );
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Only update the message every 3 renders to prevent flickering
  if (renderCount % 3 === 0) {
    // Use floor(renderCount / 3) as the seed so it's stable within each 3-render window
    const seed = Math.floor(renderCount / 3);
    lastMessage = resolveMessage(data, seed);
  }

  renderCount++;

  return { text: lastMessage, style: cfg.style };
}
