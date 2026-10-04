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

// Dismiss pre-hydration HTML splash screen smoothly after React mounts
const splash = document.getElementById('pwa-splash');
if (splash) {
  setTimeout(() => {
    splash.classList.add('loaded');
    setTimeout(() => {
      splash.remove();
    }, 400);
  }, 100);
}

