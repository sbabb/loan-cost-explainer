// Checks how typed text becomes numbers (src/checkInputs.js) and how numbers
// become words and dates (src/format.js). Run with: npm run verify:inputs
// A wrong parse is as bad as wrong math: "25,000" must be 2,500,000 cents.
import { parseMoney, parseRate, parseWhole, checkInputs, groupThousands, caretAfterGrouping } from '../src/checkInputs.js'
import { money, addMonths, monthYear, shortMonthYear, nextMonth, duration } from '../src/format.js'

let failures = 0
function check(label, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) return
  failures += 1
  console.error(`FAIL ${label}: got ${a}, expected ${e}`)
}

// 1. Money, exactly, the ways people type it.
check('plain', parseMoney('25000'), 2500000)
check('commas', parseMoney('25,000'), 2500000)
check('dollar sign and spaces', parseMoney(' $25,000 '), 2500000)
check('cents', parseMoney('25,000.50'), 2500050)
check('one decimal', parseMoney('99.9'), 9990)
check('no float drift', parseMoney('0.29'), 29)
check('three decimals rejected', parseMoney('1.234'), null)
check('words rejected', parseMoney('25k'), null)
check('empty rejected', parseMoney(''), null)

// 2. Rates and whole numbers.
check('rate', parseRate('6.49'), 6.49)
check('rate with %', parseRate('6.49%'), 6.49)
check('rate leading dot', parseRate('.5'), 0.5)
check('rate zero', parseRate('0'), 0)
check('rate words rejected', parseRate('six'), null)
check('whole', parseWhole(' 60 '), 60)
check('whole rejects decimals', parseWhole('60.5'), null)

// 3. Words and dates.
check('money with cents', money(434218), '$4,342.18')
check('money drops .00', money(2500000), '$25,000')
check('money zero', money(0), '$0')
check('payment 60 from Nov 2026', addMonths({ month: 10, year: 2026 }, 59), { month: 9, year: 2031 })
check('payment 54 from Nov 2026', addMonths({ month: 10, year: 2026 }, 53), { month: 3, year: 2031 })
check('December rolls over', addMonths({ month: 11, year: 2026 }, 1), { month: 0, year: 2027 })
check('month name', monthYear({ month: 9, year: 2031 }), 'October 2031')
check('short month name', shortMonthYear({ month: 3, year: 2031 }), 'Apr 2031')
check('next month from October', nextMonth(new Date(2026, 9, 4)), { month: 10, year: 2026 })
check('next month from December', nextMonth(new Date(2026, 11, 31)), { month: 0, year: 2027 })
check('duration years', duration(60), '5 years')
check('duration mixed', duration(18), '1 year and 6 months')
check('duration months', duration(1), '1 month')

// 4. The whole form.
const today = new Date(2026, 9, 4)
const good = { amount: '25,000', rate: '6.49', term: '60', month: '10', year: '2026' }

const ok = checkInputs(good, { hasIt: true, today })
check('good loan', ok.loan, {
  amountCents: 2500000, yearlyRatePercent: 6.49, termMonths: 60, firstPayment: { month: 10, year: 2026 },
})
check('good loan, no errors', ok.errors, {})

const deciding = checkInputs({ ...good, month: '', year: '' }, { hasIt: false, today })
check('still deciding needs no date', deciding.loan && deciding.loan.firstPayment, null)

const empty = checkInputs({ amount: '', rate: '', term: '', month: '', year: '' }, { hasIt: true, today })
check('empty form: every field named', Object.keys(empty.errors), ['amount', 'rate', 'term', 'month', 'year'])
check('empty form: no loan', empty.loan, null)
check('empty amount wording, have it', empty.errors.amount, 'Enter how much you borrowed, like 25,000.')
check('empty amount wording, deciding',
  checkInputs({ ...good, amount: '' }, { hasIt: false, today }).errors.amount,
  'Enter how much you want to borrow, like 25,000.')

