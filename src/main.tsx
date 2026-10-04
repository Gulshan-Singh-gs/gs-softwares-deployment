import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/pwa/installPrompt'; // Earliest beforeinstallprompt capture
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Dismiss pre-hydration splash screen smoothly once the favicon sequence finishes
const splash = document.getElementById('pwa-splash');
if (splash) {
  const img = splash.querySelector('.splash-favicon');
  const dismiss = () => {
    splash.classList.add('loaded');
    setTimeout(() => {
      splash.remove();
    }, 300);
  };

  if (img) {
    img.addEventListener('animationend', dismiss, { once: true });
    // Safety fallback in case animationend is skipped or reduced motion
    setTimeout(dismiss, 1400);
  } else {
    setTimeout(dismiss, 400);
  }
}

