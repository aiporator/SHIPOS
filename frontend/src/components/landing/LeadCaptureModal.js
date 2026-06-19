import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../../lib/brandAssets';

const STORAGE_KEY = 'leader_os_lead_capture_seen_at';
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // one popup per visitor per week

/**
 * LeadCaptureModal — Apple-grade conversion popup.
 *
 * Triggers:
 *   1. Exit-intent on desktop (mouse leaves the top of viewport)
 *   2. Scroll depth > 50% on mobile (no exit-intent on touch)
 *   3. Both gated by 7-day localStorage cooldown
 *
 * On submit: writes the email via the existing `/api/leader-check/intent`
 * lifecycle endpoint (proxied to Emergent) and PostHog identify+capture
 * so the lead is never lost. Then redirects to leadercheck.de (the
 * Emergent diagnose-app) — that is the actual conversion surface.
 * Either way, the visitor lands on /thank-you so the funnel is clean.
 *
 * DOMAIN-TOPOLOGY (see docs/DOMAIN_TOPOLOGY.md):
 *   leader-check.de    = THIS Vercel marketing landing (where popup fires)
 *   leadercheck.de     = Emergent app target (where diagnose actually runs)
 */
export const LeadCaptureModal = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const triggered = useRef(false);
  const navigate = useNavigate();

  // Should we show at all this session?
  const eligible = () => {
    if (typeof window === 'undefined') return false;
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      return Date.now() - last > COOLDOWN_MS;
    } catch {
      return true;
    }
  };

  // Arm exit-intent + scroll-depth triggers
  useEffect(() => {
    if (!eligible()) return undefined;

    const trigger = () => {
      if (triggered.current) return;
      triggered.current = true;
      setOpen(true);
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    };

    const onMouseLeave = (e) => {
      if (e.clientY <= 0) trigger();
    };

    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct > 0.5) trigger();
    };

    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const close = () => setOpen(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = (email || '').trim();
    if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setSubmitting(true);
    setError('');

    // Belt-and-braces lead capture: PostHog (always works if loaded) is
    // the primary store of the email so the lead is never lost; the
    // backend endpoint is a secondary persistence layer (Supabase
    // incomplete_attempts) that runs best-effort.
    if (typeof window !== 'undefined' && window.posthog?.capture) {
      try {
        window.posthog.identify(trimmed.toLowerCase());
        window.posthog.capture('lead_captured', {
          email: trimmed,
          source: 'landing-popup',
          campaign: 'leader-os-launch',
          surface: 'leader-os',
        });
      } catch { /* posthog errors never block UX */ }
    }

    try {
      await fetch('/api/leader-check/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          source: 'landing-popup',
          campaign: 'leader-os-launch',
        }),
        keepalive: true,
      });
    } catch { /* swallow — funnel continues */ }

    // Hand the visitor off to the thank-you state, then to the
    // leader-check.de funnel where they continue the diagnose flow.
    navigate(`/thank-you?email=${encodeURIComponent(trimmed)}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-[#0A0A0A]/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      onClick={close}
      data-testid="lead-capture-modal"
    >
      <div
        className="relative w-full max-w-lg bg-background text-foreground border-2 border-foreground/20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line — same lime detail as PR #85's tier cards */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand" aria-hidden />

        {/* Specimen header */}
        <div className="flex items-center justify-between px-7 md:px-9 pt-6 pb-3 mb-0 border-b border-foreground/12">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55 font-mono">
            BIB · 0001 · KLASSE 0001
          </span>
          <button
            onClick={close}
            aria-label="Schließen"
            className="text-foreground/40 hover:text-foreground text-xl leading-none font-mono w-8 h-8 flex items-center justify-center hover:bg-foreground/5 transition-colors"
            data-testid="lead-modal-close"
          >
            ×
          </button>
        </div>

        <div className="px-7 md:px-9 py-7 md:py-8">
          {/* Wlad-Greeting — gleiche persönliche Anker wie auf leader-check */}
          <div className="flex items-center gap-3 mb-5">
            <img
              src={WLAD_AVATAR}
              onError={withFallback(WLAD_AVATAR_FALLBACKS)}
              alt="Wlad Jachtchenko"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-brand/50 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.4)]"
            />
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand font-mono">
                ▸ WLAD JACHTCHENKO
              </p>
              <p className="text-[11px] text-foreground/65 mt-0.5">
                „Lass uns kurz schauen wo du stehst."
              </p>
            </div>
          </div>

          <h2
            id="lead-modal-title"
            className="text-[38px] md:text-[48px] leading-[0.92] tracking-[-0.04em] text-foreground"
            style={{
              fontFamily: 'Outfit, Inter, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
            }}
          >
            30 Tage.<br />
            <span className="text-foreground/55">Neues Du</span>
            <span className="text-brand not-italic">.</span>
          </h2>

          <p className="mt-5 text-[14.5px] leading-[1.55] text-foreground/75">
            Erst die kostenlose 5-Min-Diagnose — KI · Rhetorik · EQ.
            Dann der 30-Tage Sprint, der das verändert was im Score
            schwach war. <span className="text-foreground font-bold">11 Frameworks. Tägliche Drills. WladBot 24/7.</span>
          </p>

          {/* 3-Schritt-Mini-Strip */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-y border-foreground/10 py-3">
            {[
              ['01', '5 MIN', 'Diagnose'],
              ['02', '997 €', '30-T Sprint'],
              ['03', 'BIB', 'Zertifikat'],
            ].map(([nr, val, label]) => (
              <div key={nr} className="text-center">
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand font-mono">▸ {nr}</div>
                <div
                  className="mt-1 text-[14px] leading-none text-foreground"
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontStyle: 'italic' }}
                >
                  {val}
                </div>
                <div className="text-[9px] uppercase tracking-[0.16em] text-foreground/45 font-mono mt-1">{label}</div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55 mb-2 font-mono">
                DEINE E-MAIL
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dein.name@firma.de"
                required
                autoFocus
                className="w-full px-4 py-3.5 bg-transparent border border-foreground/25 focus:border-brand focus:outline-none text-foreground text-[15px] transition-colors"
                data-testid="lead-modal-email"
              />
            </label>

            {error && (
              <p className="text-[12px] text-red-600 dark:text-red-400 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-4 bg-brand text-[#0A0A0A] text-[13px] font-bold uppercase tracking-[0.14em] hover:brightness-105 active:translate-y-px transition-all disabled:opacity-60 shadow-[0_12px_30px_-12px_rgba(191,255,0,0.5)]"
              data-testid="lead-modal-submit"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0A0A] text-brand text-base font-black leading-none" aria-hidden>+</span>
              {submitting ? 'Wird gestartet…' : 'Diagnose starten · kostenlos'}
            </button>
          </form>

          <p className="mt-5 text-[10.5px] uppercase tracking-[0.22em] font-bold text-foreground/45 font-mono text-center">
            KEIN SPAM · KEIN ABO · 14 TAGE GELD-ZURÜCK
          </p>
        </div>
      </div>
    </div>
  );
};
