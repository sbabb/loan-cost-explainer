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

## 2026-10-04 - Three looks, to test whether style changes trust (replaced 2026-10-05)
The same screens, words and numbers in three looks: **Calm** (the original),
**Terminal** (Cadence's look: monospace, sharp corners, Tokyo Night / Catppuccin
Latte) and **Modern** (benchmarked on Stripe, Mercury and Linear: Geist,
indigo, soft shadows, rounded cards). A small "Look" switch sits at the top,
and a link like `?look=terminal` opens one directly for a research session.
**Why:** the research question is whether how a money tool looks changes
whether members trust the numbers. Only the look changes, so any difference
in what members say comes from the look. It also shows range.
**Rejected:** the latest macOS as the benchmark (its glass style struggles
with contrast over busy backgrounds, wrong for an accessible numbers tool); a
Linux-styled look (that's what Terminal already is); Windows 11.
**How:** every color, font, corner and shadow is a token in `src/looks.css`;
the screens never pick their own. `npm run verify` checks contrast in all
three looks, light and dark.
**Open question:** the switch is always visible, which suits a portfolio demo
and research sessions but not a real member. Decide before the case study
whether it stays, or only appears when the link names a look (`?look=`).
*Resolved 2026-10-05: one look only, so the switch is gone.*

## 2026-10-04 - Dark mode follows the device, no switch for it
Each look has a light and a dark version, chosen by the phone or computer's
own setting.
**Why:** someone checking their loan at night in dark mode shouldn't get a
white page, and nobody looks for a setting in a tool they use once.
**Rejected:** a light/dark toggle. (The Look switch is different: it's there
for the research comparison, not as a preference.)

## 2026-10-04 - Compare two offers, and say plainly which costs less
Two offers side by side. Reached two ways: a third answer on the start
screen ("I'm comparing two offers") and a "Compare with another offer"
button on a still-deciding result (that offer becomes offer A). The verdict
is in the heading: "Credit union would cost you $480.64 less in interest."
Then why ("It is paid off 1 year sooner, even though its rate is higher"),
and **the catch** when the cheaper loan has the higher monthly payment.
**Why:** the trap members fall into is the lower monthly payment - often a
dealer's longer loan. In the test case the dealer has the lower rate *and*
the lower payment, and still costs $480.64 more. Saying that out loud is
the whole point. "Costs less" means less interest (the Finance Charge): it's
the cost of borrowing even when the two offers lend different amounts.
**Rejected:** up to three offers (three columns of money don't fit a phone);
no verdict, just the facts (leaves members to untangle payment vs. cost);
comparing total paid (unfair when the amounts differ).

## 2026-10-04 - The first question becomes "Which sounds like you?"
Three answers: "I already have this loan", "I'm thinking about a loan",
"I'm comparing two offers".
**Why:** "Do you already have this loan?" can't take a third answer.
**Rejected:** keeping the yes/no question and hiding comparison on results
only (you chose both ways in).

## 2026-10-05 - Commas appear as you type an amount
"300000" shows as "300,000" while typing, with the cursor staying put.
Anything that isn't a plain number ("10k") is left as typed and the usual
"Enter the amount as a number" message catches it.
**Why:** six digits without commas are easy to misread by a factor of ten,
and members check what they typed. Rewriting "10k" to "10" would silently
make it a $10 loan - worse than an error.
**Rejected:** adding commas only when leaving the box (you can't check the
number while typing it).

## 2026-10-05 - Loan length in months or years, when deciding or comparing
A "Months | Years" switch above the loan length; months by default. A
30-year mortgage is "30 years", not "360". The note underneath translates
("That's 360 monthly payments").
**Why:** offers are quoted both ways - auto loans in months, mortgages in
years - and making people convert is the mistake the years check catches.
**Kept as payments:** "I already have this loan" asks for the Number of
Payments, because that's the number printed on the paperwork.
*Changed 2026-10-05:* existing loans get the switch too, as "Payments |
Years". A car loan's Truth in Lending Disclosure says "Number of Payments:
60", but a mortgage's Closing Disclosure says "Loan Term: 30 years" - so
both are words on someone's papers. Steven asked; it checked out.
**Rejected:** guessing the unit from the size of the number (is 30 months or
years?); whole years only.

## 2026-10-05 - One look: Modern, pushed further
Steven picked Modern; Calm, Terminal and the look switch are gone. Then
Modern was taken from "tidy" to "beautiful":
- **The answer is a dark statement card** with the interest as a large
  number that counts up when it appears - the one moment of drama, on the
  one number that matters. Screen readers get the sentence, not the count.
- **The money is drawn, not just stated.** One idea everywhere: a bar that is
  what you borrowed (quiet grey) plus the interest (indigo). Same picture for
  the whole loan, the first payment, the $50 what-if and two offers side by
  side - on one shared scale, so a longer bar really is more money.
- **Depth and polish:** a header with a small logo mark and "Step 2 of 3",
  start choices with icons, white cards with layered shadows over a soft
  indigo glow, a segmented Months/Years switch, a glowing focus ring, an
  indigo gradient button, Geist with Geist Mono for small labels.
- **Gentle motion** (screens rise in, bars grow, the number counts) - and
  none at all for anyone whose device asks for reduced motion.
**Why:** Steven's call - "it's a loan cost explainer, but why not make it
beautiful too?" Beauty here does a job: the bars make "the dealer costs more"
visible before a word is read, and the big number makes the answer
unmissable.
**Rules kept:** charts follow the dataviz guidance (interest in the accent,
borrowed as quiet context, values always written beside the bars, a table
for the exact numbers); 30 color pairs checked for contrast in light and
dark, including text over the answer card's glow.
**Rejected:** keeping three looks for a trust test - one strong look serves
the case study better than three diluted ones; glass/blur effects (contrast
over busy backgrounds); a chart library (a few divs do it, nothing to load).

## 2026-10-05 - "Finance beautiful": serif headlines, a statement card, a timeline
Pushed Modern further, on Steven's ask:
- **Instrument Serif for headlines** ("What does this loan *really* cost?"),
  Geist for everything you read or count. Money is never in the serif.
- **Money set like a finance app:** "$4,342" large, ".18" small and raised.
- **The answer card** gained depth: layered indigo/violet/teal light, fine
  graph-paper lines fading from one corner, a whisper of grain.
- **A payment timeline** across the whole loan: each payment split into
  interest and what pays down the loan, interest visibly shrinking. Drag or
  tap to read any month; on a keyboard it's a slider (arrows, Page Up/Down,
  Home/End) and a screen reader hears the same readout.
- **Numbered sections** (01, 02...) and mono labels, like a statement.
- **A new mark:** two discs - what you borrowed (indigo) with the interest
  peeking out behind it (lavender). Also the browser tab icon.
- **No tap flash:** the phone's square tap highlight is off; controls have
  their own rounded pressed states, and the Months/Years ring shows for
  keyboard focus only.
**Why:** a money tool people trust can still be a pleasure to use; the
timeline is the clearest picture of how a loan works.
**Rejected:** a serif for the numbers (money reads best in the sans - and
the dataviz guidance says the same for hero figures); the rising-bars mark
(read like a generic chart emoji).

## 2026-10-05 - Calmer headlines, a stroke, real colors in the charts
- **Newsreader instead of Instrument Serif.** Steven: the headline font
  looked "spooky" - Instrument Serif is condensed and sharp. Newsreader is a
  calm, normal-width editorial serif.
- **A gradient stroke on the answer card** - lavender top left, teal bottom
  right - so it reads as an object.
- **Indigo for what you borrowed, orange for interest.** The grey was "too
  neutral"; both bars and the timeline were hard to read. Warm reads as
  cost, and blue/orange stays apart for every type of color vision. Both
  pairs (light; dark and the answer card) pass every dataviz validator check,
  and the contrast check now holds both bar colors to 3:1. The timeline is
  two solid areas with a 2px gap, not washes.
**Rejected:** keeping grey as quiet context - it made the picture too faint
to read at a glance, which is the picture's only job.

## 2026-10-05 - Keep this loan, add another to compare
Every result ends with "Add another loan to compare" under "Start over". The
loan just explained becomes Loan A ("Your loan" if they have it); they add
Loan B. Comparison wording is now "loans", not "offers", since one may be a
loan they already have.
**Why:** Steven's ask - the natural next question after "what does this
cost?" is "what about this other one?".
**Honest limit:** comparing a loan you have with a new one, start to finish,
answers "which costs more overall" - not "should I refinance", which depends
on the interest left to pay. The comparison says so when Loan A is one they
have, and points to a payoff quote.
**Not done:** remembering loans after the page closes. Everything stays in
the page while it's open, so "nothing you type leaves this page" stays true
and nothing lingers on a shared phone.
