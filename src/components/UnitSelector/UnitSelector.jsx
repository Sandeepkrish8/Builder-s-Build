import { useMemo, useState } from "react";
import FloorPlan from "./FloorPlan.jsx";
import Icon from "../common/Icon.jsx";
import { TOWER_IDS, UNIT_STATUS, floorsFor } from "../../data/units.js";
import { calcEmi, formatINR, formatLakhCr, unitPrice } from "../../lib/finance.js";
import "./UnitSelector.css";

const VIEWS = ["2D Plan", "3D Walkthrough", "360° Balcony View"];

export default function UnitSelector() {
  const [tower, setTower] = useState("B");
  const [selectedId, setSelectedId] = useState("B-1204");
  const floors = useMemo(() => floorsFor(tower), [tower]);

  // derive the selected unit from data instead of storing a copy of it in state
  const allUnits = floors.flatMap((f) => f.units);
  const unit = allUnits.find((u) => u.id === selectedId) ?? allUnits.find((u) => u.status === "a") ?? allUnits[0];
  const price = unitPrice(unit);
  const emi = calcEmi(price * 0.8, 8.5, 20).emi; // 80% loan, typical home-loan terms
  const sold = unit.status === "b";

  const changeTower = (id) => {
    setTower(id);
    const first = floorsFor(id).flatMap((f) => f.units).find((u) => u.status === "a");
    setSelectedId(first?.id);
  };

  return (
    <section id="units" className="section inverse">
      <div className="section-head">
        <h2>Pick your exact floor, unit and view.</h2>
        <p>Live availability for every flat. Click a unit to see its floor plan, carpet area, facing and price, then reserve it in one step.</p>
      </div>

      <div className="selector">
        <div className="spanel">
          <div className="stabs" role="tablist" aria-label="Towers">
            {TOWER_IDS.map((id) => (
              <button key={id} role="tab" type="button" aria-selected={tower === id} className="stab" onClick={() => changeTower(id)}>
                Tower {id}
              </button>
            ))}
          </div>
          <div className="slegend" aria-hidden="true">
            <span><i className="u-a" />Available</span><span><i className="u-h" />On hold</span><span><i className="u-b" />Sold</span>
          </div>
          <div className="sfloors">
            {floors.map(({ floor, units }) => (
              <div key={floor} className="sfloor">
                <span>Floor {floor}</span>
                {units.map((u) => (
                  <button key={u.id} type="button" className={`sunit u-${u.status}`} aria-pressed={u.id === unit.id}
                    aria-label={`Unit ${u.label}, ${u.bhk} BHK, ${UNIT_STATUS[u.status]}`} onClick={() => setSelectedId(u.id)}>
                    {u.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="spanel splan" aria-live="polite">
          <div>
            <div className="splan-svg"><FloorPlan bhk={unit.bhk} facing={unit.facing} /></div>
            <div className="sviews">
              {VIEWS.map((v, i) => (
                <button key={v} type="button" className="sview" aria-pressed={i === 0} disabled={i > 0} title={i > 0 ? "Coming soon" : undefined}>{v}</button>
              ))}
            </div>
          </div>
          <div className="sinfo">
            <p className={`sstatus u-${unit.status}`}>{UNIT_STATUS[unit.status]}</p>
            <h3>Unit {unit.tower}-{unit.label}</h3>
            <p className="ssub">{unit.bhk} BHK · {unit.facing} facing{unit.corner ? " · Corner unit" : ""}</p>
            <dl className="skv">
              <div><dt>Carpet area</dt><dd>{unit.carpet.toLocaleString("en-IN")} sq ft</dd></div>
              <div><dt>Super built-up</dt><dd>{unit.superArea.toLocaleString("en-IN")} sq ft</dd></div>
              <div><dt>Floor</dt><dd>{unit.floor} of {unit.totalFloors}</dd></div>
              <div><dt>Parking</dt><dd>{unit.bhk >= 3 ? "2 covered" : "1 covered"}</dd></div>
            </dl>
            <p className="sprice">{formatLakhCr(price)}</p>
            <p className="sprice-note">All-inclusive · EMI from {formatINR(emi)}/mo</p>
            <div className="sactions">
              <a className={`btn btn-gold ${sold ? "is-disabled" : ""}`} href="#contact" aria-disabled={sold}
                onClick={(e) => sold && e.preventDefault()}>{sold ? "Already sold" : "Reserve this unit"}</a>
              <a className="btn btn-ghost" href="#contact"><Icon name="download" size={16} /> Brochure & floor plan</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
