import { explainLoan } from './loan.js'
import { addMonths, duration, money, monthYear, nextMonth, shortMonthYear } from './format.js'
import { BackIcon, PlusIcon } from './Icons.jsx'
import { CostBar, CostRows, HeroAmount, Legend } from './Charts.jsx'
import Timeline from './Timeline.jsx'
import { useCountUp } from './useCountUp.js'

export const EXTRA_CENTS = 5000 // the "$50 more a month"

// Screen 3: the explanation. Every number comes from explainLoan(), which
// scripts/verify-loan.mjs checks; this file only puts them into words and
// pictures.
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
  const shown = useCountUp(interest)

  // For a loan still being decided on, assume the first payment is next month.
  const first = loan.firstPayment ?? nextMonth(today)
  const lastDue = addMonths(first, count - 1)
  const lastDueWithExtra = addMonths(first, withExtra.months - 1)

  // "about $1.17 for every $1 you borrowed"
  const perDollar = money(Math.round((asAgreed.totalPaid * 100) / borrowed))
  // What's left of the first payment after interest goes to the loan itself.
  const firstPayment = count === 1 ? asAgreed.lastPayment : payment
  const firstToLoan = firstPayment - firstInterest

  // The cards are numbered 01, 02, ... like the sections of a statement.
  let section = 0
  const number = () => <span className="index" aria-hidden="true">{String(++section).padStart(2, '0')}</span>

  const headline = interest > 0
    ? say(`This loan will cost you ${money(interest)} in interest.`,
      `This loan would cost you ${money(interest)} in interest.`)
    : say('This loan won’t cost you anything in interest.',
      'This loan wouldn’t cost you anything in interest.')

  return (
    <main>
      <button type="button" className="back" onClick={onChangeNumbers}>
        <BackIcon />
        <span>Change the numbers</span>
      </button>

      <section className="statement on-dark" aria-labelledby="answer">
        <span className="stroke" aria-hidden="true" />
        <p className="eyebrow">{say('Your loan, explained', 'The loan you’re considering')}</p>
        <h1 id="answer" tabIndex={-1}>
          <span className="visually-hidden">{headline}</span>
          <span className="hero-lines" aria-hidden="true">
            <span className="hero-lead">{say('This loan will cost you', 'This loan would cost you')}</span>
            <span className="hero-figure"><HeroAmount cents={shown} final={interest} /></span>
            <span className="hero-lead">in interest.</span>
          </span>
        </h1>
        <p className="hero-sub">
          {interest > 0
            ? say(<>On top of the {money(borrowed)} you borrowed. That’s <strong>about {perDollar} back for
                every $1</strong>.</>,
              <>On top of the {money(borrowed)} you’d borrow. That’s <strong>about {perDollar} back for
                every $1</strong>.</>)
            : say(`You’ll pay back exactly the ${money(borrowed)} you borrowed.`,
              `You’d pay back exactly the ${money(borrowed)} you’d borrow.`)}
        </p>
        <CostBar borrowed={borrowed} interest={interest} />
        <Legend
          items={[
            { label: say('What you borrowed', 'What you’d borrow'), value: money(borrowed) },
            { label: 'Interest', value: money(interest), interest: true },
            { label: say('Total you’ll pay back', 'Total you’d pay back'), value: money(asAgreed.totalPaid), total: true },
          ]}
        />
      </section>

      <section className="card" aria-labelledby="payments">
        <h2 id="payments">{number()}Your payments</h2>
        <dl className="stats">
          <div>
            <dt>Each month</dt>
            <dd>{money(payment)}</dd>
          </div>
          <div>
            <dt>{say('Last payment', 'Last payment, about')}</dt>
            <dd>{shortMonthYear(lastDue)}</dd>
          </div>
        </dl>
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

      <section className="card" aria-labelledby="first">
        <h2 id="first">{number()}{say('Where your payments go', 'Where your payments would go')}</h2>
        {firstInterest > 0 ? (
          <>
            <p>
              {say(<>Of your first {money(firstPayment)}, <strong>{money(firstInterest)} pays interest</strong> and{' '}
                {money(firstToLoan)} pays down what you owe.</>,
              <>Of your first {money(firstPayment)}, <strong>{money(firstInterest)} would pay interest</strong> and{' '}
                {money(firstToLoan)} would pay down what you owe.</>)}
            </p>
            {count > 1 && (
              <>
                <p>
                  Every month after that, a little less goes to interest and a little more goes to the loan,
                  because you owe less each time.
                </p>
                <Timeline schedule={asAgreed.schedule} first={first} />
                <p className="small">Drag across the chart to see any payment.</p>
              </>
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
        <section className="card" aria-labelledby="papers">
          <h2 id="papers">{number()}Match it to your loan papers</h2>
          <p>Your loan papers use different names for the same numbers.</p>
          <dl className="papers">
            <PaperRow name="What you borrowed" value={money(borrowed)} paperName="Amount Financed" />
            <PaperRow name="Interest" value={money(interest)} paperName="Finance Charge" />
            <PaperRow name="Total you’ll pay" value={money(asAgreed.totalPaid)} paperName="Total of Payments" />
            <PaperRow name="Interest rate" value={`${loan.yearlyRatePercent}%`} paperName="Annual Percentage Rate" />
          </dl>
        </section>
      )}

      <section className="card card-accent" aria-labelledby="extra">
        <h2 id="extra">{number()}What if you paid $50 more a month?</h2>
        <p>{extraSummary(monthsSaved, interestSaved)}</p>
        <CostRows
          rows={[
            { name: `As agreed · ${money(payment)}`, borrowed, interest },
            {
              name: `$50 extra · ${money(payment + EXTRA_CENTS)}`,
              borrowed,
              interest: withExtra.totalInterest,
              pill: interestSaved > 0 ? `Saves ${money(interestSaved)}` : undefined,
            },
          ]}
        />
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
        <section className="card before" aria-labelledby="before">
          <h2 id="before">{number()}Before you sign</h2>
          <ul>
            <li>A lower monthly payment isn’t always cheaper. A longer loan usually means more interest in total.</li>
            <li>Ask for the Truth in Lending Disclosure. These same numbers will be on it.</li>
            <li>Got another offer? Add it below to see which costs less overall.</li>
          </ul>
        </section>
      )}

      <p className="small">
        These numbers assume every payment is made on its due date. Many credit unions charge interest by the
        day, so {say('your', 'the')} real total may differ by a few dollars.
      </p>

      <div className="actions">
        <button type="button" className="button-quiet" onClick={onStartOver}>Start over with a different loan</button>
        <button type="button" className="button-quiet" onClick={onCompare}>
          <PlusIcon /> Add another loan to compare
        </button>
      </div>
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

// The one-line answer above the bars, for every combination - including a
// 0% loan (nothing to save in interest) and a loan too short to finish sooner.
function extraSummary(monthsSaved, interestSaved) {
  if (monthsSaved > 0 && interestSaved > 0) {
    return `You’d finish ${duration(monthsSaved)} sooner and pay ${money(interestSaved)} less in interest.`
  }
  if (monthsSaved > 0) return `You’d finish ${duration(monthsSaved)} sooner.`
  if (interestSaved > 0) return `You’d finish in the same month, but pay ${money(interestSaved)} less in interest.`
  return 'On a loan this short, $50 more a month wouldn’t change much.'
}
