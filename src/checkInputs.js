// Turns what someone typed into numbers the loan math can use - or says, in
// plain words, what needs fixing. No React here, so the verify script can
// check every message (scripts/verify-inputs.mjs).
import { addMonths, MONTHS } from './format.js'

export const MAX_AMOUNT_CENTS = 500000000 // $5,000,000
export const MAX_RATE = 40
export const MAX_MONTHS = 480 // 40 years
export const EARLIEST_YEAR = 1980

// "25,000", "$25,000.50", " 25000 " -> whole cents. null if it isn't money.
// Done with text, not decimals, so 0.29 can never turn into 28.999 cents.
export function parseMoney(text) {
  const clean = text.replace(/[$,\s]/g, '')
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(clean)
  if (!match) return null
  const [, whole, fraction = ''] = match
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

// "6.49", "6.49%", ".5" -> 6.49. null if it isn't a number.
export function parseRate(text) {
  const clean = text.replace(/[%\s]/g, '')
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(clean)) return null
  return Number(clean)
}

// "60" -> 60. null unless it's a whole number.
export function parseWhole(text) {
  const clean = text.trim()
  return /^\d+$/.test(clean) ? Number(clean) : null
}

// values: what's in the boxes, all text: { amount, rate, term, month, year }.
//   month is '' or '0'-'11' (the dropdown); month/year only matter if hasIt.
// hasIt: they already have this loan (true) or are still deciding (false).
// shortTermOk: a term under 12 they've already been asked about and kept.
// today: a Date, for the year check.
//
// Returns { errors, termCheck, loan }:
//   errors: field name -> message, only for fields with a problem
//   termCheck: { typed, asMonths } when a short term looks like years
//   loan: the numbers for explainLoan(), or null if anything needs fixing
export function checkInputs(values, { hasIt, shortTermOk = null, today }) {
  const errors = {}
  let termCheck = null

  const amount = parseMoney(values.amount)
  if (values.amount.trim() === '') {
    errors.amount = hasIt
      ? 'Enter how much you borrowed, like 25,000.'
      : 'Enter how much you want to borrow, like 25,000.'
  } else if (amount === null) {
    errors.amount = 'Enter the amount as a number, like 25,000.'
  } else if (amount === 0) {
    errors.amount = 'Enter an amount more than $0.'
  } else if (amount > MAX_AMOUNT_CENTS) {
    errors.amount = 'Enter an amount up to $5,000,000.'
  }

  const rate = parseRate(values.rate)
  if (values.rate.trim() === '') {
    errors.rate = 'Enter the interest rate (APR), like 6.49.'
  } else if (rate === null) {
    errors.rate = 'Enter the rate as a number, like 6.49.'
  } else if (rate > MAX_RATE) {
    errors.rate = `Enter a rate of ${MAX_RATE}% or less.`
  }

  const term = parseWhole(values.term)
  if (values.term.trim() === '') {
    errors.term = hasIt
      ? 'Enter the number of payments, like 60.'
      : 'Enter the loan length in months, like 60.'
  } else if (term === null) {
    errors.term = 'Enter a whole number, like 60.'
  } else if (term === 0) {
    errors.term = 'Enter 1 or more.'
  } else if (term > MAX_MONTHS) {
    errors.term = `Enter ${MAX_MONTHS} or fewer. That’s 40 years.`
  } else if (term < 12 && term !== shortTermOk) {
    // Probably years typed as months. Not an error - short loans exist - so
    // it stops them once, and the same number again carries on.
    termCheck = { typed: term, asMonths: term * 12 }
  }

  let firstPayment = null
  if (hasIt) {
    const year = parseWhole(values.year)
    const thisYear = today.getFullYear()
    if (values.month === '') {
      errors.month = 'Choose the month of your first payment.'
    }
    if (values.year.trim() === '') {
      errors.year = 'Enter the year of your first payment, like 2024.'
    } else if (year === null || values.year.trim().length !== 4) {
      errors.year = 'Enter the year as 4 numbers, like 2024.'
    } else if (year < EARLIEST_YEAR || year > thisYear + 1) {
      errors.year = `Enter a year between ${EARLIEST_YEAR} and ${thisYear + 1}.`
    }
    if (!errors.month && !errors.year) {
      firstPayment = { month: Number(values.month), year }
    }
  }

  // A loan whose last payment is already behind them is almost certainly a
  // typo in the date or the number of payments. Say so instead of
  // explaining a loan that's finished.
  if (firstPayment && term && !errors.term && !termCheck) {
    const last = addMonths(firstPayment, term - 1)
    const now = { month: today.getMonth(), year: today.getFullYear() }
    if (last.year * 12 + last.month < now.year * 12 + now.month) {
      errors.year = `With ${term} payments starting in ${MONTHS[firstPayment.month]} ${firstPayment.year}, ` +
        'this loan would already be paid off. Check the date and the number of payments.'
    }
  }

  const ok = Object.keys(errors).length === 0 && !termCheck
  return {
    errors,
    termCheck,
    loan: ok ? { amountCents: amount, yearlyRatePercent: rate, termMonths: term, firstPayment } : null,
  }
}
