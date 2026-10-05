import { CompareIcon, DocumentIcon, LockIcon, NextIcon, SignIcon } from './Icons.jsx'

const CHOICES = [
  { id: 'have', icon: DocumentIcon, title: 'I already have this loan', sub: 'I’m making payments on it now' },
  { id: 'deciding', icon: SignIcon, title: 'I’m thinking about a loan', sub: 'I want to know the cost before I sign' },
  { id: 'compare', icon: CompareIcon, title: 'I’m comparing two loans', sub: 'I want to see which one costs less' },
]

// Screen 1: one question that decides how everything after it is worded.
// onChoose('have') = they already have the loan; 'deciding' = thinking about
// one; 'compare' = weighing two offers.
export default function StartScreen({ onChoose }) {
  return (
    <main>
      <header className="screen-head">
        <p className="eyebrow">Plain words, real numbers</p>
        <h1 tabIndex={-1}>What does this loan <em>really</em> cost?</h1>
        <p className="intro">
          The total cost in plain words, when it’ll be paid off, and what an extra $50 a month would change.
        </p>
      </header>

      <section className="choices" aria-labelledby="question">
        <h2 id="question">Which sounds like you?</h2>
        {CHOICES.map(({ id, icon: Icon, title, sub }) => (
          <button key={id} type="button" className="choice" onClick={() => onChoose(id)}>
            <span className="choice-icon"><Icon /></span>
            <span className="choice-text">
              <span className="choice-title">{title}</span>
              <span className="choice-sub">{sub}</span>
            </span>
            <NextIcon />
          </button>
        ))}
      </section>

      <p className="small privacy"><LockIcon /> Nothing you type leaves this page. No sign-in, no account.</p>
    </main>
  )
}
