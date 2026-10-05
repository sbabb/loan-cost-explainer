import { useEffect, useRef, useState } from 'react'
import StartScreen from './StartScreen.jsx'
import LoanForm from './LoanForm.jsx'
import Results from './Results.jsx'
import LookSwitch from './LookSwitch.jsx'

const EMPTY = { amount: '', rate: '', term: '', month: '', year: '' }

const TITLES = {
  start: 'Loan Cost Explainer',
  inputs: 'Your loan’s numbers – Loan Cost Explainer',
  results: 'Your loan, explained – Loan Cost Explainer',
}

// The whole flow: start -> inputs -> results.
//
// Each step is also a browser history entry, so the phone's back button goes
// back one screen instead of leaving the site. history.state remembers the
// step and the answer to the first question; the typed numbers stay here in
// memory (never sent anywhere, never saved).
export default function App() {
  const [step, setStep] = useState(() => window.history.state?.step ?? 'start')
  const [hasIt, setHasIt] = useState(() => window.history.state?.hasIt ?? true)
  const [values, setValues] = useState(EMPTY)
  const [loan, setLoan] = useState(null)

  useEffect(() => {
    if (!window.history.state) window.history.replaceState({ step: 'start', hasIt: true }, '')
    function onBackOrForward(event) {
      setStep(event.state?.step ?? 'start')
      setHasIt(event.state?.hasIt ?? true)
    }
    window.addEventListener('popstate', onBackOrForward)
    return () => window.removeEventListener('popstate', onBackOrForward)
  }, [])

  function goTo(nextStep, nextHasIt) {
    window.history.pushState({ step: nextStep, hasIt: nextHasIt }, '')
    setStep(nextStep)
    setHasIt(nextHasIt)
  }

  // After a reload on the results screen the numbers are gone (they were
  // only ever in memory), so show the form to fill in again.
  const screen = step === 'results' && !loan ? 'inputs' : step

  // A new screen: start at the top, update the tab title, and move focus to
  // the heading so a screen reader announces where you are. Skipped on first
  // load, where the browser's own behaviour is right.
  const firstScreen = useRef(true)
  useEffect(() => {
    document.title = TITLES[screen]
    if (firstScreen.current) {
      firstScreen.current = false
      return
    }
    window.scrollTo(0, 0)
    document.querySelector('h1')?.focus()
  }, [screen])

  let content
  if (screen === 'start') {
    content = <StartScreen onChoose={(answer) => goTo('inputs', answer)} />
  } else if (screen === 'inputs') {
    content = (
      <LoanForm
        key={hasIt ? 'have' : 'deciding'}
        hasIt={hasIt}
        values={values}
        onChange={(name, text) => setValues((old) => ({ ...old, [name]: text }))}
        onBack={() => window.history.back()}
        onExplain={(checked) => {
          setLoan(checked)
          goTo('results', hasIt)
        }}
        today={new Date()}
      />
    )
  } else {
    content = (
      <Results
        loan={loan}
        hasIt={hasIt}
        today={new Date()}
        onChangeNumbers={() => window.history.back()}
        onStartOver={() => {
          setValues(EMPTY)
          setLoan(null)
          goTo('start', hasIt)
        }}
      />
    )
  }

  return (
    <>
      <LookSwitch />
      {content}
    </>
  )
}
