import { explainLoan } from './loan.js'
import { addMonths, duration, money, monthYear, nextMonth, shortMonthYear } from './format.js'
import { BackIcon } from './Icons.jsx'

export const EXTRA_CENTS = 5000 // the "$50 more a month"

// Screen 3: the explanation. Every number comes from explainLoan(), which
// scripts/verify-loan.mjs checks; this file only puts them into words.
//
// hasIt picks the wording: "you'll pay" for a loan they have, "you'd pay"
// for one they're still deciding on. `say(mine, would)` keeps each pair of
// sentences side by side so they can't drift apart.
export default function Results({ loan, hasIt, today, onChangeNumbers, onStartOver, onCompare }) {
  const say = (mine, would) => (hasIt ? mine : would)

  const result = explainLoan({ ...loan, extraCents: EXTRA_CENTS })
  const { payment, firstInterest, asAgreed, withExtra, monthsSaved, interestSaved } = result
  const borrowed = loan.amountCents
  const interest = asAgreed.totalInterest
  const count = asAgreed.months

  // For a loan still being decided on, assume the first payment is next month.
  const first = loan.firstPayment ?? nextMonth(today)
  const lastDue = addMonths(first, count - 1)
  const lastDueWithExtra = addMonths(first, withExtra.months - 1)

  // "about $1.17 for every $1 you borrowed"
  const perDollar = money(Math.round((asAgreed.totalPaid * 100) / borrowed))
  // What's left of the first payment after interest goes to the loan itself.
  const firstPayment = count === 1 ? asAgreed.lastPayment : payment
  const firstToLoan = firstPayment - firstInterest

  return (
    <main>
      <button type="button" className="back" onClick={onChangeNumbers}>
        <BackIcon />
        <span>Change the numbers</span>
      </button>

      <header className="screen-head">
        <p className="eyebrow">{say('Your loan, explained', 'The loan you’re considering, explained')}</p>
        <h1 tabIndex={-1}>
          {interest > 0
            ? say(`This loan will cost you ${money(interest)} in interest.`,
              `This loan would cost you ${money(interest)} in interest.`)
            : say('This loan won’t cost you anything in interest.',
              'This loan wouldn’t cost you anything in interest.')}
        </h1>
        <p className="lead">
          {interest > 0
            ? say(`That’s on top of the ${money(borrowed)} you borrowed. Altogether you’ll pay back ` +
                `${money(asAgreed.totalPaid)}, about ${perDollar} for every $1 you borrowed.`,
              `That’s on top of the ${money(borrowed)} you’d borrow. Altogether you’d pay back ` +
                `${money(asAgreed.totalPaid)}, about ${perDollar} for every $1 borrowed.`)
            : say(`You’ll pay back exactly the ${money(borrowed)} you borrowed.`,
              `You’d pay back exactly the ${money(borrowed)} you’d borrow.`)}
        </p>
      </header>

      <section className="section" aria-labelledby="payments">
        <h2 id="payments">Your payments</h2>
        <p>
          {count === 1
            ? say(`You’ll make one payment of ${money(asAgreed.lastPayment)}.`,
              `You’d make one payment of ${money(asAgreed.lastPayment)}.`)
            : asAgreed.lastPayment === payment
              ? say(`You’ll make ${count} monthly payments of ${money(payment)}.`,
                `You’d make ${count} monthly payments of ${money(payment)}.`)
              : say(`You’ll make ${count} monthly payments. Each is ${money(payment)}, except the last, ` +
                  `which is ${money(asAgreed.lastPayment)} to even out the rounding.`,
                `You’d make ${count} monthly payments. Each would be ${money(payment)}, except the last, ` +
                  `which would be ${money(asAgreed.lastPayment)} to even out the rounding.`)}
        </p>
        <p>
          {say(<>Your last payment is due in <strong>{monthYear(lastDue)}</strong>.</>,
            <>If your first payment is in {monthYear(first)}, your last would be due
              in <strong>{monthYear(lastDue)}</strong>.</>)}
        </p>
      </section>

      <section className="section" aria-labelledby="first">
        <h2 id="first">{say('Where your first payment goes', 'Where your first payment would go')}</h2>
        {firstInterest > 0 ? (
          <>
            <p>
              {say(<>Of your first {money(firstPayment)}, <strong>{money(firstInterest)} pays interest</strong> and{' '}
                {money(firstToLoan)} pays down what you owe.</>,
              <>Of your first {money(firstPayment)}, <strong>{money(firstInterest)} would pay interest</strong> and{' '}
                {money(firstToLoan)} would pay down what you owe.</>)}
            </p>
            {count > 1 && (
              <p>
                Every month after that, a little less goes to interest and a little more goes to the loan,
                because you owe less each time.
              </p>
            )}
          </>
        ) : (
          <p>
            {say('All of every payment goes to paying down what you owe, because there’s no interest.',
              'All of every payment would go to paying down what you owe, because there’s no interest.')}
          </p>
        )}
      </section>

      {hasIt && (
        <section className="section" aria-labelledby="papers">
          <h2 id="papers">Match it to your loan papers</h2>
          <p>Your Truth in Lending Disclosure uses different names for the same numbers.</p>
          <dl className="papers">
            <PaperRow name="What you borrowed" value={money(borrowed)} paperName="Amount Financed" />
            <PaperRow name="Interest" value={money(interest)} paperName="Finance Charge" />
            <PaperRow name="Total you’ll pay" value={money(asAgreed.totalPaid)} paperName="Total of Payments" />
            <PaperRow name="Interest rate" value={`${loan.yearlyRatePercent}%`} paperName="Annual Percentage Rate" />
          </dl>
        </section>
      )}

      <section className="extra" aria-labelledby="extra">
        <h2 id="extra">What if you paid $50 more a month?</h2>
        <p>{extraSummary(monthsSaved, interestSaved)}</p>
        <table>
          <caption className="visually-hidden">Paying as agreed compared with paying $50 extra a month</caption>
          <thead>
            <tr>
              <td />
              <th scope="col">As agreed</th>
              <th scope="col" className="plus">$50 extra</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Each month</th>
              <td>{money(payment)}</td>
              <td className="plus">{money(payment + EXTRA_CENTS)}</td>
            </tr>
            <tr>
              <th scope="row">Last payment</th>
              <td>{shortMonthYear(lastDue)}</td>
              <td className="plus">{shortMonthYear(lastDueWithExtra)}</td>
            </tr>
            <tr>
              <th scope="row">Interest</th>
              <td>{money(interest)}</td>
              <td className="plus">{money(withExtra.totalInterest)}</td>
            </tr>
            <tr>
              <th scope="row">Total you pay</th>
              <td>{money(asAgreed.totalPaid)}</td>
              <td className="plus">{money(withExtra.totalPaid)}</td>
            </tr>
          </tbody>
        </table>
        <p className="small">
          Credit unions usually don’t charge a fee for paying extra. Ask yours to put the extra toward the
          loan itself, not toward next month’s payment.
        </p>
      </section>

      {!hasIt && (
        <section className="section before" aria-labelledby="before">
          <h2 id="before">Before you sign</h2>
          <ul>
            <li>A lower monthly payment isn’t always cheaper. A longer loan usually means more interest in total.</li>
            <li>Ask for the Truth in Lending Disclosure. These same numbers will be on it.</li>
            <li>Got another offer? Compare the two to see which costs less overall.</li>
          </ul>
          <button type="button" className="button-quiet" onClick={onCompare}>Compare with another offer</button>
        </section>
      )}

      <p className="small">
        These numbers assume every payment is made on its due date. Many credit unions charge interest by the
        day, so {say('your', 'the')} real total may differ by a few dollars.
      </p>

      <button type="button" className="button-quiet" onClick={onStartOver}>Start over with a different loan</button>
    </main>
  )
}

function PaperRow({ name, value, paperName }) {
  return (
    <div>
      <div className="row">
        <dt>{name}</dt>
        <dd>{value}</dd>
      </div>
      <p>Your papers: <strong>{paperName}</strong></p>
    </div>
  )
}

// The one-line answer above the table, for every combination - including a
// 0% loan (nothing to save in interest) and a loan too short to finish sooner.
function extraSummary(monthsSaved, interestSaved) {
  if (monthsSaved > 0 && interestSaved > 0) {
    return `You’d finish ${duration(monthsSaved)} sooner and pay ${money(interestSaved)} less in interest.`
  }
  if (monthsSaved > 0) return `You’d finish ${duration(monthsSaved)} sooner.`
  if (interestSaved > 0) return `You’d finish in the same month, but pay ${money(interestSaved)} less in interest.`
  return 'On a loan this short, $50 more a month wouldn’t change much.'
}
