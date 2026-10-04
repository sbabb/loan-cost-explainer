# Design decisions

Each entry: what we decided, why, and what we rejected. This is the raw
material for the case study.

## 2026-09-27 - Build in code first, document in Figma after
**Why:** faster to test real numbers and real wording with real people.
**Rejected:** designing every screen in Figma before building.

## 2026-09-27 - No AI in the product
**Why:** a loan explanation has to be exactly right; a wrong one harms the
member. The AI trust question is covered by the Receipt Scanner piece.
**Rejected:** an AI "ask about your loan" feature.

## 2026-09-27 - Loan math first, checked by a script
The math lives on its own (`src/loan.js`) with no screen attached, and
`npm run verify` checks it against published payment figures, a worked
example and 5,000 random loans before anything ships.
**Why:** every word of the explanation rests on these numbers. A wrong
number in plain language is worse than a right one in jargon.
**Rejected:** building the screen first and checking the math by eye.

## 2026-09-27 - Money in whole cents, interest charged monthly
Amounts are whole cents; the payment is rounded to the nearest cent and the
final payment settles the leftover, the way a real loan statement does.
Interest is worked out monthly, the method a Truth in Lending disclosure uses.
**Why:** decimal dollars drift in JavaScript; cents don't. Monthly interest
matches the paperwork members already have.
**Rejected:** daily interest (what many credit unions actually charge) - it
needs payment dates and differs by only a few dollars. The explanation must
say its numbers are close, not to the penny.
**Found while testing:** on long, high-rate loans the rounding cents grow, so
the final payment can differ from the others by more than pennies, and a tiny
loan over decades can finish a month early. Realistic member loans differ by
cents. Worth remembering when writing the "final payment" wording.

## 2026-09-27 - For loans members have and loans they're considering
One tool serves both: the member who already signed and wants to know what
they're really paying, and the member still deciding.
**Why:** at work both questions come up. People ask what their loan costs,
and they ask before signing too.
**Rejected:** existing loans only (tighter, matches the disclosure-redesign
framing) and new loans only (just another loan calculator).
**Risk to design around:** the wording can't hedge between "you owe" and
"you'd owe". Plan: ask which one up front, then write each version plainly.

## 2026-10-04 - A mobile-first website, not an app
It runs in the browser, designed for a phone first, and widens to a calm
column on a computer. Lives at sbabb.github.io/loan-cost-explainer.
**Why:** a loan question is a one-off; nobody installs an app for it. A link
can sit wherever members already are (online banking, a loan email, a QR
code on the paper disclosure). Reviewers can try the real thing in seconds.
Everything runs in the browser, so "nothing you type leaves this page" is
true.
**Rejected:** a native app (install friction for a one-time question); an
installable web app for now (Parking Lot).

## 2026-10-04 - Results: the answer in sentences, matched to the paperwork
The results screen leads with one plain sentence ("This loan will cost you
$4,342.18 in interest"), explains in short sentences, then names each number
the way the Truth in Lending disclosure does ("your papers call this the
Finance Charge"). The extra-$50 section is a side-by-side table.
**Why:** sentences answer the question members actually ask; the paperwork
names build trust and teach the document they already have; a table is the
clearest way to compare two ways of paying.
**Rejected:** numbers-only breakdown (R2) and table-first (R3) as the whole
screen - explored on the results canvas, parts kept.

## 2026-10-04 - Ask "do you already have this loan?" on its own screen first
The question gets a screen to itself; the inputs that follow are worded for
the answer ("Find these numbers on your loan papers" or "Enter the numbers
from the loan offer").
**Why:** each screen speaks to one situation plainly - the fix for the "both
audiences" risk. Changing the wording under someone's eyes is disorienting,
and a screen reader user wouldn't notice it changed.
**Rejected:** one screen with the question on top and the labels rewriting
themselves (option A on the first-screen canvas). It saves one tap.

## 2026-10-04 - Ask for the first payment date (existing loans only)
Month and year, from the payment schedule ("Monthly beginning...").
**Why:** without it there is no real payoff date, and "when will this be
paid off?" is half the point. It's printed next to the other numbers.
**Rejected:** guessing from today's date - wrong for anyone partway through
a loan. For a loan still being considered, the results assume the first
payment is next month and say so.

## 2026-10-04 - Catch years typed as payments
If someone types fewer than 12 payments, stop once and ask: "5 payments is
less than a year... a 5-year loan is 60 payments", with a button to fix it.
Pressing Explain again with the same number carries on.
**Why:** loans are talked about in years and papers count months. It's the
mistake most likely to produce a confidently wrong answer.
**Rejected:** blocking anything under 12 (short loans exist); saying nothing.
