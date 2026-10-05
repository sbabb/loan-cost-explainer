// Checks every color pairing the app uses against WCAG 2.1 AA, in all three
// looks and in both light and dark. It reads the real tokens from
// src/looks.css (each block is marked "tokens: <look> <mode>"), so changing a
// color there and forgetting to check it can't slip through.
// Run with: npm run verify:contrast
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/looks.css', import.meta.url), 'utf8')

// Find each marked block and read its --name: #hex tokens.
const sets = {}
for (const [, name, body] of css.matchAll(/\/\* tokens: ([\w ]+?) \*\/[^{]*\{([^}]*)\}/g)) {
  const tokens = {}
  for (const [, token, hex] of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)) tokens[token] = hex
  sets[name] = tokens
}

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
  ['ink', 'surface', TEXT, 'text in boxes'],
  ['ink', 'accent-tint', TEXT, 'the $50 extra column'],
  ['ink-soft', 'paper', TEXT, 'hints and small print'],
  ['ink-soft', 'surface', TEXT, 'hints in cards'],
  ['accent', 'paper', TEXT, 'links and eyebrows'],
  ['accent', 'surface', TEXT, 'quiet button text'],
  ['accent', 'accent-tint', TEXT, 'the $50 extra heading, eyebrow pill'],
  ['accent-dark', 'paper', TEXT, 'link hover'],
  ['on-button', 'button', TEXT, 'main button'],
  ['on-button', 'button-hover', TEXT, 'main button hover'],
  ['error', 'paper', TEXT, 'error messages'],
  ['error', 'surface', TEXT, 'error summary links'],
  ['line-strong', 'surface', UI, 'input borders'],
  ['line-strong', 'paper', UI, 'input borders against the page'],
  ['accent', 'paper', UI, 'focus ring'],
  ['button', 'paper', UI, 'main button edge'],
  ['error', 'surface', UI, 'error borders'],
]

const expected = ['calm', 'terminal', 'modern'].flatMap((look) => [`${look} light`, `${look} dark`])
let failures = 0
for (const name of expected) {
  if (!sets[name]) {
    failures += 1
    console.error(`FAIL: no "tokens: ${name}" block in src/looks.css`)
  }
}

for (const [name, tokens] of Object.entries(sets)) {
  for (const [fg, bg, min, where] of pairs) {
    if (!tokens[fg] || !tokens[bg]) {
      failures += 1
      console.error(`FAIL ${name}, ${where}: missing --${tokens[fg] ? bg : fg}`)
      continue
    }
    const ratio = contrast(tokens[fg], tokens[bg])
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
console.log(`Contrast verified: ${pairs.length} color pairs in ${Object.keys(sets).length} looks meet WCAG 2.1 AA.`)
