/** Labelled range slider whose filled track follows the value. */
export default function RangeField({ id, label, value, min, max, step = 1, display, minLabel, maxLabel, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="range-field">
      <div className="range-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        style={{ "--p": `${pct}%` }} onChange={(e) => onChange(Number(e.target.value))} />
      {(minLabel || maxLabel) && <div className="range-ends"><span>{minLabel}</span><span>{maxLabel}</span></div>}
    </div>
  );
}
