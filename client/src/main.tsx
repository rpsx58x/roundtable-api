import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

if (!window.location.hash) {
  window.location.hash = "#/";
}

// Apply theme immediately to prevent flash
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", prefersDark);

createRoot(document.getElementById("root")!).render(<App />);
