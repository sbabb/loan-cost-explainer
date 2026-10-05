import { MarkIcon } from './Icons.jsx'

// The top of every screen: the name, and where you are in the three steps
// (choose -> enter the numbers -> the answer).
export default function Header({ step }) {
  return (
    <header className="site-header">
      <span className="brand">
        <span className="mark"><MarkIcon /></span>
        Loan Cost Explainer
      </span>
      <p className="steps">
        Step {step} of 3
        <span className="steps-bar" aria-hidden="true">
          {[1, 2, 3].map((n) => <span key={n} className={n <= step ? 'on' : undefined} />)}
        </span>
      </p>
    </header>
  )
}
