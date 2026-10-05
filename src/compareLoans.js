// Comparing two loans - two offers, or one you have and one you're weighing -
// and saying plainly which costs less and why.
// No React here, so scripts/verify-compare.mjs can check the numbers and
// every sentence.
//
// "Costs less" means less INTEREST - the Finance Charge on the papers. Two
// offers can lend different amounts (a bigger down payment, say), and
// interest is what borrowing costs either way. When the amounts match it's
// the same as comparing totals.
import { explainLoan } from './loan.js'
import { duration, money } from './format.js'

// "a" / "a and b" / "a, b and c"
function joinAnd(parts) {
  if (parts.length < 2) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

// offers: two of { name, loan }, where loan is { amountCents,
// yearlyRatePercent, termMonths } and name may be blank.
//
// Returns the two offers with their numbers worked out, which one costs less
// (0, 1, or null for a tie), and the sentences the screen shows.
export function compareOffers(offers) {
  const [a, b] = offers.map((offer, index) => {
    const result = explainLoan({ ...offer.loan, extraCents: 0 })
    return {
      ...offer,
      name: offer.name.trim() || `Loan ${index === 0 ? 'A' : 'B'}`,
      payment: result.payment,
      months: result.asAgreed.months,
      interest: result.asAgreed.totalInterest,
      totalPaid: result.asAgreed.totalPaid,
    }
  })

  const amountsDiffer = a.loan.amountCents !== b.loan.amountCents
  const amountsNote = amountsDiffer
    ? 'These loans lend different amounts, so this compares the interest: what each one costs you to borrow.'
    : null

  if (a.interest === b.interest) {
    return {
      offers: [a, b],
      cheaper: null,
      headline: a.interest === 0
        ? 'Neither loan would cost you anything in interest.'
        : `Both loans would cost you ${money(a.interest)} in interest.`,
      lead: a.payment === b.payment
        ? `They’d have the same monthly payment, ${money(a.payment)}.`
        : `${a.payment < b.payment ? a.name : b.name} has the lower monthly payment: ` +
          `${money(Math.min(a.payment, b.payment))} instead of ${money(Math.max(a.payment, b.payment))}.`,
      why: null,
      trade: null,
      amountsNote,
    }
  }

  const cheaper = a.interest < b.interest ? 0 : 1
  const win = cheaper === 0 ? a : b
  const lose = cheaper === 0 ? b : a

  // Why it costs less: what's in its favor, and what isn't.
  const favor = []
  const against = []
  if (win.loan.yearlyRatePercent < lose.loan.yearlyRatePercent) favor.push('has a lower rate')
  if (win.loan.yearlyRatePercent > lose.loan.yearlyRatePercent) against.push('its rate is higher')
  if (win.months < lose.months) favor.push(`is paid off ${duration(lose.months - win.months)} sooner`)
  if (win.months > lose.months) against.push(`it takes ${duration(win.months - lose.months)} longer to pay off`)
  if (win.loan.amountCents < lose.loan.amountCents) {
    favor.push(`lends ${money(lose.loan.amountCents - win.loan.amountCents)} less`)
  }
  if (win.loan.amountCents > lose.loan.amountCents) {
    against.push(`it lends ${money(win.loan.amountCents - lose.loan.amountCents)} more`)
  }
  const why = `It ${joinAnd(favor)}${against.length ? `, even though ${joinAnd(against)}` : ''}.`

  // The trap members fall into: the cheaper loan can have the HIGHER
  // monthly payment. Say so, rather than let the lower payment win by default.
  let trade = null
  if (win.payment > lose.payment) {
    trade = `The catch: its monthly payment is ${money(win.payment - lose.payment)} higher, ` +
      `${money(win.payment)} instead of ${money(lose.payment)}. Make sure that fits your budget.`
  } else if (win.payment < lose.payment) {
    trade = `It has the lower monthly payment too: ${money(win.payment)} instead of ${money(lose.payment)}.`
  }

  return {
    offers: [a, b],
    cheaper,
    headline: `${win.name} would cost you ${money(lose.interest - win.interest)} less in interest.`,
    lead: `${money(win.interest)} in interest, compared with ${money(lose.interest)} for ${lose.name}.`,
    why,
    trade,
    amountsNote,
  }
}
