import { ThemeProvider } from "./context/ThemeContext.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Projects from "./components/Projects/Projects.jsx";
import UnitSelector from "./components/UnitSelector/UnitSelector.jsx";
import Calculators from "./components/Calculators/Calculators.jsx";
import ProgressTracker from "./components/Progress/ProgressTracker.jsx";
import Contact from "./components/Contact/Contact.jsx";
import Footer from "./components/Footer/Footer.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <a className="skip-link" href="#projects">Skip to content</a>
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <UnitSelector />
        <Calculators />
        <ProgressTracker />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  );
}
