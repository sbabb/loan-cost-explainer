// Checks how typed text becomes numbers (src/checkInputs.js) and how numbers
// become words and dates (src/format.js). Run with: npm run verify:inputs
// A wrong parse is as bad as wrong math: "25,000" must be 2,500,000 cents.
import { parseMoney, parseRate, parseWhole, checkInputs } from '../src/checkInputs.js'
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

if (failures > 0) {
  console.error(`\n${failures} input check(s) failed.`)
  process.exit(1)
}
console.log('Inputs verified: parsing, wording, dates and the whole form.')
