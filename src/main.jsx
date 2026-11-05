import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// global styles first, so component styles (imported inside App) can override them
import "./styles/global.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
