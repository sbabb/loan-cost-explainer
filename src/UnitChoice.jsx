// "Months | Years" (or "Payments | Years" for a loan someone already has -
// the word on their papers) for the loan length. Two real radio buttons styled as one
// switch, so they work like any radio group: Tab reaches the chosen one,
// arrow keys move between them, and a screen reader says "Years, radio
// button, 2 of 2". Named by the loan length label (labelledBy).
export default function UnitChoice({ id, value, onChange, labelledBy, monthsLabel = 'Months' }) {
  const units = [
    { id: 'months', label: monthsLabel },
    { id: 'years', label: 'Years' },
  ]
  return (
    <div className="unit-choice" role="radiogroup" aria-labelledby={labelledBy}>
      {units.map((unit) => (
        <span key={unit.id}>
          <input
            type="radio"
            id={`${id}-${unit.id}`}
            name={`${id}-unit`}
            value={unit.id}
            checked={value === unit.id}
            onChange={() => onChange(unit.id)}
          />
          <label htmlFor={`${id}-${unit.id}`}>{unit.label}</label>
        </span>
      ))}
    </div>
  )
}
