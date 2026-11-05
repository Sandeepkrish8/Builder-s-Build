import { useMemo, useState } from "react";
import RangeField from "../common/RangeField.jsx";
import { COST_TIERS, estimateCost, formatINR, formatLakhCr } from "../../lib/finance.js";

export default function CostEstimator() {
  const [area, setArea] = useState(2400);
  const [tier, setTier] = useState("premium");
  const { total, months, breakdown } = useMemo(() => estimateCost(area, tier), [area, tier]);

  return (
    <div className="calc">
      <h3>House Construction Estimator</h3>
      <p className="calc-sub">For clients building on their own plot.</p>
      <RangeField id="cost-area" label="Built-up area" value={area} min={600} max={6000} step={50}
        display={`${area.toLocaleString("en-IN")} sq ft`} onChange={setArea} />
      <fieldset className="tiers">
        <legend className="sr-only">Quality level</legend>
        {COST_TIERS.map((t) => (
          <label key={t.id} className={`tier ${tier === t.id ? "on" : ""}`}>
            <input type="radio" name="tier" value={t.id} checked={tier === t.id} onChange={() => setTier(t.id)} />
            <b>{t.name}</b><span>{formatINR(t.rate)} / sq ft</span>
          </label>
        ))}
      </fieldset>
      <ul className="breakdown">
        {breakdown.map((b) => (
          <li key={b.label}>
            <span>{b.label}</span>
            <div className="bar"><i style={{ width: `${b.share * 100}%` }} /></div>
            <b>{formatLakhCr(b.amount)}</b>
          </li>
        ))}
      </ul>
      <div className="estimate">
        <p><small>Estimated total · about {months} months</small><b>{formatLakhCr(total)}</b></p>
        <a className="btn btn-gold" href="#contact">Get detailed quote</a>
      </div>
    </div>
  );
}
