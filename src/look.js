// Which of the three looks is showing. The look is just an attribute on
// <html> (data-look="terminal"); src/looks.css does the rest.
//
// Where the choice comes from, in order:
//   1. the link - ?look=terminal - so a research session can send someone
//      straight to one look
//   2. what this browser picked last time (saved on this device only; it's a
//      display preference, not anything about the loan)
//   3. Calm
export const LOOKS = [
  { id: 'calm', label: 'Calm' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'modern', label: 'Modern' },
]

const KEY = 'look'
const isLook = (id) => LOOKS.some((look) => look.id === id)

export function initialLook() {
  const fromLink = new URLSearchParams(window.location.search).get('look')
  if (isLook(fromLink)) return fromLink
  try {
    const saved = window.localStorage.getItem(KEY)
    if (isLook(saved)) return saved
  } catch {
    // Storage can be blocked (private browsing). Calm is fine.
  }
  return 'calm'
}

export function applyLook(id) {
  document.documentElement.dataset.look = id
  try {
    window.localStorage.setItem(KEY, id)
  } catch {
    // Not saved this time; it still applies.
  }
}
