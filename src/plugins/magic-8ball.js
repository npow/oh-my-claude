// src/plugins/magic-8ball.js — Random Magic 8-Ball prediction
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'magic-8ball',
  description: 'Shows a Magic 8-Ball prediction that changes periodically',
  requires: [],
  defaultConfig: {
    style: 'magenta italic',
  },
};

const RESPONSES = [
  '\u{1F3B1} It is certain',
  '\u{1F3B1} Without a doubt',
  '\u{1F3B1} Yes definitely',
  '\u{1F3B1} You may rely on it',
  '\u{1F3B1} Most likely',
  '\u{1F3B1} Outlook good',
  '\u{1F3B1} Signs point to yes',
  '\u{1F3B1} Reply hazy, try again',
  '\u{1F3B1} Ask again later',
  '\u{1F3B1} Better not tell you now',
  '\u{1F3B1} Cannot predict now',
  '\u{1F3B1} Concentrate and ask again',
  '\u{1F3B1} Don\'t count on it',
  '\u{1F3B1} My reply is no',
  '\u{1F3B1} My sources say no',
  '\u{1F3B1} Outlook not so good',
  '\u{1F3B1} Very doubtful',
];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms || 0;
  const idx = Math.floor(durationMs / 90000) % RESPONSES.length;

  return { text: RESPONSES[idx], style: cfg.style };
}
