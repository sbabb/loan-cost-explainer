import { NextIcon } from './Icons.jsx'

// Screen 1: one question that decides how everything after it is worded.
// onChoose('have') = they already have the loan; 'deciding' = thinking about
// one; 'compare' = weighing two offers.
export default function StartScreen({ onChoose }) {
  return (
    <main>
      <header className="screen-head">
        <p className="eyebrow">Loan Cost Explainer</p>
        <h1 tabIndex={-1}>What does this loan really cost?</h1>
        <p className="intro">
          You’ll get the total cost in plain words, when it’ll be paid off, and what an extra $50 a
          month would change. One question first.
        </p>
      </header>

      <section className="choices" aria-labelledby="question">
        <h2 id="question">Which sounds like you?</h2>
        <button type="button" className="choice" onClick={() => onChoose('have')}>
          <span className="choice-text">
            <span className="choice-title">I already have this loan</span>
            <span className="choice-sub">I’m making payments on it now</span>
          </span>
          <NextIcon />
        </button>
        <button type="button" className="choice" onClick={() => onChoose('deciding')}>
          <span className="choice-text">
            <span className="choice-title">I’m thinking about a loan</span>
            <span className="choice-sub">I want to know the cost before I sign</span>
          </span>
          <NextIcon />
        </button>
        <button type="button" className="choice" onClick={() => onChoose('compare')}>
          <span className="choice-text">
            <span className="choice-title">I’m comparing two offers</span>
            <span className="choice-sub">I want to see which one costs less</span>
          </span>
          <NextIcon />
        </button>
      </section>

      <p className="small">Nothing you type leaves this page. No sign-in, no account.</p>
    </main>
  )
}
