import { useTheme } from "../../context/ThemeContext.jsx";
import Icon from "../common/Icon.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const night = theme === "night";
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-pressed={night}
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}>
      <span className={night ? "" : "on"}><Icon name="sun" size={15} />Day</span>
      <span className={night ? "on" : ""}><Icon name="moon" size={15} />Night</span>
    </button>
  );
}
