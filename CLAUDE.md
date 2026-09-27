# Loan Cost Explainer

Portfolio piece 2 of 3 for Steven's move into product design (target: portfolio
ready ~March 2027). The notes live in the Obsidian vault at
`~/Projects/Career_Transition/Notes/02 Portfolio/Loan Cost Explainer.md`.

## What it is
Input a loan's amount, rate and term → a plain-language explanation of what it
costs, plus what an extra $50/month does to the total and the payoff date.

## Why it matters for the portfolio
The point is **user research and clear writing**, not the calculator. Steven
talks to confused credit union members all day at work, so real users, a
before/after and iteration are built in. Possible framing: a redesign of a
loan disclosure document (generic, never real member data or TAPCO branding).
No AI in the product - deliberately. A loan explanation has to be exactly right.

## How we work
- Build in code first, together, one decision at a time. Figma comes after, as
  the place the finished design is documented - not where it starts.
- Steven is a senior creative learning product design, not a beginner designer.
  Explain code choices in plain words; keep the code simple enough for him to read.
- Log every real design decision in `docs/DECISIONS.md` (what, why, what was
  rejected). That file becomes the case study: Problem → decisions → shipped result.
- Accessibility from the start: WCAG 2.1 AA. Text contrast 4.5:1, UI 3:1,
  keyboard-operable, labelled inputs, visible focus.
- Loan math must be verified by a script before anything ships.
- One piece of work at a time. New ideas go to the Parking Lot, not into the build.

## Stack
React 19 + Vite, plain CSS. Same setup as Cadence (`~/Projects/cadence`).
Deploys to GitHub Pages on every push to main (`.github/workflows/deploy.yml`).
Steven pushes himself; commit only when asked.
