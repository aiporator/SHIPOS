/**
 * Calendly Strategiegespräch Helper
 * Ein zentraler Link für alle "Termin-buchen" CTAs.
 * Tausch die URL hier aus, sobald du den finalen Calendly/iClosed-Link hast.
 */
export const STRATEGY_CALL_URL = 'https://calendly.com/leader-os/strategiegespraech';
export const HEAD_COACH_URL = 'https://calendly.com/leader-os/headcoach';

export const openStrategyCall = (utmSource = 'wladbot') => {
  const url = `${STRATEGY_CALL_URL}?utm_source=${encodeURIComponent(utmSource)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const openHeadCoachCall = (utmSource = 'wladbot') => {
  const url = `${HEAD_COACH_URL}?utm_source=${encodeURIComponent(utmSource)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
