import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "@/index.css";
import App from "@/App";

// ── Consent-aware tracker init ────────────────────────────────────────────
// PostHog + Sentry session-replay only fire when the user actively consented
// via the cookie banner. Sentry error tracking itself runs on a "functional"
// basis (Art. 6(1)(f) DSGVO, anonymized stacktraces, no PII).
const readConsent = () => {
  try {
    const raw = localStorage.getItem("lo_consent_v1");
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.v === 1 ? p : null;
  } catch {
    return null;
  }
};
const consent = readConsent();
const replayAllowed = Boolean(consent?.session_replay);
const analyticsAllowed = Boolean(consent?.analytics);

// Host-based DSN selection (existing behavior preserved).
const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLeaderCheck = /(^|\.)leader-check\.de$/i.test(hostname);
const sentryDsn = isLeaderCheck
  ? process.env.REACT_APP_SENTRY_DSN_LEADER_CHECK
  : process.env.REACT_APP_SENTRY_DSN_LEADER_OS;

if (sentryDsn) {
  const integrations = [Sentry.browserTracingIntegration()];
  if (replayAllowed) {
    integrations.push(Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }));
  }
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.REACT_APP_SENTRY_ENV || "production",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: replayAllowed ? 1.0 : 0,
    integrations,
  });
}

// Listen for late consent changes (user toggles in banner) → enable analytics
// without requiring a page reload.
if (typeof window !== "undefined") {
  window.addEventListener("lo:consent", (e) => {
    const c = e?.detail || {};
    if (c.analytics && !analyticsAllowed) {
      // Defer PostHog dynamic-import to avoid blocking critical-path bundle.
      import("posthog-js").then(({ default: posthog }) => {
        const key = process.env.REACT_APP_POSTHOG_KEY;
        const host = process.env.REACT_APP_POSTHOG_HOST || "https://eu.i.posthog.com";
        if (key && !posthog.__loaded) {
          posthog.init(key, { api_host: host, autocapture: false, capture_pageview: true });
        }
      }).catch(() => {});
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
