import { useState } from 'react'
import { addMonths, money, monthYear, shortMonthYear } from './format.js'
import { Legend } from './Charts.jsx'

// The payment timeline: every payment of the loan, left to right. Each one
// splits into what pays down the loan (grey, below) and interest (indigo, on
// top). Interest shrinks month by month because you owe less each time -
// the one idea about loans people most often haven't seen.
//
// Drag across it (or tap) to see any payment; on a keyboard it's a slider:
// arrow keys move a month, Page Up / Page Down a year, Home / End the ends.
// A screen reader hears the same thing the readout shows, as the slider's
// value. The drawing itself is hidden from screen readers.
//
// schedule: explainLoan()'s month-by-month rows. first: the first payment's
// month, for dates.
export default function Timeline({ schedule, first }) {
  const [index, setIndex] = useState(0)
  const count = schedule.length
  const tallest = Math.max(...schedule.map((row) => row.payment))

  // Drawn in a 100 x 100 box stretched to fit; x and y are percentages.
  const x = (i) => (count === 1 ? 0 : (i / (count - 1)) * 100)
  const y = (cents) => 100 - (cents / tallest) * 100
  const loanTop = schedule.map((row, i) => `${x(i)},${y(row.toLoan)}`)
  const paymentTop = schedule.map((row, i) => `${x(i)},${y(row.payment)}`)
  const loanArea = `M0,100 L${loanTop.join(' L')} L100,100 Z`
  const interestArea = `M${paymentTop.join(' L')} L${[...loanTop].reverse().join(' L')} Z`

  const row = schedule[index]
  const when = addMonths(first, index)
  const valueText = `Payment ${index + 1} of ${count}, ${monthYear(when)}: ${money(row.interest)} interest, ` +
    `${money(row.toLoan)} pays down the loan.`

  function pickAt(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    setIndex(Math.round(ratio * (count - 1)))
  }

  function handleKey(event) {
    const moves = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 12, PageDown: -12 }
    let next = null
    if (event.key in moves) next = index + moves[event.key]
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = count - 1
    if (next === null) return
    event.preventDefault()
    setIndex(Math.min(count - 1, Math.max(0, next)))
  }

  return (
    <div className="timeline">
      <div className="timeline-readout" aria-hidden="true">
        <span className="timeline-when">Payment {index + 1} · {shortMonthYear(when)}</span>
        <span className="timeline-split">
          <span><strong>{money(row.interest)}</strong> interest</span>
          <span><strong>{money(row.toLoan)}</strong> to the loan</span>
        </span>
      </div>

      <div
        className="timeline-plot"
        role="slider"
        tabIndex={0}
        aria-label="Payment timeline"
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={index + 1}
        aria-valuetext={valueText}
        onKeyDown={handleKey}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          pickAt(event)
        }}
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse' || event.buttons) pickAt(event)
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={loanArea} className="area-loan" />
          <path d={interestArea} className="area-interest" />
          <polyline points={loanTop.join(' ')} className="line-split" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="crosshair" style={{ left: `${x(index)}%` }} />
        <span className="dot" style={{ left: `${x(index)}%`, top: `${y(row.toLoan)}%` }} />
      </div>

      <div className="timeline-axis" aria-hidden="true">
        <span>{shortMonthYear(first)}</span>
        <span>{shortMonthYear(addMonths(first, count - 1))}</span>
      </div>

      <Legend
        items={[
          { label: 'Interest', interest: true },
          { label: 'Pays down the loan' },
        ]}
      />
    </div>
  )
}
