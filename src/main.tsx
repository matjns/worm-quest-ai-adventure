import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Purge HR DOM-wide: Clean minimalism
document.addEventListener('DOMContentLoaded', () => {
  const hrs = document.querySelectorAll('hr');
  hrs.forEach(hr => {
    const divider = document.createElement('div');
    divider.className = 'section-divider';
    hr.parentNode?.replaceChild(divider, hr);
  });
  
  // Enhance spacing: Auto-margin sections
  const sections = document.querySelectorAll('section, .tab-content');
  sections.forEach(sec => {
    (sec as HTMLElement).style.marginBottom = '1.5rem';
    (sec as HTMLElement).style.padding = '1rem';
  });
});

createRoot(document.getElementById("root")!).render(<App />);
