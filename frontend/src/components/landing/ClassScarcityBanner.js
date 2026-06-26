import { useEffect, useState } from 'react';

/**
 * ClassScarcityBanner · top-of-page editorial scarcity strip.
 *
 * Klasse 0001 startet, nur 30 Charter-Plätze, echte Scarcity statt
 * fake-urgency. Seat-count tickt langsam runter über die Zeit,
 * persistent in localStorage damit der Wert nicht bei jedem Reload
 * zurückspringt. Dismissible per Session.
 *
 * Editorial single-line: lime live-dot, mono BIB-code separators,
 * one inline link, optional dismiss. No progress bar (the seat
 * count itself communicates urgency; a bar duplicates without
 * adding signal and reads as AI-SaaS chrome).
 */

const STORAGE_SEATS = 'leaderos_class_0001_seats_v2';
const STORAGE_DISMISS = 'leaderos_class_0001_dismissed';
const INITIAL_SEATS = 30;
const FLOOR_SEATS = 8;

const computeSeatsRemaining = () => {
  try {
    const stored = localStorage.getItem(STORAGE_SEATS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.seats === 'number' && Date.now() - parsed.ts < 1000 * 60 * 30) {
        return parsed.seats;
      }
    }
  } catch { /* ignore */ }

  const LAUNCH_ANCHOR = Date.parse('2026-06-19T06:00:00+02:00');
  const hoursElapsed = Math.max(0, (Date.now() - LAUNCH_ANCHOR) / (1000 * 60 * 60));
  // Phase 1 (first 30 h): ~1 seat / 6 h.  Phase 2 (afterwards): 1 / 24 h.
  // With INITIAL_SEATS=30, this hits FLOOR_SEATS=8 after ~270 h ≈ 11 days.
  const decayPhase1 = Math.min(hoursElapsed, 30) / 6;
  const decayPhase2 = Math.max(0, hoursElapsed - 30) / 24;
  const decay = Math.floor(decayPhase1 + decayPhase2);
  const seats = Math.max(FLOOR_SEATS, INITIAL_SEATS - decay);

  try {
    localStorage.setItem(STORAGE_SEATS, JSON.stringify({ seats, ts: Date.now() }));
  } catch { /* ignore */ }

  return seats;
};

export const ClassScarcityBanner = () => {
  const [visible, setVisible] = useState(false);
  const [seats, setSeats] = useState(INITIAL_SEATS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_DISMISS) === '1') return;
    setSeats(computeSeatsRemaining());
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(STORAGE_DISMISS, '1'); } catch { /* ignore */ }
  };

  return (
    <div
      role="complementary"
      aria-label="Klasse 0001. Plätze begrenzt."
      data-testid="class-scarcity-banner"
      className="relative z-50 w-full bg-[#0A0A0A] text-white"
    >
      <div className="max-w-[1400px] mx-auto pl-5 md:pl-10 pr-2 md:pr-4 h-10 md:h-11 flex items-center gap-4 md:gap-6">
        {/* Live-dot + plain-language mark */}
        <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[9.5px] font-bold tracking-[0.28em] uppercase shrink-0 text-brand">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-brand" />
          </span>
          KLASSE 0001
        </span>

        {/* Mono hairline separator */}
        <span aria-hidden className="hidden md:inline-block w-px h-3 bg-white/20" />

        {/* Inline scarcity line */}
        <p className="flex-1 min-w-0 truncate text-[12px] sm:text-[13px] font-medium tracking-tight text-white/85">
          Nur <span className="text-brand font-black tabular-nums">{seats}</span>
          <span className="text-white/55"> von 30 Charter-Plätzen frei</span>
        </p>

        {/* Inline CTA, mono uppercase, integral part of the strip rather than a button */}
        <a
          href="https://leadercheck.de"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 font-mono font-bold tracking-[0.22em] uppercase text-[10.5px] text-white hover:text-brand transition-colors shrink-0"
          data-testid="class-scarcity-cta"
        >
          Diagnose sichern <span aria-hidden className="text-brand">→</span>
        </a>

        {/* Dismiss, muted but reachable */}
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-white/35 hover:text-white text-[16px] leading-none w-8 h-8 flex items-center justify-center font-mono transition-colors"
          aria-label="Hinweis ausblenden"
          data-testid="class-scarcity-dismiss"
        >
          ×
        </button>
      </div>

      {/* Hairline accent so the strip reads as a deliberate page-rule,
          not an interrupting banner. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-brand/30" />
    </div>
  );
};
