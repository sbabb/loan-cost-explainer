import { money } from './format.js'

const exact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// A big money figure set the way finance apps set it: dollars large, cents
// small and raised. While it counts up (`cents` still climbing toward
// `final`) it always shows cents, so the width doesn't jump.
export function HeroAmount({ cents, final }) {
  const text = cents === final ? money(final) : exact.format(cents / 100)
  const [, whole, fraction = ''] = /^(.*?)(\.\d+)?$/.exec(text)
  return (
    <>
      {whole}
      {fraction && <span className="cents">{fraction}</span>}
    </>
  )
}

// The money pictures. One idea everywhere: a bar that is what you borrowed
// (quiet grey) plus the interest on top (indigo). Interest is the story, so
// it gets the color; the rest is context.
//
// The bars are decoration for sighted readers - every value is written as
// text next to them, and there's a table too - so they're hidden from screen
// readers rather than described twice.

// One bar. `max` puts several bars on the same scale (a shorter bar really
// is less money); without it the bar fills the width.
export function CostBar({ borrowed, interest, max }) {
  const total = borrowed + interest
  const scale = max ?? total
  return (
    <div className="cost-bar" aria-hidden="true" style={{ width: `${(total / scale) * 100}%` }}>
      <span className="seg" style={{ flexGrow: borrowed }} />
      {interest > 0 && <span className="seg seg-interest" style={{ flexGrow: interest }} />}
    </div>
  )
}

// The key under a bar: a swatch, what it is, and the amount.
// items: [{ label, value, interest?: true, total?: true }]
export function Legend({ items }) {
  return (
    <ul className="legend">
      {items.map((item) => (
        <li key={item.label} className={item.total ? 'total' : undefined}>
          <span
            className={`swatch${item.interest ? ' swatch-interest' : ''}${item.total ? ' swatch-none' : ''}`}
            aria-hidden="true"
          />
          <span>{item.label}</span>
          <span className="value">{item.value}</span>
        </li>
      ))}
    </ul>
  )
}

// Several bars on one scale, each with its name and interest written above.
// rows: [{ name, borrowed, interest, pill?, detail? }]
export function CostRows({ rows }) {
  const max = Math.max(...rows.map((row) => row.borrowed + row.interest))
  return (
    <ul className="cost-rows">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="cost-row-head">
            <span className="cost-row-name">
              {row.name}
              {row.pill && <span className="pill">{row.pill}</span>}
            </span>
            <span className="cost-row-value">{money(row.interest)} interest</span>
          </div>
          <CostBar borrowed={row.borrowed} interest={row.interest} max={max} />
        </li>
      ))}
    </ul>
  )
}
