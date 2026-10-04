import { NextIcon } from './Icons.jsx'

// Screen 1: one question that decides how everything after it is worded.
// onChoose(true) = they already have the loan; onChoose(false) = still deciding.
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
        <h2 id="question">Do you already have this loan?</h2>
        <button type="button" className="choice" onClick={() => onChoose(true)}>
          <span className="choice-text">
            <span className="choice-title">Yes, I already have it</span>
            <span className="choice-sub">I’m making payments on it now</span>
          </span>
          <NextIcon />
        </button>
        <button type="button" className="choice" onClick={() => onChoose(false)}>
          <span className="choice-text">
            <span className="choice-title">No, I’m still deciding</span>
            <span className="choice-sub">I want to know the cost before I sign</span>
          </span>
          <NextIcon />
        </button>
      </section>

      <p className="small">Nothing you type leaves this page. No sign-in, no account.</p>
    </main>
  )
}
