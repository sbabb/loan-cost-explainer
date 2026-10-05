// Checks the loan math in src/loan.js. Run with: npm run verify:loan
// Exits with an error if anything is wrong, so nothing ships with bad math.
import { monthlyPayment, explainLoan } from '../src/loan.js'

let failures = 0
function check(label, actual, expected) {
  if (actual === expected) return
  failures += 1
  console.error(`FAIL ${label}: got ${actual}, expected ${expected}`)
}
function checkTrue(label, ok) {
  if (ok) return
  failures += 1
  console.error(`FAIL ${label}`)
}

// 1. Monthly payments against published figures (any bank calculator).
check('$10,000 at 6% for 5 years', monthlyPayment(1000000, 6, 60), 19333)
check('$100,000 at 6% for 30 years', monthlyPayment(10000000, 6, 360), 59955)
check('$200,000 at 6.5% for 30 years', monthlyPayment(20000000, 6.5, 360), 126414)
check('$1,200 at 0% for 12 months', monthlyPayment(120000, 0, 12), 10000)

// 2. A full worked example: $10,000 at 6% for 60 months.
// Total interest worked out by hand: 59 x $193.33 plus the final payment.
const example = explainLoan({ amountCents: 1000000, yearlyRatePercent: 6, termMonths: 60, extraCents: 5000 })
check('example: payoff months', example.asAgreed.months, 60)
// $10,000 x 6% / 12 = $50.00 of the first payment is interest.
check('example: first payment interest', example.firstInterest, 5000)
check('example: total paid = amount + interest',
  example.asAgreed.totalPaid, 1000000 + example.asAgreed.totalInterest)
checkTrue('example: total interest near $1,599.68 (formula, before rounding)',
  Math.abs(example.asAgreed.totalInterest - 159968) <= 60)
checkTrue('example: extra $50 pays off sooner', example.withExtra.months < 60)
checkTrue('example: extra $50 saves interest', example.interestSaved > 0)

// 3. The loan on the design canvases, to the cent: $25,000 at 6.49% for 60
// months. If any of these change, the screens' worked example is wrong too.
const member = explainLoan({ amountCents: 2500000, yearlyRatePercent: 6.49, termMonths: 60, extraCents: 5000 })
check('member: payment', member.payment, 48904)
check('member: final payment', member.asAgreed.lastPayment, 48882)
check('member: interest', member.asAgreed.totalInterest, 434218)
check('member: first payment interest', member.firstInterest, 13521)
check('member: with $50, payments', member.withExtra.months, 54)
check('member: with $50, interest', member.withExtra.totalInterest, 386149)
check('member: with $50, saved', member.interestSaved, 48069)
check('member: month 1 split', JSON.stringify(member.asAgreed.schedule[0]),
  JSON.stringify({ payment: 48904, interest: 13521, toLoan: 35383, balance: 2464617 }))

// 4. The rules every loan must follow, tried on 5,000 random loans.
// A simple repeatable random generator, so a failure can be reproduced.
let seed = 42
function random() {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}

for (let i = 0; i < 5000; i += 1) {
  const loan = {
    amountCents: Math.round(50000 + random() * 50000000), // $500 to $500,500
    yearlyRatePercent: Math.round(random() * 2500) / 100, // 0% to 25%
    termMonths: 1 + Math.floor(random() * 360), // 1 month to 30 years
    extraCents: Math.round(random() * 50000), // $0 to $500 extra
  }
  const name = JSON.stringify(loan)
  const result = explainLoan(loan)
  const { asAgreed, withExtra } = result

  // Every cent borrowed is paid back, plus the interest.
  check(`${name} total`, asAgreed.totalPaid, loan.amountCents + asAgreed.totalInterest)
  // Rounding to the cent (the payment, and each month's interest) leaves up to
  // a cent a month over or under, and that grows with interest until the end.
  // This is the most the final payment and total interest can honestly drift.
  const r = loan.yearlyRatePercent / 100 / 12
  const roundingLimit = r === 0 ? loan.termMonths
    : ((1 + r) ** loan.termMonths - 1) / r + 1
  // Paid off in the agreed term. The one exception: a tiny loan over a very
  // long term, where the rounded-up cents grow into a whole payment and it
  // finishes a month or two early. Never late.
  const earliest = loan.termMonths - Math.ceil(roundingLimit / result.payment)
  checkTrue(`${name} months ${asAgreed.months}`,
    asAgreed.months <= loan.termMonths && asAgreed.months >= earliest)
  if (roundingLimit < result.payment) check(`${name} months`, asAgreed.months, loan.termMonths)
  // The final payment only settles that rounding.
  checkTrue(`${name} final payment off by more than rounding`,
    Math.abs(asAgreed.lastPayment - result.payment) <= roundingLimit)
  // Independent check: interest from the textbook formula, no month-by-month walk.
  const exact = r === 0 ? loan.amountCents / loan.termMonths
    : (loan.amountCents * r) / (1 - (1 + r) ** -loan.termMonths)
  const formulaInterest = exact * loan.termMonths - loan.amountCents
  checkTrue(`${name} interest ${asAgreed.totalInterest} vs formula ${formulaInterest.toFixed(0)}`,
    Math.abs(asAgreed.totalInterest - formulaInterest) <= roundingLimit)
  // Paying extra never costs more or takes longer.
  checkTrue(`${name} extra takes longer`, withExtra.months <= asAgreed.months)
  checkTrue(`${name} extra costs more`, withExtra.totalInterest <= asAgreed.totalInterest)
  // The month-by-month schedule adds up to the totals, exactly.
  const rows = asAgreed.schedule
  check(`${name} schedule length`, rows.length, asAgreed.months)
  check(`${name} schedule interest`, rows.reduce((sum, row) => sum + row.interest, 0), asAgreed.totalInterest)
  check(`${name} schedule pays the loan`, rows.reduce((sum, row) => sum + row.toLoan, 0), loan.amountCents)
  check(`${name} schedule ends at zero`, rows[rows.length - 1].balance, 0)
  // No interest means nothing to save.
  if (loan.yearlyRatePercent === 0) check(`${name} 0% interest`, asAgreed.totalInterest, 0)
}

if (failures > 0) {
  console.error(`\n${failures} loan math check(s) failed.`)
  process.exit(1)
}
console.log('Loan math verified: published figures, worked example, 5,000 random loans.')
