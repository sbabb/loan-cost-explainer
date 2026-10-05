import { useEffect, useRef, useState } from 'react'
import Field from './Field.jsx'
import ErrorSummary from './ErrorSummary.jsx'
import TermNote from './TermNote.jsx'
import { BackIcon } from './Icons.jsx'
import { checkInputs, parseWhole } from './checkInputs.js'

const LETTERS = ['a', 'b']
const CTA = 'Compare these offers'

// The comparison form: two offers, each with an optional name and the same
// three numbers as a single loan. Each offer is checked by checkInputs(), so
// the rules and messages are exactly the ones the single-loan form uses.
//
// offers: { a: { name, amount, rate, term }, b: {...} } - the typed text,
// which lives in App so it survives going back and forth.
export default function CompareForm({ offers, onChange, onBack, onCompare, today }) {
  const [errors, setErrors] = useState({ a: {}, b: {} })
  const [termChecks, setTermChecks] = useState({ a: null, b: null })
  const [shortTermOk, setShortTermOk] = useState({ a: null, b: null })
  const [attempts, setAttempts] = useState(0)
  const summaryRef = useRef(null)

  useEffect(() => {
    if (attempts > 0) summaryRef.current?.focus()
  }, [attempts])

  function handleSubmit(event) {
    event.preventDefault()
    const checked = {}
    for (const letter of LETTERS) {
      checked[letter] = checkInputs(
        { ...offers[letter], month: '', year: '' },
        { hasIt: false, shortTermOk: shortTermOk[letter], today },
      )
    }
    if (checked.a.loan && checked.b.loan) {
      onCompare(LETTERS.map((letter) => ({ name: offers[letter].name, loan: checked[letter].loan })))
      return
    }
    setErrors({ a: checked.a.errors, b: checked.b.errors })
    setTermChecks({ a: checked.a.termCheck, b: checked.b.termCheck })
    // Asked once about a short term: the same number again carries on.
    setShortTermOk((old) => ({
      a: checked.a.termCheck ? checked.a.termCheck.typed : old.a,
      b: checked.b.termCheck ? checked.b.termCheck.typed : old.b,
    }))
    setAttempts((count) => count + 1)
  }

  function update(letter, name, text) {
    onChange(letter, name, text)
    setErrors((old) => ({ ...old, [letter]: { ...old[letter], [name]: undefined } }))
    if (name === 'term') setTermChecks((old) => ({ ...old, [letter]: null }))
  }

  // The list at the top: offer A's problems, then offer B's.
  const problems = []
  for (const letter of LETTERS) {
    const label = `Offer ${letter.toUpperCase()}`
    const offerErrors = errors[letter]
    if (offerErrors.amount) problems.push({ id: `${letter}-amount`, text: `${label}: ${offerErrors.amount}` })
    if (offerErrors.rate) problems.push({ id: `${letter}-rate`, text: `${label}: ${offerErrors.rate}` })
    if (offerErrors.term) problems.push({ id: `${letter}-term`, text: `${label}: ${offerErrors.term}` })
    if (termChecks[letter]) problems.push({ id: `${letter}-term`, text: `${label}: Check the loan length` })
  }

  return (
    <main>
      <button type="button" className="back" onClick={onBack}>
        <BackIcon />
        <span>Back</span>
      </button>

      <header className="screen-head">
        <p className="eyebrow">Comparing two offers</p>
        <h1 tabIndex={-1}>Enter the two offers</h1>
        <p className="intro">Use the numbers each lender gave you. You’ll see which costs less, and why.</p>
      </header>

      <ErrorSummary problems={problems} ref={summaryRef} />

      <form onSubmit={handleSubmit} noValidate>
        {LETTERS.map((letter) => {
          const values = offers[letter]
          const offerErrors = errors[letter]
          const termCheck = termChecks[letter]
          return (
            <section key={letter} className="offer" aria-labelledby={`${letter}-title`}>
              <h2 id={`${letter}-title`}>Offer {letter.toUpperCase()}</h2>
              <Field
                id={`${letter}-name`}
                label="Who’s it from? (optional)"
                hint="Like “My credit union” or “Dealer”. It’s only a label."
                maxLength={24}
                value={values.name}
                onChange={(text) => update(letter, 'name', text)}
              />
              <Field
                id={`${letter}-amount`}
                label="How much you’d borrow"
                hint="The amount after any down payment or trade-in."
                error={offerErrors.amount}
                prefix="$"
                inputMode="decimal"
                value={values.amount}
                onChange={(text) => update(letter, 'amount', text)}
              />
              <Field
                id={`${letter}-rate`}
                label="Interest rate (APR)"
                hint="Use the APR. It counts most fees, so it’s the fairest number to compare."
                error={offerErrors.rate}
                suffix="%"
                width="10rem"
                inputMode="decimal"
                value={values.rate}
                onChange={(text) => update(letter, 'rate', text)}
              />
              <Field
                id={`${letter}-term`}
                label="Loan length, in months"
                hint="A 5-year loan is 60 months."
                error={offerErrors.term}
                suffix="months"
                width="12.5rem"
                inputMode="numeric"
                value={values.term}
                onChange={(text) => update(letter, 'term', text)}
                describedBy={[termCheck ? `${letter}-term-check` : `${letter}-term-note`]}
              >
                <TermNote
                  id={`${letter}-term`}
                  term={parseWhole(values.term)}
                  hasError={Boolean(offerErrors.term)}
                  termCheck={termCheck}
                  unit="months"
                  hasIt={false}
                  cta={CTA}
                  onApply={() => {
                    update(letter, 'term', String(termCheck.asMonths))
                    document.getElementById(`${letter}-term`)?.focus()
                  }}
                />
              </Field>
            </section>
          )
        })}

        <button type="submit" className="button">{CTA}</button>
      </form>

      <p className="small">Nothing you type leaves this page. No sign-in, no account.</p>
    </main>
  )
}
