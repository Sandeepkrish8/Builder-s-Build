import { useMemo, useState } from "react";
import RangeField from "../common/RangeField.jsx";
import { calcEmi, formatINR, formatLakhCr } from "../../lib/finance.js";

export default function EmiCalculator() {
  const [lakhs, setLakhs] = useState(95);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  // recompute only when an input changes
  const { emi, interest, principalShare } = useMemo(() => calcEmi(lakhs * 1e5, rate, years), [lakhs, rate, years]);
  const principalPct = Math.round(principalShare * 100);

  return (
    <div className="calc">
      <h3>Home Loan EMI Calculator</h3>
      <p className="calc-sub">Drag the sliders. Results update instantly.</p>
      <div className="calc-body">
        <div>
          <RangeField id="emi-amt" label="Loan amount" value={lakhs} min={10} max={300} display={`₹ ${lakhs} L`} minLabel="₹10 L" maxLabel="₹3 Cr" onChange={setLakhs} />
          <RangeField id="emi-rate" label="Interest rate" value={rate} min={6} max={14} step={0.1} display={`${rate.toFixed(1)} %`} minLabel="6%" maxLabel="14%" onChange={setRate} />
          <RangeField id="emi-yrs" label="Tenure" value={years} min={5} max={30} display={`${years} yrs`} minLabel="5 yrs" maxLabel="30 yrs" onChange={setYears} />
        </div>
        <div className="donut">
          <svg viewBox="0 0 42 42" width="180" height="180" aria-hidden="true">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--line)" strokeWidth="5" />
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${principalPct} ${100 - principalPct}`} strokeDashoffset="25" />
          </svg>
          <p className="donut-emi" aria-live="polite">{formatINR(emi)}</p>
          <p className="donut-label">Monthly EMI</p>
          <ul className="donut-split">
            <li><i className="dot-p" />Principal <b>{principalPct}%</b></li>
            <li><i className="dot-i" />Interest <b>{formatLakhCr(interest)}</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
