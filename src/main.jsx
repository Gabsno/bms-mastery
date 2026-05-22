import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initAnalytics, trackEvent } from './lib/analytics.js';

// Start anonymous analytics as early as possible so access-gate and install
// events are captured.
initAnalytics();

// PWA install funnel — anonymous, no personal data. We only listen here; we do
// not call preventDefault, so the browser's native install prompt still works.
window.addEventListener('beforeinstallprompt', () => {
  trackEvent('install-prompted');
});
window.addEventListener('appinstalled', () => {
  trackEvent('install-accepted');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
