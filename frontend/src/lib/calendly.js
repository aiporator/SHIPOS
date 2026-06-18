/**
 * Strategy-Call Helper — Cal.com (NICHT Calendly).
 *
 * Iter 92.9 (Mert): wir haben Calendly komplett verlassen. Alle "Termin
 * buchen" CTAs landen jetzt auf cal.com/leaderos/beratung — das gleiche
 * 15-Min Strategiegespräch (unverbindlich, 1:1 mit Wlads Team), aber jetzt
 * in unserer eigenen Pipeline.
 *
 * Public-utility-style export (NICHT hook-based) damit auch nicht-React
 * Helpers (z.B. analytics events, email-callbacks) sie aufrufen können.
 * Wenn du innerhalb React bist, bevorzuge `useBookConsultation()` aus
 * `components/brand/BookConsultationButton.js` — das öffnet das Cal-Modal
 * mit AuthContext-Prefill direkt in der App, kein neuer Tab nötig.
 */
const CAL_LINK = 'leaderos/beratung';
const CAL_NAMESPACE = 'beratung';
const CAL_URL = `https://cal.com/${CAL_LINK}`;

const tryOpenModal = (prefill) => {
  if (typeof window === 'undefined') return false;
  const cal = window.Cal?.ns?.[CAL_NAMESPACE];
  if (!cal) return false;
  try {
    cal('modal', {
      calLink: CAL_LINK,
      config: {
        layout: 'month_view',
        theme: 'dark',
        ...(prefill ? { name: prefill.name, email: prefill.email } : {}),
      },
    });
    return true;
  } catch {
    return false;
  }
};

const buildTabUrl = (utmSource, prefill) => {
  const params = new URLSearchParams();
  if (utmSource) params.set('utm_source', utmSource);
  if (prefill?.email) params.set('email', prefill.email);
  if (prefill?.name) params.set('name', prefill.name);
  const qs = params.toString();
  return qs ? `${CAL_URL}?${qs}` : CAL_URL;
};

export const openStrategyCall = (utmSource = 'wladbot', prefill = undefined) => {
  if (tryOpenModal(prefill)) return;
  window.open(buildTabUrl(utmSource, prefill), '_blank', 'noopener,noreferrer');
};

// Backwards-compat: same Cal-link for head-coach paths.
export const openHeadCoachCall = (utmSource = 'wladbot', prefill = undefined) =>
  openStrategyCall(utmSource, prefill);

export const STRATEGY_CALL_URL = CAL_URL;
export const HEAD_COACH_URL = CAL_URL;
