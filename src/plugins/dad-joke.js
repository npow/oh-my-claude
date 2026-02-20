// src/plugins/dad-joke.js — Rotating developer dad jokes
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'dad-joke',
  description: 'Shows a rotating developer dad joke',
  requires: [],
  defaultConfig: {
    style: 'dim italic',
  },
};

const JOKES = [
  'Why do programmers prefer dark mode? Light attracts bugs.',
  'There are 10 types of people: those who get binary and those who don\'t.',
  'A SQL query walks into a bar, sees two tables, and asks: can I JOIN you?',
  'Why was the JavaScript dev sad? He didn\'t Node how to Express himself.',
  '!false — it\'s funny because it\'s true.',
  'How many programmers does it take to change a light bulb? None, that\'s a hardware problem.',
  'Why do Java devs wear glasses? They can\'t C#.',
  'A stack overflow just means you\'re recursively ambitious.',
  'My code works, I have no idea why. My code doesn\'t work, I have no idea why.',
  'git commit -m "fixed it" — narrator: he had not fixed it.',
  'I told my wife I\'m a programmer. She said: "Do you have any bugs?" I said: "Only features."',
  'There\'s no place like 127.0.0.1.',
  'Debugging: being the detective in a crime movie where you are also the murderer.',
  'It works on my machine. Then we\'ll ship your machine.',
  'I\'d tell you a UDP joke, but you might not get it.',
];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms || 0;
  const idx = Math.floor(durationMs / 120000) % JOKES.length;

  return { text: JOKES[idx], style: cfg.style };
}
