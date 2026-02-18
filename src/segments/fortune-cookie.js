// src/segments/fortune-cookie.js — Developer-themed fortune cookie wisdom
// Zero dependencies. Node 18+ ESM.
//
// Fortune selection:
//   - Uses session_id as a seed when available (deterministic per session).
//   - Falls back to a module-level random pick done once at import time.
//   - Rotates to a new fortune every `rotateEvery` renders (default: 10).

export const meta = {
  name: 'fortune-cookie',
  description: 'Shows a rotating developer-themed fortune cookie message',
  requires: [],
  defaultConfig: {
    style: 'dim italic',
    showEmoji: true,
    rotateEvery: 10,
  },
};

const FORTUNES = [
  'The bug you seek is in the file you haven\'t read',
  'A commit a day keeps the rebase away',
  'There are only two hard things: cache invalidation, naming things, and off-by-one errors',
  'The best code is no code at all',
  'Legacy code is just code without tests',
  '"It works on my machine" is not a deployment strategy',
  'First, solve the problem. Then, write the code.',
  'Code is read more often than it is written',
  'Weeks of coding can save you hours of planning',
  'There is no cloud, only someone else\'s computer',
  'A well-placed log statement is worth a thousand debugger sessions',
  'The fastest algorithm is the one you don\'t run',
  'Today\'s TODO is tomorrow\'s tech debt',
  'Delete code with confidence; version control remembers',
  'Ship it, then fix it — but actually fix it',
  'The tests you skip today are the bugs you debug tomorrow',
  'Every regex problem creates two problems',
  'Your future self is your most important code reviewer',
  'Production is the only staging environment that matters',
  'Simplicity is the ultimate sophistication, especially in code',
  'If it hurts, do it more often — that\'s what CI is for',
  'Premature optimization is the root of all evil, but so is premature abstraction',
  'git push --force and you shall receive... merge conflicts',
  'The best error message is the one that never shows up',
  'A function should do one thing, and do it well',
  'Comments lie; code doesn\'t. But types are even more honest.',
  'The hardest bugs to fix are the ones you can\'t reproduce',
  'You are not your code. Your code is not you. Ship it.',
  'Good code is its own best documentation',
  'Measure twice, deploy once',
  'There\'s no shame in reading the docs',
  'If you can\'t explain it simply, you don\'t understand it well enough to code it',
  'The best time to refactor was yesterday. The second best time is now.',
  'Any sufficiently advanced configuration is indistinguishable from code',
  'The code compiles; therefore, ship it',
  'A linter catches what pride misses',
  'Debugging is like being a detective in a crime movie where you are also the murderer',
  'Never trust user input. Never trust your own input either.',
  'Workarounds are just features with low self-esteem',
  'One does not simply deploy on Friday',
  'The database is always the bottleneck. Always.',
  'Naming variables well is an act of kindness to your future self',
  'console.log-driven development: timeless, reliable, shameless',
  'All abstractions are leaky. Budget for the drip.',
  'Your dependencies have dependencies. It\'s turtles all the way down.',
  'The PR that\'s "almost ready" is never almost ready',
  'One cannot simply grep their way out of a design problem',
  'The best meetings are pull request reviews',
  'Every line you don\'t write is a line you don\'t have to maintain',
  'The build is red. It is always red. We ship anyway.',
  'Sleep on it. The bug will still be there tomorrow, but you\'ll be smarter.',
  'Copying from Stack Overflow is research. Citing it is professionalism.',
  'The fastest code is the code that never runs',
  'Feature flags: Schrodinger\'s deployment',
  'There are two types of software: the kind people complain about, and the kind nobody uses',
  'If your tests pass on the first try, your tests are wrong',
  'A monolith is just a microservice that kept eating',
];

const EMOJI = '\u{1F960}'; // fortune cookie emoji

// Module-level fallback seed (used when session_id is not available).
// Computed once at import time so it remains stable across renders.
const FALLBACK_SEED = Math.floor(Math.random() * FORTUNES.length);

// Module-level render counter for rotation tracking
let renderCount = 0;

/**
 * Simple string-to-integer hash. Produces a non-negative integer from a
 * string, used to derive a deterministic fortune index from session_id.
 *
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode  (djb2)
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  const rotateEvery = cfg.rotateEvery > 0 ? cfg.rotateEvery : 10;

  // Derive a base seed: session_id when available, otherwise the module-level fallback
  const sessionId = data?.session_id;
  const baseSeed = sessionId ? hashString(sessionId) : FALLBACK_SEED;

  // Rotation offset: advances by 1 every `rotateEvery` renders
  const rotation = Math.floor(renderCount / rotateEvery);

  // Pick a fortune deterministically from (baseSeed + rotation) mod length
  const index = (baseSeed + rotation) % FORTUNES.length;
  const fortune = FORTUNES[index];

  renderCount++;

  const prefix = cfg.showEmoji ? `${EMOJI} ` : '';
  const text = `${prefix}${fortune}`;

  return { text, style: cfg.style };
}
