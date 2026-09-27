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
