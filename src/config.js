// Global configuration for BMS Mastery.
// Mirrors the Viszio HVAC config so the two sister apps behave consistently.

// --- Access gate ----------------------------------------------------------
// A shared access-code lock. While ACCESS_GATE_ENABLED is true, visitors must
// enter the code once before they can use the app — useful for a private beta.
//
// This is a deterrent, not hard security: a static site ships all of its
// content to the browser, so a determined person could still extract it.
//
// To turn the gate OFF, set ACCESS_GATE_ENABLED to false.
// To change the code, run:  node scripts/make-access-code.mjs "new code"
// then paste the printed hash into ACCESS_CODE_HASH below.
export const ACCESS_GATE_ENABLED = true;
export const ACCESS_CODE_HASH =
  'fedcce2663431e25ebb785b5a7173979a1b3e8e4113ccf4ca2aedd36428a96b7';

// --- Usage analytics ------------------------------------------------------
// Anonymous, cookieless, aggregate analytics via GoatCounter. It records NO
// personal data, NO accounts, NO cookies — only aggregate event counts.
//
// This shares the Viszio HVAC GoatCounter site (viszio.goatcounter.com) so
// both sister apps report into one dashboard. Every BMS Mastery event is
// tagged with EVENT_PREFIX ('bms:') so it stays separable from Viszio events.
export const ANALYTICS = {
  enabled: true,
  provider: 'goatcounter',
  site: 'viszio',
};

// Prefix applied to every BMS Mastery analytics event.
export const EVENT_PREFIX = 'bms:';

export const APP_NAME = 'BMS Mastery';
