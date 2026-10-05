import { AlertIcon } from './Icons.jsx'

// One labelled text box, in the order people read it: label, hint, error,
// then the box itself (with an optional $ or % inside it). Anything passed
// as children - the "That's 5 years" note, the years check - goes underneath.
//
// The hint and error are tied to the box with aria-describedby, so a screen
// reader reads them out when the box gets focus.
export default function Field({
  id, label, hint, error, prefix, suffix, width, inputMode, maxLength, value, onChange, describedBy = [], children,
}) {
  const described = [hint && `${id}-hint`, error && `${id}-error`, ...describedBy].filter(Boolean).join(' ')

  return (
    <div className="field">
      <label htmlFor={id} className="label">{label}</label>
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
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
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <span className="affix" aria-hidden="true">{suffix}</span>}
      </div>
      {children}
    </div>
  )
}
