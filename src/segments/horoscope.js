// src/segments/horoscope.js — Coding horoscope: daily prediction based on day-of-week and session metrics
// Zero dependencies. Node 18+ ESM.
//
// Sign selection: day of month mapped to zodiac sign (1-2=Aries, 3-4=Taurus, ..., 23-24=Pisces, 25+=cycles).
// Prediction selection: deterministic hash of (dayOfYear + signIndex) picks from 36 horoscope templates.
// Same sign and prediction all day for a given calendar date.

export const meta = {
  name: 'horoscope',
  description: 'Daily coding horoscope based on zodiac sign derived from the day of the month',
  requires: [],
  defaultConfig: {
    style: 'dim italic',
    showSign: true,
  },
};

const ZODIAC = [
  { name: 'Aries',       symbol: '\u2648' },
  { name: 'Taurus',      symbol: '\u2649' },
  { name: 'Gemini',      symbol: '\u264A' },
  { name: 'Cancer',       symbol: '\u264B' },
  { name: 'Leo',         symbol: '\u264C' },
  { name: 'Virgo',       symbol: '\u264D' },
  { name: 'Libra',       symbol: '\u264E' },
  { name: 'Scorpio',     symbol: '\u264F' },
  { name: 'Sagittarius', symbol: '\u2650' },
  { name: 'Capricorn',   symbol: '\u2651' },
  { name: 'Aquarius',    symbol: '\u2652' },
  { name: 'Pisces',      symbol: '\u2653' },
];

const PREDICTIONS = [
  'Mercury is in retrograde. Avoid force-pushing.',
  'The stars align for a major refactor.',
  'Today favors writing tests over features.',
  'A mysterious bug will reveal itself before lunch.',
  'Your linter will betray you today.',
  'Commit early, commit often. The cosmos demands it.',
  'An unexpected dependency update brings chaos.',
  'The code review gods smile upon you.',
  'Beware of scope creep during the afternoon.',
  'A senior engineer will question your naming conventions.',
  "Today's lucky number: 0-indexed.",
  'Your pull request will be approved on the first try.',
  'Retrograde warning: do not run migrations today.',
  'The tests you skip today will haunt you tomorrow.',
  'A merge conflict is written in your stars.',
  'Your TODO comments will outlive you.',
  'Pair programming brings unexpected breakthroughs.',
  'Avoid premature optimization. The stars are watching.',
  'A forgotten console.log will make it to production.',
  'Today is a good day to update your README.',
  'The deployment pipeline favors the bold.',
  'A type error lurks where you least expect it.',
  'Your git stash holds forgotten treasures.',
  'The standup will be mercifully short today.',
  'An off-by-one error approaches from the east.',
  'Trust your instincts. Revert that last commit.',
  'A rubber duck will solve your hardest problem.',
  'Null checks in your future. Many null checks.',
  'The intern will find a bug you missed.',
  'Today your regex will actually work on the first try.',
  'Beware of yak shaving disguised as productivity.',
  'The build will break, but not by your hand.',
  'A legacy system calls out for your attention.',
  'Your branch name will spark joy today.',
  'The documentation you write today saves future-you.',
  'Venus enters your CI/CD house. Deploys go smoothly.',
];

/**
 * Derive the zodiac sign index from the day of the month.
 * Days 1-2 = 0 (Aries), 3-4 = 1 (Taurus), ..., 23-24 = 11 (Pisces), then cycles.
 *
 * @param {number} dayOfMonth - 1-31
 * @returns {number} Index into ZODIAC (0-11)
 */
function getSignIndex(dayOfMonth) {
  return Math.floor((dayOfMonth - 1) / 2) % ZODIAC.length;
}

/**
 * Compute the day of the year (1-366) for a given Date.
 *
 * @param {Date} date
 * @returns {number}
 */
function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 86_400_000;
  return Math.floor(diff / oneDay);
}

/**
 * Simple deterministic hash: combine dayOfYear and signIndex into an integer.
 * Uses a basic multiplicative hash to spread values across the prediction list.
 *
 * @param {number} doy - Day of year (1-366)
 * @param {number} signIdx - Sign index (0-11)
 * @returns {number} Non-negative integer
 */
function deterministicHash(doy, signIdx) {
  // Multiplicative hash with golden-ratio-derived constant.
  // Different enough from simple modulo to avoid obvious patterns.
  let h = (doy * 2654435761 + signIdx * 40503) & 0x7fffffff;
  h = ((h >>> 16) ^ h) & 0x7fffffff;
  return h;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const now = new Date();
  const dom = now.getDate();
  const doy = dayOfYear(now);

  const signIdx = getSignIndex(dom);
  const sign = ZODIAC[signIdx];

  const hash = deterministicHash(doy, signIdx);
  const prediction = PREDICTIONS[hash % PREDICTIONS.length];

  const prefix = cfg.showSign ? `${sign.symbol} ` : '';
  const text = `${prefix}${prediction}`;

  return { text, style: cfg.style };
}
