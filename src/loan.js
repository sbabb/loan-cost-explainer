// The loan math. No React here - just numbers in, numbers out - so the
// verify script can check it on its own (scripts/verify-loan.mjs).
//
// All money is in whole cents (1000000 = $10,000.00). Adding up dollar
// decimals in JavaScript drifts (0.1 + 0.2 = 0.30000000000000004); whole
// cents never do, and they round the way a real loan statement does.
//
// Interest is charged monthly: each month's interest is the balance times
// the yearly rate / 12. That is how a Truth in Lending disclosure works it
// out. Many credit unions charge interest daily instead, so a real payoff
// can differ by a few dollars - the wording has to be honest about that.

// The regular monthly payment that pays the loan off in exactly `months`.
// Standard amortization formula, rounded to the nearest cent.
export function monthlyPayment(amountCents, yearlyRatePercent, months) {
  const monthlyRate = yearlyRatePercent / 100 / 12
  if (monthlyRate === 0) return Math.ceil(amountCents / months)
  const payment = (amountCents * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
  return Math.round(payment)
}

// Walks the loan month by month until it is paid off.
// Because the payment is rounded to the cent, a few cents are left over (or
// overpaid) by the end - the final payment settles that, like a real loan.
// `termMonths` is the original term: that month is always the last one.
function payOff(amountCents, yearlyRatePercent, termMonths, paymentCents) {
  const monthlyRate = yearlyRatePercent / 100 / 12
  let balance = amountCents
  let months = 0
  let totalInterest = 0
  let lastPayment = 0

  while (balance > 0) {
    months += 1
    const interest = Math.round(balance * monthlyRate)
    const owed = balance + interest
    const isLastMonth = months === termMonths || owed <= paymentCents
    const payment = isLastMonth ? owed : paymentCents

    totalInterest += interest
    balance = owed - payment
    lastPayment = payment
  }

  return { months, totalInterest, totalPaid: amountCents + totalInterest, lastPayment }
}

// Everything the explanation needs for one loan.
// extraCents: what paying a little more each month does (e.g. 5000 = $50).
export function explainLoan({ amountCents, yearlyRatePercent, termMonths, extraCents = 0 }) {
  const payment = monthlyPayment(amountCents, yearlyRatePercent, termMonths)
  const asAgreed = payOff(amountCents, yearlyRatePercent, termMonths, payment)
  const withExtra = payOff(amountCents, yearlyRatePercent, termMonths, payment + extraCents)

  return {
    payment,
    asAgreed,
    withExtra,
    monthsSaved: asAgreed.months - withExtra.months,
    interestSaved: asAgreed.totalInterest - withExtra.totalInterest,
  }
}
