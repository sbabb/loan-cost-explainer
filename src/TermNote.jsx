import { AlertIcon } from './Icons.jsx'
import { duration } from './format.js'

// What sits under the loan-length box: either the friendly "That's 5 years
// of monthly payments." or, when a short number looks like years, the check
// with a button to fix it.
//
// id: the term box's id ("term", "a-term"), so the note and check get
//   matching ids for aria-describedby.
// term: the number typed, or null. inYears: it was typed in years.
// termCheck: { typed, asMonths } or null.
// unit: "payments" or "months". cta: the button to press again if it's right.
export default function TermNote({ id, term, inYears = false, hasError, termCheck, unit, hasIt, cta, onApply }) {
  if (termCheck) {
    const { typed, asMonths } = termCheck
    return (
      <div className="check" id={`${id}-check`}>
        <p>
          <AlertIcon />
          <span>
            <strong>{typed} {unit} is less than a year.</strong>{' '}
            {hasIt ? 'Payments are counted in months' : 'Lenders often say years'}, so{' '}
            {[8, 11].includes(typed) ? 'an' : 'a'} {typed}-year loan is {asMonths} {unit}.
            If {typed} is right, press “{cta}” again.
          </span>
        </p>
        <button type="button" className="button-quiet" onClick={onApply}>
          Change it to {asMonths} {unit}
        </button>
      </div>
    )
  }

  let note = ''
  if (term && !hasError) {
    note = inYears ? `That’s ${term * 12} monthly payments.` : `That’s ${duration(term)} of monthly payments.`
  }
  return (
    <p id={`${id}-note`} className="note" aria-live="polite">{note}</p>
  )
}