const years = checkInputs({ ...good, term: '5' }, { hasIt: true, today })
check('5 looks like years', years.termCheck, { typed: 5, asMonths: 60 })
check('5 is not an error', years.errors, {})
check('5 stops the form', years.loan, null)
const kept = checkInputs({ ...good, term: '5', year: '2026' }, { hasIt: true, shortTermOk: 5, today })
check('5 again carries on', kept.loan && kept.loan.termMonths, 5)

check('rate too high', checkInputs({ ...good, rate: '64.9' }, { hasIt: true, today }).errors.rate,
  'Enter a rate of 40% or less.')
check('0% is fine', checkInputs({ ...good, rate: '0' }, { hasIt: true, today }).loan.yearlyRatePercent, 0)
check('two-digit year', checkInputs({ ...good, year: '24' }, { hasIt: true, today }).errors.year,
  'Enter the year as 4 numbers, like 2024.')
check('already paid off', checkInputs({ ...good, year: '2015' }, { hasIt: true, today }).errors.year,
  'With 60 payments starting in November 2015, this loan would already be paid off. ' +
  'Check the date and the number of payments.')
check('last payment this month is fine',
  checkInputs({ ...good, month: '10', year: '2021' }, { hasIt: true, today }).errors, {})

// 5. Commas while typing, and where the cursor ends up.
check('commas added', groupThousands('10000'), '10,000')
check('commas moved', groupThousands('1,0000'), '10,000')
check('millions', groupThousands('1234567'), '1,234,567')
check('cents kept', groupThousands('25000.5'), '25,000.5')
check('dot while typing', groupThousands('25000.'), '25,000.')
check('small number untouched', groupThousands('999'), '999')
check('empty stays empty', groupThousands(''), '')
check('dollar sign dropped (the box shows one)', groupThousands('$5000'), '5,000')
check('10k left alone, not turned into 10', groupThousands('10k'), '10k')
check('two dots left alone', groupThousands('1.2.3'), '1.2.3')
check('grouped text still parses', parseMoney(groupThousands('1234567.89')), 123456789)
// Typing the 5th digit of 10000: cursor was after "1000" + new "0" -> after all 5 digits.
check('cursor after typing at the end', caretAfterGrouping('10,000', '10000'), 6)
// Typing a 7 into the middle of "10,000" -> "107,000"... cursor after the 7.
check('cursor after typing in the middle', caretAfterGrouping('107,000', '107'), 3)
check('cursor at the start', caretAfterGrouping('10,000', ''), 0)

// 6. Loan length in years.
const yearsLoan = checkInputs({ ...good, term: '30', termUnit: 'years' }, { hasIt: false, today })
check('30 years is 360 months', yearsLoan.loan && yearsLoan.loan.termMonths, 360)
check('years: no years-as-months check',
  checkInputs({ ...good, term: '5', termUnit: 'years' }, { hasIt: false, today }).termCheck, null)
check('years: empty wording',
  checkInputs({ ...good, term: '', termUnit: 'years' }, { hasIt: false, today }).errors.term,
  'Enter the loan length in years, like 5.')
check('years: part years',
  checkInputs({ ...good, term: '2.5', termUnit: 'years' }, { hasIt: false, today }).errors.term,
  'Enter whole years, like 5. For part of a year, choose Months.')
check('years: too long',
  checkInputs({ ...good, term: '41', termUnit: 'years' }, { hasIt: false, today }).errors.term,
  'Enter 40 years or fewer.')
// A mortgage's Closing Disclosure says "Loan Term: 30 years".
check('have it: years too',
  checkInputs({ ...good, term: '30', termUnit: 'years' }, { hasIt: true, today }).loan.termMonths, 360)
check('have it: payments empty wording',
  checkInputs({ ...good, term: '' }, { hasIt: true, today }).errors.term, 'Enter the number of payments, like 60.')
check('have it: part years points to Payments',
  checkInputs({ ...good, term: '2.5', termUnit: 'years' }, { hasIt: true, today }).errors.term,
  'Enter whole years, like 5. For part of a year, choose Payments.')

if (failures > 0) {
  console.error(`\n${failures} input check(s) failed.`)
  process.exit(1)
}
console.log('Inputs verified: parsing, wording, dates and the whole form.')
