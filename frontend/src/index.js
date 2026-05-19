import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "@/index.css";
import App from "@/App";
import { bootstrapConsent, readConsent } from "@/lib/consent";

// Bootstrap GDPR/TTDSG consent BEFORE any tracking SDK initializes.
// Defaults PostHog to opt-out until the user explicitly accepts in the banner.
bootstrapConsent();

// Host-based DSN selection: the same CRA bundle serves both surfaces, but
// errors land in the correct Sentry project. Both env vars are baked at
// build time; the hostname check picks one at runtime. Falls back to
// leader-os for previews, localhost, and anything else.
const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLeaderCheck = /(^|\.)leader-check\.de$/i.test(hostname);
const sentryDsn = isLeaderCheck
  ? process.env.REACT_APP_SENTRY_DSN_LEADER_CHECK
  : process.env.REACT_APP_SENTRY_DSN_LEADER_OS;

if (sentryDsn) {
  // Sentry error tracking always on (legitimate interest under Art. 6(1)(f) DSGVO
  // for security and stability). Session Replay only when the user has given
  // explicit consent in the cookie banner — gate the integration on consent.
  const consent = readConsent();
  const replayConsented = !!(consent && consent.replays);

  const integrations = [Sentry.browserTracingIntegration()];
  if (replayConsented) {
    integrations.push(
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })
    );
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.REACT_APP_SENTRY_ENV || "production",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: replayConsented ? 1.0 : 0,
    integrations,
    sendDefaultPii: false,
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
