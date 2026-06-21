import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "@/index.css";
import App from "@/App";
import { bootstrapConsent, readConsent } from "@/lib/consent";
import { redirectAppRoutesToAppTier } from "@/lib/tierRedirect";

// Cross-tier guard — runs SYNCHRONOUSLY before anything else mounts.
// If a visitor hits an App route (e.g. /login, /dashboard, /auth/magic)
// on a Landing host (leader-os.de, leader-check.de), hard-redirect to
// the matching App host (leaderos.de, leadercheck.de). Doing this here
// instead of inside a useEffect avoids the brief flash of a non-functional
// LoginPage on the wrong origin. Auth, magic-link cookies, and OAuth
// callbacks must stay on a single origin to work.
if (redirectAppRoutesToAppTier()) {
  // Browser is navigating away — abort module init.
  // (React, Sentry, PostHog all stay un-booted on the wrong origin.)
} else {
  bootstrapConsent();

const consent = readConsent();
const replayConsented = Boolean(consent?.replays);
const analyticsConsented = Boolean(consent?.analytics);

// Host-based Sentry DSN selection. The same CRA bundle serves both surfaces,
// errors land in the correct project. Falls back to leader-os for preview,
// localhost, and anything else.
const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLeaderCheck = /(^|\.)leader-check\.de$/i.test(hostname);
const sentryDsn = isLeaderCheck
  ? process.env.REACT_APP_SENTRY_DSN_LEADER_CHECK
  : process.env.REACT_APP_SENTRY_DSN_LEADER_OS;

if (sentryDsn) {
  // Sentry error tracking is always on (Art. 6(1)(f) DSGVO — legitimate
  // interest in service stability, anonymized stacktraces, sendDefaultPii=false).
  // Session-Replay only activates when the user has explicitly consented.
  const integrations = [Sentry.browserTracingIntegration()];
  if (replayConsented) {
    integrations.push(
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    );
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.REACT_APP_SENTRY_ENV || "production",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: replayConsented ? 1.0 : 0,
    sendDefaultPii: false,
    integrations,
  });
}

// PostHog: late-init when the user toggles analytics consent ON without
// requiring a page reload. Dynamic import keeps it out of the critical-path
// bundle when consent is denied.
const maybeInitPostHog = () => {
  const key = process.env.REACT_APP_POSTHOG_KEY;
  if (!key) return;
  import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) return;
    const host = process.env.REACT_APP_POSTHOG_HOST || "https://eu.i.posthog.com";
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: true,
      persistence: "localStorage+cookie",
    });
  }).catch(() => { /* network blocked / extension blocked — silent */ });
};

if (analyticsConsented) maybeInitPostHog();

if (typeof window !== "undefined") {
  window.addEventListener("lo:consent", (e) => {
    const c = e?.detail || {};
    if (c.analytics) maybeInitPostHog();
  });
}

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
