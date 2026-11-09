import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Badge @keyframes (pulse, sweep, orbit, typing, marquee, …) referenced by the
// generated @vexillum/badges components. Imported AFTER index.css so these
// definitions win the cascade over any same-named Tailwind built-ins (e.g.
// spin/pulse) — without it, kinetic collection previews render statically.
import "@vexillum/badges/keyframes.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
