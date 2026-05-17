/**
 * PostHog identity helpers — matches the cross-platform email_lower contract
 * documented in CLAUDE.md / docs/SCHEMA.md.
 *
 * PostHog is loaded as an inline snippet in public/index.html, so `window.posthog`
 * is available globally. These helpers are defensive: they no-op if PostHog
 * isn't loaded (e.g. local dev, ad-blocked).
 */

function getPosthog() {
  if (typeof window === 'undefined') return null;
  return window.posthog && window.posthog.__SV ? window.posthog : null;
}

export function identifyByEmail(email) {
  const ph = getPosthog();
  if (!ph || !email) return;
  const emailLower = String(email).trim().toLowerCase();
  if (!emailLower) return;
  // `alias` merges the prior anonymous distinct_id into this person, so funnel
  // events captured before login still belong to the same PostHog person.
  ph.alias(emailLower);
  ph.identify(emailLower, { email: emailLower });
}

export function resetIdentity() {
  const ph = getPosthog();
  if (ph) ph.reset();
}

export function capture(event, props) {
  const ph = getPosthog();
  if (ph) ph.capture(event, props);
}
