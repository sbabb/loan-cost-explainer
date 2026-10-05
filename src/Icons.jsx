import { useId } from 'react'

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

// The brand mark: two discs. The indigo one in front is what you borrowed;
// the lavender crescent peeking out behind it is the interest you pay on top
// - the whole product in one shape, and the same split as the cost bars.
// The gap between them is cut out (a mask), so it works on any background.
// public/favicon.svg is the same drawing.
export function Mark({ size = 28 }) {
  // React's ids contain characters an SVG url(#...) can trip over; keep it plain.
  const id = `mark${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d6ff5" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
        <mask id={`${id}-gap`}>
          <rect width="32" height="32" fill="#fff" />
          <circle cx="13.5" cy="16" r="12.6" fill="#000" />
        </mask>
      </defs>
      <circle cx="19.5" cy="16" r="11" fill="#a5b4fc" mask={`url(#${id}-gap)`} />
      <circle cx="13.5" cy="16" r="11" fill={`url(#${id}-front)`} />
    </svg>
  )
}

export function InfoIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.5h.01" /></Icon>
}
