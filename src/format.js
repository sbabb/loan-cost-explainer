// Turning numbers into the words people read. No React here, so the verify
// script can check it (scripts/verify-inputs.mjs).

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// 434218 -> "$4,342.18". Whole dollars drop the ".00": 2500000 -> "$25,000".
export function money(cents) {
  const text = dollars.format(cents / 100)
  return text.endsWith('.00') ? text.slice(0, -3) : text
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// A month is { month: 0-11, year: 2031 }, so date math never touches days
// or time zones - loans are paid by the month.
export function monthYear({ month, year }) {
  return `${MONTHS[month]} ${year}`
}

// "Oct 2031" - for the table, where space is tight.
export function shortMonthYear({ month, year }) {
  return `${MONTHS[month].slice(0, 3)} ${year}`
}

// The month `count` months after `start`. Payment 60 of a loan that starts
// in November 2026 is addMonths(start, 59): October 2031.
export function addMonths(start, count) {
  const total = start.month + count
  return { month: ((total % 12) + 12) % 12, year: start.year + Math.floor(total / 12) }
}

// The month after today's date - when a new loan's first payment usually falls.
export function nextMonth(today) {
  return addMonths({ month: today.getMonth(), year: today.getFullYear() }, 1)
}

// 60 -> "5 years", 18 -> "1 year and 6 months", 8 -> "8 months".
export function duration(months) {
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years) parts.push(years === 1 ? '1 year' : `${years} years`)
  if (rest) parts.push(rest === 1 ? '1 month' : `${rest} months`)
  return parts.join(' and ')
}
