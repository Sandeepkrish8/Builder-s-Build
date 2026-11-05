import Icon from "../common/Icon.jsx";
import "./Footer.css";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <a className="logo" href="#home"><span className="logo-mark">U</span>Urbanstone</a>
            <p>Premium apartments and villas in Bengaluru since 2001.</p>
          </div>
          <nav aria-label="Footer">
            <a href="#projects">Projects</a><a href="#units">Floor Plans</a><a href="#calculators">Calculators</a>
            <a href="#progress">Site Progress</a><a href="#contact">Contact</a>
          </nav>
          <address>
            12th Main, Indiranagar, Bengaluru 560038<br />
            <a href="tel:+919876543210">+91 98765 43210</a> · <a href="mailto:hello@urbanstone.example">hello@urbanstone.example</a>
          </address>
        </div>
        <p className="footer-legal">© {new Date().getFullYear()} Urbanstone Builders · RERA: PRM/KA/RERA/0000/000/PR/000000 (placeholder) · Prices and figures are indicative.</p>
      </footer>
      <a className="wa-float" href="https://wa.me/919876543210" target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp">
        <Icon name="whatsapp" size={30} />
      </a>
    </>
  );
}
