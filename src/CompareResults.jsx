import { compareOffers } from './compareLoans.js'
import { duration, money } from './format.js'
import { BackIcon, InfoIcon } from './Icons.jsx'
import { CostRows, HeroAmount } from './Charts.jsx'
import { useCountUp } from './useCountUp.js'

// The comparison: which offer costs less, by how much and why, then both side
// by side. Every number and sentence comes from compareOffers(), which
// scripts/verify-compare.mjs checks; this file only lays them out.
export default function CompareResults({ offers, onChangeOffers, onStartOver }) {
  const comparison = compareOffers(offers)
  const { cheaper, headline, lead, why, trade, amountsNote } = comparison
  const [a, b] = comparison.offers
  const isCheaper = (index) => (index === cheaper ? 'plus' : undefined)

  // The big number: how much less the cheaper one costs (or, in a tie, what
  // both cost).
  const win = cheaper === null ? a : comparison.offers[cheaper]
  const lose = cheaper === null ? b : comparison.offers[1 - cheaper]
  const figure = cheaper === null ? a.interest : lose.interest - win.interest
  const shown = useCountUp(figure)

  // "The catch: ..." gets its own box - it's the part people miss.
  const isCatch = trade?.startsWith('The catch: ')

  return (
    <main>
      <button type="button" className="back" onClick={onChangeOffers}>
        <BackIcon />
        <span>Change the offers</span>
      </button>

      <section className="statement on-dark" aria-labelledby="answer">
        <p className="eyebrow">Comparing two offers</p>
        <h1 id="answer" tabIndex={-1}>
          <span className="visually-hidden">{headline}</span>
          <span className="hero-lines" aria-hidden="true">
            <span className="hero-lead">
              {cheaper === null ? 'Both offers would cost you' : `${win.name} would cost you`}
            </span>
            <span className="hero-figure">
              <HeroAmount cents={shown} final={figure} />
              {cheaper !== null && <span className="figure-word"> less</span>}
            </span>
            <span className="hero-lead">in interest.</span>
          </span>
        </h1>
        <p className="hero-sub">{lead}</p>
        <CostRows
          rows={[a, b].map((offer, index) => ({
            name: offer.name,
            borrowed: offer.loan.amountCents,
            interest: offer.interest,
            pill: index === cheaper ? 'Costs less' : undefined,
          }))}
        />
      </section>

      {(why || trade || amountsNote) && (
        <section className="card" aria-label="Why">
          {why && <p>{why}</p>}
          {trade && !isCatch && <p>{trade}</p>}
          {isCatch && (
            <p className="callout">
              <InfoIcon />
              <span><strong>The catch:</strong> {trade.slice('The catch: '.length)}</span>
            </p>
          )}
          {amountsNote && <p className="small">{amountsNote}</p>}
        </section>
      )}

      <section className="card" aria-labelledby="side-by-side">
        <h2 id="side-by-side">Side by side</h2>
        <table>
          <caption className="visually-hidden">The two offers compared</caption>
          <thead>
            <tr>
              <td />
              {[a, b].map((offer, index) => (
                <th key={index} scope="col" className={isCheaper(index)}>
                  {offer.name}
                  {index === cheaper && <span className="badge">Costs less</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Each month" values={[money(a.payment), money(b.payment)]} isCheaper={isCheaper} />
            <Row label="Loan length" values={[duration(a.months), duration(b.months)]} isCheaper={isCheaper} />
            <Row label="Interest rate"
              values={[`${a.loan.yearlyRatePercent}%`, `${b.loan.yearlyRatePercent}%`]} isCheaper={isCheaper} />
            <Row label="Interest" values={[money(a.interest), money(b.interest)]} isCheaper={isCheaper} />
            <Row label="Borrowed" values={[money(a.loan.amountCents), money(b.loan.amountCents)]} isCheaper={isCheaper} />
            <Row label="Total you’d pay" values={[money(a.totalPaid), money(b.totalPaid)]} isCheaper={isCheaper} />
          </tbody>
        </table>
      </section>

      <section className="card" aria-labelledby="before">
        <h2 id="before">Before you sign</h2>
        <ul>
          <li>Make sure both rates are APRs. A quoted “rate” can leave out fees that the APR counts.</li>
          <li>Ask each lender for the Truth in Lending Disclosure. Its Finance Charge is the interest shown here.</li>
        </ul>
      </section>

      <p className="small">
        These numbers assume every payment is made on its due date. Many credit unions charge interest by the
        day, so the real totals may differ by a few dollars.
      </p>

      <button type="button" className="button-quiet" onClick={onStartOver}>Start over</button>
    </main>
  )
}

function Row({ label, values, isCheaper }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {values.map((value, index) => (
        <td key={index} className={isCheaper(index)}>{value}</td>
      ))}
    </tr>
  )
}
