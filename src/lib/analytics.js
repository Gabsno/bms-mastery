import { ANALYTICS, EVENT_PREFIX } from '../config.js';

// Anonymous, cookieless usage analytics (GoatCounter). No personal data, no
// cookies — only aggregate event counts. Mirrors the Viszio HVAC analytics
// module so the two apps report consistently into one shared dashboard.

let started = false;

/** Inject the GoatCounter script once. Safe to call when disabled. */
export function initAnalytics() {
  if (started || !ANALYTICS.enabled || !ANALYTICS.site) return;
  started = true;
  const s = document.createElement('script');
  // GoatCounter — disable the automatic on-load count; we send our own events.
  s.src = 'https://gc.zgo.at/count.js';
  s.async = true;
  s.setAttribute(
    'data-goatcounter',
    `https://${ANALYTICS.site}.goatcounter.com/count`,
  );
  s.setAttribute('data-goatcounter-settings', '{"no_onload":true}');
  document.head.appendChild(s);
}

/**
 * Record an anonymous action event (a lesson started, a quiz completed, etc.).
 * The given name is tagged with EVENT_PREFIX ('bms:') so BMS Mastery events
 * stay separable from Viszio HVAC events in the shared GoatCounter dashboard.
 * No personal data is ever sent.
 */
export function trackEvent(name) {
  if (!ANALYTICS.enabled || !ANALYTICS.site) return;
  const path = `${EVENT_PREFIX}${name}`;
  window.goatcounter?.count?.({ path, title: path, event: true });
}
