import { useEffect, useRef, useState } from 'react'
import Field from './Field.jsx'
import ErrorSummary from './ErrorSummary.jsx'
import TermNote from './TermNote.jsx'
import UnitChoice from './UnitChoice.jsx'
import { AlertIcon, ArrowIcon, BackIcon, LockIcon } from './Icons.jsx'
import { checkInputs, parseWhole } from './checkInputs.js'
import { MONTHS } from './format.js'

// Screen 2: the loan's numbers. Worded for someone who already has the loan
// (hasIt) or someone still deciding. The typed text lives in App, so it's
// still there after "Change the numbers"; the problems found live here.
export default function LoanForm({ hasIt, values, onChange, onBack, onExplain, today }) {
  const [errors, setErrors] = useState({})
  const [termCheck, setTermCheck] = useState(null)
  const [shortTermOk, setShortTermOk] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const summaryRef = useRef(null)

  // After a press of Explain that finds problems, move focus to the list of
  // them, so keyboard and screen reader users land where the news is.
  useEffect(() => {
    if (attempts > 0) summaryRef.current?.focus()
  }, [attempts])

  const cta = hasIt ? 'Explain my loan' : 'Explain this loan'
  // The length can be given in years or months either way. For a loan they
  // have, months are "payments" - the word on a Truth in Lending Disclosure.
  const inYears = values.termUnit === 'years'
  const unit = inYears ? 'years' : hasIt ? 'payments' : 'months'

  function handleSubmit(event) {
    event.preventDefault()
    const result = checkInputs(values, { hasIt, shortTermOk, today })
    if (result.loan) {
      onExplain(result.loan)
      return
    }
    setErrors(result.errors)
    setTermCheck(result.termCheck)
    // Asked once about a short term: the same number again carries on.
    if (result.termCheck) setShortTermOk(result.termCheck.typed)
    setAttempts((count) => count + 1)
  }

  // Typing in a box clears that box's problem - no telling someone off for
  // something they're already fixing.
  function update(name, text) {
    onChange(name, text)
    const field = name === 'termUnit' ? 'term' : name
    setErrors((old) => ({ ...old, [field]: undefined }))
    if (field === 'term') setTermCheck(null)
  }

  function applySuggestedTerm() {
    update('term', String(termCheck.asMonths))
    document.getElementById('term')?.focus()
  }

  // The list at the top, in the same order as the boxes.
  const problems = []
  if (errors.amount) problems.push({ id: 'amount', text: errors.amount })
  if (errors.rate) problems.push({ id: 'rate', text: errors.rate })
  if (errors.term) problems.push({ id: 'term', text: errors.term })
  if (termCheck) problems.push({ id: 'term', text: 'Check the loan length' })
  if (errors.month) problems.push({ id: 'month', text: errors.month })
  if (errors.year) problems.push({ id: 'year', text: errors.year })


  return (
    <main>
      <button type="button" className="back" onClick={onBack}>
        <BackIcon />
        <span>Change your answer</span>
      </button>

      <header className="screen-head">
        <p className="eyebrow">{hasIt ? 'You already have this loan' : 'You’re still deciding'}</p>
        <h1 tabIndex={-1}>{hasIt ? 'Find these numbers on your loan papers' : 'Enter the numbers from the loan offer'}</h1>
        <p className="intro">
          {hasIt
            ? 'They’re on your Truth in Lending Disclosure, or your Closing Disclosure for a mortgage.'
            : 'No offer yet? A good guess still shows how the cost adds up.'}
        </p>
      </header>

      <ErrorSummary problems={problems} ref={summaryRef} />

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Field
          id="amount"
          label={hasIt ? 'How much you borrowed' : 'How much you want to borrow'}
          hint={hasIt
            ? 'On your loan papers this is called the Amount Financed.'
            : 'The amount after any down payment or trade-in.'}
          error={errors.amount}
          prefix="$"
          inputMode="decimal"
          groupDigits
          value={values.amount}
          onChange={(text) => update('amount', text)}
        />

        <Field
          id="rate"
          label="Interest rate (APR)"
          hint={hasIt
            ? 'Use the APR (Annual Percentage Rate) on your loan papers.'
            : 'Use the APR the lender quoted. It counts most fees, so it’s the fairest number to compare.'}
          error={errors.rate}
          suffix="%"
          width="10rem"
          inputMode="decimal"
          value={values.rate}
          onChange={(text) => update('rate', text)}
        />

        <Field
          id="term"
          label="Loan length"
          hint={hasIt
            ? 'Car and personal loans show the Number of Payments (like 60). A mortgage’s Closing Disclosure shows the Loan Term (like 30 years).'
            : 'In months or years, whichever the offer uses.'}
          beforeBox={
            <UnitChoice
              id="term-unit"
              value={values.termUnit}
              onChange={(next) => update('termUnit', next)}
              labelledBy="term-label"
              monthsLabel={hasIt ? 'Payments' : 'Months'}
            />
          }
          error={errors.term}
          suffix={unit}
          width="12.5rem"
          inputMode="numeric"
          value={values.term}
          onChange={(text) => update('term', text)}
          describedBy={[termCheck ? 'term-check' : 'term-note']}
        >
          <TermNote
            id="term"
            term={parseWhole(values.term)}
            inYears={inYears}
            hasError={Boolean(errors.term)}
            termCheck={termCheck}
            unit={unit}
            hasIt={hasIt}
            cta={cta}
            onApply={applySuggestedTerm}
          />
        </Field>

        {hasIt && (
          <fieldset className="field" aria-describedby="date-hint">
            <legend className="label">First payment date</legend>
            <p id="date-hint" className="hint">
              In the payment schedule, after “Monthly beginning”. It’s how the payoff date is worked out.
            </p>
            {errors.month && (
              <p id="month-error" className="error"><AlertIcon /><span>{errors.month}</span></p>
            )}
            {errors.year && (
              <p id="year-error" className="error"><AlertIcon /><span>{errors.year}</span></p>
            )}
            <div className="date-row">
              <div className="date-month">
                <label htmlFor="month" className="sublabel">Month</label>
                <select
                  id="month"
                  className={errors.month ? 'select-error' : undefined}
                  aria-invalid={errors.month ? true : undefined}
                  aria-describedby={errors.month ? 'month-error' : undefined}
                  value={values.month}
                  onChange={(event) => update('month', event.target.value)}
                >
                  <option value="">Choose a month</option>
                  {MONTHS.map((name, index) => (
                    <option key={name} value={String(index)}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="date-year">
                <label htmlFor="year" className="sublabel">Year</label>
                <div className={errors.year ? 'box box-error' : 'box'}>
                  <input
                    id="year"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-invalid={errors.year ? true : undefined}
                    aria-describedby={errors.year ? 'year-error' : undefined}
                    value={values.year}
                    onChange={(event) => update('year', event.target.value)}
                  />
                </div>
              </div>
            </div>
          </fieldset>
        )}

        <button type="submit" className="button">{cta} <ArrowIcon /></button>
      </form>

      <p className="small privacy"><LockIcon /> Nothing you type leaves this page. No sign-in, no account.</p>
    </main>
  )
}
