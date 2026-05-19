/**
 * Cookie / Tracking consent management for GDPR + TTDSG compliance.
 *
 * Defaults to "no consent" on first visit. PostHog opt-out is enforced
 * immediately on load; opt-in only after explicit "Accept all" or
 * "Accept analytics" choice. Sentry error tracking is enabled on
 * legitimate-interest basis (Art. 6(1)(f) DSGVO) but session replays
 * are gated on consent.
 *
 * Consent shape (localStorage key "consent_v1"):
 *   { version: 1, ts: 1734556800, essential: true, analytics: bool, replays: bool }
 *
 * essential is always true (functional cookies for login, etc).
 * analytics gates PostHog event capture + session recording.
 * replays gates Sentry session replays specifically.
 */

const KEY = 'consent_v1';

export function readConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(consent) {
  const value = {
    version: 1,
    ts: Math.floor(Date.now() / 1000),
    essential: true,
    analytics: !!consent.analytics,
    replays: !!consent.replays,
  };
  localStorage.setItem(KEY, JSON.stringify(value));
  applyConsent(value);
  window.dispatchEvent(new CustomEvent('consent-changed', { detail: value }));
  return value;
}

export function hasConsent() {
  return readConsent() !== null;
}

/**
 * Apply consent decisions to live SDKs.
 * Called on first load and whenever the user changes preferences.
 */
export function applyConsent(consent) {
  // PostHog: respect opt-out by default until user accepts analytics
  if (typeof window !== 'undefined' && window.posthog) {
    if (consent.analytics) {
      try { window.posthog.opt_in_capturing(); } catch (e) { /* noop */ }
    } else {
      try { window.posthog.opt_out_capturing(); } catch (e) { /* noop */ }
    }
  }
  // Sentry: error tracking always on (legitimate interest), but replay only with consent.
  // We can't disable replay post-init easily; the init code reads consent at boot.
  // No-op here — gating happens in src/index.js Sentry.init call.
}

/**
 * Bootstrap consent on page load. Call once from src/index.js BEFORE
 * the React app mounts. Returns the current consent (or a "no consent yet"
 * stub used for initial SDK gating).
 */
export function bootstrapConsent() {
  const existing = readConsent();
  if (existing) {
    applyConsent(existing);
    return existing;
  }
  // No consent yet — opt out PostHog immediately so the inline init's
  // session_recording doesn't capture anything.
  applyConsent({ analytics: false, replays: false, essential: true });
  return null;
}
