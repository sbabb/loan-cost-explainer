// Checks the loan comparison (src/compareLoans.js): which offer costs less,
// by how much, and every sentence that says so. Run with: npm run verify:compare
import { compareOffers } from '../src/compareLoans.js'
import { explainLoan } from '../src/loan.js'

let failures = 0
function check(label, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) return
  failures += 1
  console.error(`FAIL ${label}:\n  got      ${a}\n  expected ${e}`)
}

const loan = (amountCents, yearlyRatePercent, termMonths) => ({ amountCents, yearlyRatePercent, termMonths })

// 1. The trap: the dealer's lower rate AND lower payment cost more overall.
// Credit union: 6.49% for 60 months, $489.04 a month, $4,342.18 interest.
// Dealer:       5.99% for 72 months, $414.20 a month, $4,822.82 interest.
const trap = compareOffers([
  { name: 'Credit union', loan: loan(2500000, 6.49, 60) },
  { name: 'Dealer', loan: loan(2500000, 5.99, 72) },
])
check('trap: cheaper', trap.cheaper, 0)
check('trap: headline', trap.headline, 'Credit union would cost you $480.64 less in interest.')
check('trap: lead', trap.lead, '$4,342.18 in interest, compared with $4,822.82 for Dealer.')
check('trap: why', trap.why, 'It is paid off 1 year sooner, even though its rate is higher.')
check('trap: catch', trap.trade,
  'The catch: its monthly payment is $74.84 higher, $489.04 instead of $414.20. Make sure that fits your budget.')
check('trap: same amounts, no note', trap.amountsNote, null)

// 2. A plain win: lower rate, same length. Order doesn't matter.
const plain = compareOffers([
  { name: '', loan: loan(2500000, 6.49, 60) },
  { name: '', loan: loan(2500000, 5.49, 60) },
])
check('plain: blank names become letters', plain.offers.map((o) => o.name), ['Loan A', 'Loan B'])
check('plain: cheaper', plain.cheaper, 1)
check('plain: headline', plain.headline, 'Loan B would cost you $697.31 less in interest.')
check('plain: why', plain.why, 'It has a lower rate.')
check('plain: payment too', plain.trade, 'It has the lower monthly payment too: $477.41 instead of $489.04.')

// 3. Different amounts get the note, and the difference is part of "why".
const amounts = compareOffers([
  { name: 'Bigger down payment', loan: loan(2000000, 6.49, 60) },
  { name: 'Smaller down payment', loan: loan(2500000, 6.49, 60) },
])
check('amounts: note', amounts.amountsNote,
  'These loans lend different amounts, so this compares the interest: what each one costs you to borrow.')
check('amounts: why', amounts.why, 'It lends $5,000 less.')

// 4. A tie.
const tie = compareOffers([
  { name: 'One', loan: loan(2500000, 6.49, 60) },
  { name: 'Two', loan: loan(2500000, 6.49, 60) },
])
check('tie: no winner', tie.cheaper, null)
check('tie: headline', tie.headline, 'Both loans would cost you $4,342.18 in interest.')
check('tie: lead', tie.lead, 'They’d have the same monthly payment, $489.04.')
check('both 0%', compareOffers([
  { name: '', loan: loan(120000, 0, 12) },
  { name: '', loan: loan(120000, 0, 24) },
]).headline, 'Neither loan would cost you anything in interest.')

// 5. The numbers are the same ones the single-loan explanation uses.
for (const [index, offer] of trap.offers.entries()) {
  const alone = explainLoan({ ...offer.loan, extraCents: 0 })
  check(`offer ${index}: interest matches explainLoan`, offer.interest, alone.asAgreed.totalInterest)
  check(`offer ${index}: payment matches explainLoan`, offer.payment, alone.payment)
}

if (failures > 0) {
  console.error(`\n${failures} comparison check(s) failed.`)
  process.exit(1)
}
console.log('Comparison verified: which costs less, by how much, and why.')
