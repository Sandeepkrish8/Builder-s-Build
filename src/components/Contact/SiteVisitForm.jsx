import { useId, useState } from "react";
import Icon from "../common/Icon.jsx";
import { PROJECTS } from "../../data/projects.js";
import { VISIT_SLOTS } from "../../data/content.js";
import { validateVisit } from "../../lib/validation.js";

const EMPTY = { name: "", phone: "", project: PROJECTS[0].name, budget: "₹ 90 L – 1.3 Cr", date: "", slot: "", cab: false };

export default function SiteVisitForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [booked, setBooked] = useState(null);
  const uid = useId();

  // one change handler for every input, keyed by the input's name
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validateVisit(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    // No backend yet: in production this would POST to an API or a CRM.
    setBooked(form);
  };

  if (booked) {
    const msg = encodeURIComponent(`Hi, I booked a site visit for ${booked.project} on ${booked.date} at ${booked.slot}.`);
    return (
      <div className="vform vdone" role="status">
        <span className="vdone-ico"><Icon name="check" size={28} /></span>
        <h3>Visit requested!</h3>
        <p>Thanks {booked.name.trim()}. We'll confirm <b>{booked.project}</b> on <b>{booked.date}</b> at <b>{booked.slot}</b> on WhatsApp within 15 minutes.</p>
        <div className="vdone-actions">
          <a className="btn btn-gold" href={`https://wa.me/919876543210?text=${msg}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>
          <button type="button" className="btn btn-line" onClick={() => { setBooked(null); setForm(EMPTY); }}>Book another visit</button>
        </div>
      </div>
    );
  }

  const field = (name) => ({
    id: `${uid}-${name}`, name, value: form[name], onChange: update,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-err` : undefined,
  });
  // a plain function, not a component defined inside render (that would remount on every render)
  const err = (name) => errors[name] ? <small id={`${uid}-${name}-err`} className="verr">{errors[name]}</small> : null;
  const now = new Date(); // local date, not UTC, so "today" is right in India after midnight
  const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <form className="vform" onSubmit={submit} noValidate>
      <h3>Schedule your visit</h3>
      <p className="vsub">Takes less than a minute.</p>
      <div className="vgrid">
        <div className="vfield"><label htmlFor={`${uid}-name`}>Full name</label><input {...field("name")} autoComplete="name" placeholder="Your name" />{err("name")}</div>
        <div className="vfield"><label htmlFor={`${uid}-phone`}>Mobile</label><input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" />{err("phone")}</div>
        <div className="vfield"><label htmlFor={`${uid}-project`}>Project</label>
          <select {...field("project")}>{PROJECTS.map((p) => <option key={p.id}>{p.name}</option>)}</select></div>
        <div className="vfield"><label htmlFor={`${uid}-budget`}>Budget</label>
          <select {...field("budget")}>{["Under ₹ 90 L", "₹ 90 L – 1.3 Cr", "₹ 1.3 – 2 Cr", "Above ₹ 2 Cr"].map((b) => <option key={b}>{b}</option>)}</select></div>
        <div className="vfield full"><label htmlFor={`${uid}-date`}>Preferred date</label><input {...field("date")} type="date" min={minDate} />{err("date")}</div>
      </div>
      <fieldset className="vslots" aria-describedby={errors.slot ? `${uid}-slot-err` : undefined}>
        <legend>Time slot</legend>
        {VISIT_SLOTS.map((s) => (
          <label key={s} className={`vslot ${form.slot === s ? "on" : ""}`}>
            <input type="radio" name="slot" value={s} checked={form.slot === s} onChange={update} />{s}
          </label>
        ))}
        <label className={`vslot ${form.cab ? "on" : ""}`}><input type="checkbox" name="cab" checked={form.cab} onChange={update} />Need cab pickup</label>
        {err("slot")}
      </fieldset>
      <button type="submit" className="btn btn-dark vsubmit">Confirm site visit →</button>
    </form>
  );
}
