import SiteVisitForm from "./SiteVisitForm.jsx";
import { TRUST } from "../../data/content.js";
import "./Contact.css";

export default function Contact() {
  return (
    <section id="contact" className="section inverse">
      <div className="section-head">
        <h2>See it in person. We'll pick you up.</h2>
        <p>Free cab pickup for site visits. Choose a slot and a relationship manager will confirm on WhatsApp within 15 minutes.</p>
      </div>
      <div className="contact-grid">
        <div>
          <figure className="quote">
            <p className="stars" aria-label="Rated 5 out of 5">★★★★★</p>
            <blockquote>"They handed over our villa two weeks early. The weekly photo updates meant we never had to chase anyone. We watched every wall go up from Dubai."</blockquote>
            <figcaption><span className="avatar" aria-hidden="true">RK</span><span><b>Ramesh & Kavya</b><small>Palm Grove Villas · Moved in 2025</small></span></figcaption>
          </figure>
          <ul className="trust">{TRUST.map((t) => <li key={t.big}><b>{t.big}</b>{t.small}</li>)}</ul>
        </div>
        <SiteVisitForm />
      </div>
    </section>
  );
}
