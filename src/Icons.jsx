// The three small icons the app uses, drawn inline so they take the text
// color. All are decoration: the words next to them carry the meaning.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function BackIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" {...stroke}>
      <path d="M12.5 4.5 7 10l5.5 5.5" />
    </svg>
  )
}

export function NextIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" {...stroke} color="var(--accent)">
      <path d="M7.5 4.5 13 10l-5.5 5.5" />
    </svg>
  )
}

export function AlertIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" {...stroke}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v5" />
      <path d="M10 14h.01" />
    </svg>
  )
}
