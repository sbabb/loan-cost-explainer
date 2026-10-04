// Checks every color pairing the app uses against WCAG 2.1 AA. It reads the
// real tokens from src/index.css, so changing a color there and forgetting to
// check it can't slip through. Run with: npm run verify:contrast
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const tokens = {}
for (const [, name, hex] of css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) tokens[name] = hex

// The WCAG formula: how bright a color looks, then the ratio between two.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, minimum, where it's used]
const TEXT = 4.5
const UI = 3
const pairs = [
  ['ink', 'paper', TEXT, 'main text'],
  ['ink', 'white', TEXT, 'text in boxes'],
  ['ink', 'accent-tint', TEXT, 'the $50 extra column'],
  ['ink-soft', 'paper', TEXT, 'hints and small print'],
  ['ink-soft', 'white', TEXT, 'hints in cards'],
  ['accent', 'paper', TEXT, 'links and eyebrows'],
  ['accent', 'white', TEXT, 'quiet button text'],
  ['accent', 'accent-tint', TEXT, 'the $50 extra heading'],
  ['accent-dark', 'paper', TEXT, 'link hover'],
  ['white', 'accent', TEXT, 'main button'],
  ['white', 'accent-dark', TEXT, 'main button hover'],
  ['error', 'paper', TEXT, 'error messages'],
  ['error', 'white', TEXT, 'error summary links'],
  ['line-strong', 'white', UI, 'input borders'],
  ['line-strong', 'paper', UI, 'input borders against the page'],
  ['accent', 'paper', UI, 'focus ring'],
  ['error', 'white', UI, 'error borders'],
]

let failures = 0
for (const [fg, bg, min, where] of pairs) {
  if (!tokens[fg] || !tokens[bg]) {
    failures += 1
    console.error(`FAIL ${where}: missing token --${tokens[fg] ? bg : fg}`)
    continue
  }
  const ratio = contrast(tokens[fg], tokens[bg])
  if (ratio < min) {
    failures += 1
    console.error(`FAIL ${where}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`)
  }
}

if (failures > 0) {
  console.error(`\n${failures} contrast check(s) failed.`)
  process.exit(1)
}
console.log(`Contrast verified: ${pairs.length} color pairs meet WCAG 2.1 AA.`)
