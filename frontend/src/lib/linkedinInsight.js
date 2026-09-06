/**
 * LinkedIn Insight Tag · consent-gated, inert bis Partner-ID.
 *
 * ───────────────────────────────────────────────────────────────────
 * SCHARFSCHALTEN: LINKEDIN_PARTNER_ID (Campaign Manager → Analysieren →
 * Insight Tag, 6–8 Ziffern) und LINKEDIN_LEAD_CONVERSION_ID (Conversion
 * „Webinar-Lead" anlegen → ID) eintragen. Solange die Platzhalter stehen,
 * wird kein Skript geladen. Siehe docs/gtm/LINKEDIN_ADS_WEBINAR.md §4.
 * ───────────────────────────────────────────────────────────────────
 *
 * Gleiche Regeln wie lib/metaPixel.js: lädt nur bei
 * `lo_consent_v1.marketing === true`, kein <noscript>-Bild, kein PII.
 * LinkedIn hat keine Server-Seite wie Metas Conversions API im Einsatz —
 * die Lead-Conversion kommt nur aus dem Browser und nur mit Consent.
 */
import { readConsent } from './consent';

export const LINKEDIN_PARTNER_ID = 'XXXXXXX';          // ← Partner-ID
export const LINKEDIN_LEAD_CONVERSION_ID = 'XXXXXXX';  // ← Conversion-ID „Webinar-Lead"

const CONFIGURED = /^\d{6,10}$/.test(LINKEDIN_PARTNER_ID);
let loaded = false;

export const isLinkedInActive = () => CONFIGURED && loaded;

/** Idempotent. Läuft beim Boot und bei jeder Consent-Änderung. */
export const maybeInitLinkedIn = () => {
  if (!CONFIGURED || loaded || typeof window === 'undefined') return;
  if (!readConsent()?.marketing) return;
  loaded = true;

  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
  if (!window.lintrk) {
    window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
    window.lintrk.q = [];
  }
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  const first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(s, first);
};

/** Conversion melden (Webinar-Lead). Gibt true zurück, wenn der Tag aktiv war. */
export const trackLinkedInLead = () => {
  if (!isLinkedInActive() || typeof window.lintrk !== 'function') return false;
  if (!/^\d{6,10}$/.test(LINKEDIN_LEAD_CONVERSION_ID)) return false;
  try {
    window.lintrk('track', { conversion_id: Number(LINKEDIN_LEAD_CONVERSION_ID) });
    return true;
  } catch {
    return false;
  }
};
