import { useState } from 'react'
import { applyLook, initialLook, LOOKS } from './look.js'

// The small "Look: Calm  Terminal  Modern" switch at the top of every screen.
// Three plain buttons; the one showing is marked pressed, which screen
// readers announce ("Terminal, toggle button, pressed").
export default function LookSwitch() {
  const [look, setLook] = useState(initialLook)

  function choose(id) {
    applyLook(id)
    setLook(id)
  }

  return (
    <div className="lookbar" role="group" aria-labelledby="look-label">
      <span id="look-label">Look</span>
      <div className="lookbar-buttons">
        {LOOKS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="look-button"
            aria-pressed={look === id}
            onClick={() => choose(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
