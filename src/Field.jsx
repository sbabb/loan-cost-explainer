import { AlertIcon } from './Icons.jsx'
import { caretAfterGrouping, groupThousands } from './checkInputs.js'

// One labelled text box, in the order people read it: label, hint, anything
// that has to come before the box (the years/months choice), error, then the
// box itself (with an optional $ or % inside it). Anything passed as
// children - the "That's 5 years" note, the years check - goes underneath.
//
// The hint and error are tied to the box with aria-describedby, so a screen
// reader reads them out when the box gets focus.
//
// groupDigits: add commas as people type a dollar amount (25000 -> 25,000).
export default function Field({
  id, label, hint, error, prefix, suffix, width, inputMode, maxLength, groupDigits = false,
  value, onChange, describedBy = [], beforeBox, children,
}) {
  const described = [hint && `${id}-hint`, error && `${id}-error`, ...describedBy].filter(Boolean).join(' ')

  function handleChange(event) {
    const input = event.target
    if (!groupDigits) {
      onChange(input.value)
      return
    }
    // Add the commas, then put the cursor back after the same digit it was
    // after - otherwise it jumps to the end on every keystroke.
    const typedBefore = input.value.slice(0, input.selectionStart ?? input.value.length)
    const grouped = groupThousands(input.value)
    onChange(grouped)
    if (grouped !== input.value) {
      requestAnimationFrame(() => {
        const caret = caretAfterGrouping(grouped, typedBefore)
        input.setSelectionRange(caret, caret)
      })
    }
  }

  // Backspace right after a comma would only delete the comma, which the
  // next keystroke puts straight back. Step over it so the digit goes.
  function handleKeyDown(event) {
    if (!groupDigits) return
    const input = event.target
    const at = input.selectionStart
    if (at !== input.selectionEnd) return
    if (event.key === 'Backspace' && input.value[at - 1] === ',') input.setSelectionRange(at - 1, at - 1)
    if (event.key === 'Delete' && input.value[at] === ',') input.setSelectionRange(at + 1, at + 1)
  }

  return (
    <div className="field">
      <label htmlFor={id} id={`${id}-label`} className="label">{label}</label>
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
      {beforeBox}
      {error && (
        <p id={`${id}-error`} className="error">
          <AlertIcon />
          <span>{error}</span>
        </p>
      )}
      <div className={error ? 'box box-error' : 'box'} style={width ? { maxWidth: width } : undefined}>
        {prefix && <span className="affix" aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={described || undefined}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {suffix && <span className="affix" aria-hidden="true">{suffix}</span>}
      </div>
      {children}
    </div>
  )
}
