// src/color.js — ANSI color utilities
// Zero dependencies. Node 18+ ESM.

const RESET = '\x1b[0m';

// Style codes: modifiers
const MODIFIERS = {
  bold:      '\x1b[1m',
  dim:       '\x1b[2m',
  italic:    '\x1b[3m',
  underline: '\x1b[4m',
  inverse:   '\x1b[7m',
};

// Foreground colors (standard 16-color)
const FG_COLORS = {
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  grey:    '\x1b[90m',
  // orange via 256-color (color 208)
  orange:  '\x1b[38;5;208m',
};

// Background colors
const BG_COLORS = {
  red:     '\x1b[41m',
  green:   '\x1b[42m',
  yellow:  '\x1b[43m',
  blue:    '\x1b[44m',
  magenta: '\x1b[45m',
  cyan:    '\x1b[46m',
  white:   '\x1b[47m',
  gray:    '\x1b[100m',
  grey:    '\x1b[100m',
  // orange via 256-color background (color 208)
  orange:  '\x1b[48;5;208m',
};

/**
 * Apply ANSI styles to text.
 *
 * @param {string} text - The text to style
 * @param {string} styleString - Space-separated tokens, e.g. "bold cyan", "bg:red white", "dim green"
 * @returns {string} ANSI-wrapped text, or plain text if no valid styles
 */
export function stylize(text, styleString) {
  if (text == null) return '';
  const str = String(text);
  if (!str) return '';
  if (!styleString || typeof styleString !== 'string') return str;

  const tokens = styleString.trim().split(/\s+/);
  let codes = '';

  for (const token of tokens) {
    if (!token) continue;

    const lower = token.toLowerCase();

    // Background color: "bg:COLOR"
    if (lower.startsWith('bg:')) {
      const colorName = lower.slice(3);
      if (BG_COLORS[colorName]) {
        codes += BG_COLORS[colorName];
      }
      continue;
    }

    // Modifier
    if (MODIFIERS[lower]) {
      codes += MODIFIERS[lower];
      continue;
    }

    // Foreground color
    if (FG_COLORS[lower]) {
      codes += FG_COLORS[lower];
      continue;
    }
  }

  if (!codes) return str;
  return codes + str + RESET;
}

// Regex matching all ANSI escape sequences (CSI sequences and OSC sequences)
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m|\x1b\].*?\x07/g;

/**
 * Strip all ANSI escape codes from text.
 *
 * @param {string} text - Text potentially containing ANSI codes
 * @returns {string} Plain text with ANSI codes removed
 */
export function stripAnsi(text) {
  if (text == null) return '';
  return String(text).replace(ANSI_RE, '');
}

/**
 * Check if a Unicode code point renders as double-width (2 columns) in a terminal.
 *
 * @param {number} cp - Unicode code point
 * @returns {boolean}
 */
function isWide(cp) {
  return (
    // Hangul Jamo
    (cp >= 0x1100 && cp <= 0x115F) ||
    // CJK Radicals, Kangxi, Kana, Bopomofo, CJK Compat
    (cp >= 0x2E80 && cp <= 0x33BF) ||
    // Misc Technical (⌚ ⏰ etc.)
    (cp >= 0x2300 && cp <= 0x23FF) ||
    // Misc Symbols + Dingbats (✨ ⚔ ☕ etc.)
    (cp >= 0x2600 && cp <= 0x27BF) ||
    // CJK Unified Ideographs Extension A
    (cp >= 0x3400 && cp <= 0x4DBF) ||
    // CJK Unified Ideographs
    (cp >= 0x4E00 && cp <= 0x9FFF) ||
    // Hangul Syllables
    (cp >= 0xAC00 && cp <= 0xD7AF) ||
    // CJK Compatibility Ideographs
    (cp >= 0xF900 && cp <= 0xFAFF) ||
    // CJK Compatibility Forms
    (cp >= 0xFE30 && cp <= 0xFE6F) ||
    // Fullwidth Forms
    (cp >= 0xFF01 && cp <= 0xFF60) ||
    (cp >= 0xFFE0 && cp <= 0xFFE6) ||
    // Emoji & Symbols (Supplementary Multilingual Plane)
    (cp >= 0x1F000 && cp <= 0x1FBFF) ||
    // CJK Unified Ideographs Extension B+
    (cp >= 0x20000 && cp <= 0x2FFFF) ||
    // Supplementary Private Use Area (Nerd Font v3 double-width icons)
    (cp >= 0xF0000 && cp <= 0x10FFFF)
  );
}

/**
 * Calculate the visible column width of a string in a terminal.
 * Strips ANSI codes, then counts double-width characters (emoji, CJK,
 * Nerd Font icons) as 2 columns and zero-width characters as 0.
 *
 * @param {string} text - Text potentially containing ANSI codes and wide chars
 * @returns {number} Visible column width
 */
export function stringWidth(text) {
  if (text == null) return 0;
  const stripped = stripAnsi(text);
  let width = 0;
  for (const char of stripped) {
    const cp = char.codePointAt(0);
    // Zero-width: control chars, variation selectors, ZWJ, BOM
    if (
      cp <= 0x1F ||
      (cp >= 0x7F && cp <= 0x9F) ||
      (cp >= 0xFE00 && cp <= 0xFE0F) ||
      cp === 0x200B || cp === 0x200C || cp === 0x200D || cp === 0xFEFF
    ) continue;
    width += isWide(cp) ? 2 : 1;
  }
  return width;
}
