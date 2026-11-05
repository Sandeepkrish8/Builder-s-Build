import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import Icon from "../common/Icon.jsx";
import "./Navbar.css";

const LINKS = [
  ["#home", "Home"], ["#projects", "Projects"], ["#units", "Floor Plans"],
  ["#calculators", "Calculators"], ["#progress", "Site Progress"], ["#contact", "Contact"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "nav--solid" : ""} ${open ? "nav--open" : ""}`}>
      <a className="logo" href="#home" aria-label="Urbanstone home"><span className="logo-mark">U</span>Urbanstone</a>
      <nav id="site-menu" className="nav-links" aria-label="Main">
        {LINKS.map(([href, text]) => <a key={href} href={href} onClick={() => setOpen(false)}>{text}</a>)}
        <a className="btn btn-gold nav-menu-cta" href="#contact" onClick={() => setOpen(false)}>Book Site Visit</a>
      </nav>
      <div className="nav-right">
        <ThemeToggle />
        <a className="btn btn-gold nav-cta" href="#contact">Book Site Visit</a>
        <button type="button" className="nav-burger" aria-expanded={open} aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>
    </header>
  );
}
