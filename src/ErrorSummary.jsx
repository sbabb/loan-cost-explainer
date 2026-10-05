const COUNT_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five']

// The "Two things to check" box at the top of a form. Each problem links to
// its box. The form moves focus here (ref) after a press that finds problems,
// so keyboard and screen reader users land where the news is.
//
// problems: [{ id, text }] - id is the box to jump to.
export default function ErrorSummary({ problems, ref }) {
  if (problems.length === 0) return null
  const count = problems.length < COUNT_WORDS.length ? COUNT_WORDS[problems.length] : problems.length

  return (
    <div className="summary" ref={ref} tabIndex={-1} aria-labelledby="summary-title">
      <h2 id="summary-title">
        {count} {problems.length === 1 ? 'thing' : 'things'} to check
      </h2>
      <ul>
        {problems.map((problem) => (
          <li key={`${problem.id} ${problem.text}`}>
            <a
              href={`#${problem.id}`}
              onClick={(event) => {
                event.preventDefault()
                document.getElementById(problem.id)?.focus()
              }}
            >
              {problem.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
