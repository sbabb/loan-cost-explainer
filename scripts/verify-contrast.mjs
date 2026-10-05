// Checks every color pairing the app uses against WCAG 2.1 AA, in light and
// dark. It reads the real tokens from src/tokens.css (each block is marked
// "tokens: light" / "tokens: dark"), so changing a color there and
// forgetting to check it can't slip through. Run with: npm run verify:contrast
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8')

// Find each marked block and read its --name: #hex tokens.
const sets = {}
for (const [, name, body] of css.matchAll(/\/\* tokens: ([\w ]+?) \*\/[^{]*\{([^}]*)\}/g)) {
  const tokens = {}
  for (const [, token, hex] of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)) tokens[token] = hex
  sets[name] = tokens
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const hex = (channels) => `#${channels.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

// `amount` of `top` laid over `base` - how a see-through glow or a
// color-mix() actually lands on screen.
function mix(base, top, amount) {
  const [b, t] = [rgb(base), rgb(top)]
  return hex(b.map((c, i) => c * (1 - amount) + t[i] * amount))
}

// The WCAG formula: how bright a color looks, then the ratio between two.
function luminance(color) {
  const [r, g, b] = rgb(color).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Backgrounds that aren't a single token: worked out from the CSS.
function derived(t) {
  return {
    // The top of the main button: color-mix(button 86%, white).
    'button-top': mix(t.button, '#ffffff', 0.14),
    // The answer card where its indigo glow is strongest (38% of #6366f1).
    'hero-glow': mix(t.hero, '#6366f1', 0.38),
  }
}

// [foreground, background, minimum, where it's used]
const TEXT = 4.5
const UI = 3
const pairs = [
  ['ink', 'paper', TEXT, 'main text'],
  ['ink', 'surface', TEXT, 'text in cards'],
  ['ink-soft', 'paper', TEXT, 'hints, stat labels'],
  ['ink-soft', 'surface', TEXT, 'hints in cards'],
  ['ink-soft', 'line-soft', TEXT, 'unchosen Months/Years'],
  ['ink', 'accent-tint', TEXT, 'the $50 extra column, the catch'],
  ['accent', 'paper', TEXT, 'eyebrows, links'],
  ['accent', 'surface', TEXT, 'button text on hover'],
  ['accent', 'accent-tint', TEXT, 'pills, offer letters, choice icons'],
  ['accent-dark', 'paper', TEXT, 'link hover'],
  ['on-button', 'button', TEXT, 'main button'],
  ['on-button', 'button-top', TEXT, 'main button, lighter top'],
  ['on-button', 'button-hover', TEXT, 'main button hover'],
  ['error', 'paper', TEXT, 'error messages'],
  ['error', 'surface', TEXT, 'error messages in cards'],
  ['error', 'error-tint', TEXT, 'error list links'],
  ['ink', 'error-tint', TEXT, 'the years check'],
  ['hero-ink', 'hero', TEXT, 'the answer'],
  ['hero-ink', 'hero-glow', TEXT, 'the answer, in the glow'],
  ['hero-soft', 'hero', TEXT, 'the answer, small text'],
  ['hero-soft', 'hero-glow', TEXT, 'the answer, small text in the glow'],
  ['hero-accent', 'hero', TEXT, 'the answer, eyebrow'],
  ['hero-accent', 'hero-glow', TEXT, 'the answer, eyebrow in the glow'],
  ['line-strong', 'surface', UI, 'input borders'],
  ['line-strong', 'paper', UI, 'input borders against the page'],
  ['accent', 'paper', UI, 'focus ring'],
  ['accent', 'surface', UI, 'focused input border'],
  ['error', 'surface', UI, 'error borders'],
  ['chart-interest', 'surface', UI, 'interest bars'],
  ['hero-chart-interest', 'hero', UI, 'interest bars on the answer'],
]

let failures = 0
for (const name of ['light', 'dark']) {
  if (!sets[name]) {
    failures += 1
    console.error(`FAIL: no "tokens: ${name}" block in src/tokens.css`)
  }
}

for (const [name, tokens] of Object.entries(sets)) {
  const all = { ...tokens, ...derived(tokens) }
  for (const [fg, bg, min, where] of pairs) {
    if (!all[fg] || !all[bg]) {
      failures += 1
      console.error(`FAIL ${name}, ${where}: missing --${all[fg] ? bg : fg}`)
      continue
    }
    const ratio = contrast(all[fg], all[bg])
    if (ratio < min) {
      failures += 1
      console.error(`FAIL ${name}, ${where}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`)
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} contrast check(s) failed.`)
  process.exit(1)
}
console.log(`Contrast verified: ${pairs.length} color pairs, light and dark, meet WCAG 2.1 AA.`)
