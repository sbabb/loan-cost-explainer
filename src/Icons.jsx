// The small icons the app uses, drawn inline so they take the text color.
// All are decoration: the words next to them carry the meaning.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Icon({ size = 20, children }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      {children}
    </svg>
  )
}

export function BackIcon() {
  return <Icon size={18}><path d="M15 18l-6-6 6-6" /></Icon>
}

export function NextIcon() {
  return <span className="chevron"><Icon><path d="M9 6l6 6-6 6" /></Icon></span>
}

export function ArrowIcon() {
  return <Icon size={18}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Icon>
}

export function AlertIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" /></Icon>
}

export function LockIcon() {
  return <Icon size={16}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>
}

// A loan document: "I already have this loan".
export function DocumentIcon() {
  return (
    <Icon size={22}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </Icon>
  )
}

// A pen signing: "I'm thinking about a loan".
export function SignIcon() {
  return (
    <Icon size={22}>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
      <path d="M14 19h7" />
    </Icon>
  )
}

// Two columns side by side: "I'm comparing two offers".
export function CompareIcon() {
  return (
    <Icon size={22}>
      <rect x="3" y="4" width="7" height="16" rx="2" />
      <rect x="14" y="9" width="7" height="11" rx="2" />
    </Icon>
  )
}

// The brand mark: three rising bars.
export function MarkIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1.5" y="9" width="3" height="5.5" rx="1.2" />
      <rect x="6.5" y="5.5" width="3" height="9" rx="1.2" />
      <rect x="11.5" y="1.5" width="3" height="13" rx="1.2" />
    </svg>
  )
}

export function InfoIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.5h.01" /></Icon>
}
