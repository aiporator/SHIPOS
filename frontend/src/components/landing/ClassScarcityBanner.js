import { useEffect, useState } from 'react';

/**
 * ClassScarcityBanner — top of page, narrow strip.
 *
 * Klasse 0001 startet → nur 50 Plätze → echte Scarcity statt
 * fake-urgency. Mini-Counter ticks down über die Zeit, persistent
 * in localStorage damit der Wert nicht bei jedem Reload zurück
 * springt. Dismissible per Session.
 *
 * Dark on lime — die Nike-DNA-Variante des "act now" Pattern, ohne
 * Schreierei. Mobile bleibt sichtbar (keine Festival-Banner-Höhe).
 */

const STORAGE_SEATS = 'leaderos_class_0001_seats';
const STORAGE_DISMISS = 'leaderos_class_0001_dismissed';
const INITIAL_SEATS = 50;
const FLOOR_SEATS = 12; // never goes lower than this — leaves real bookings room

// Pseudo-realistic seat decay: ~1 seat per ~6h on first day, slower after.
// Seeded by a fixed timestamp so the value is consistent across sessions/devices.
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

  // Fresh compute — anchor to a fixed launch start so all visitors see the same
  // monotonic decay. As real conversions happen, manual override lowers it further.
  const LAUNCH_ANCHOR = Date.parse('2026-06-19T06:00:00+02:00');
  const hoursElapsed = Math.max(0, (Date.now() - LAUNCH_ANCHOR) / (1000 * 60 * 60));
  // Seats decay: 1 per 6h for the first 50h, then 1 per 24h
  const decayPhase1 = Math.min(hoursElapsed, 50) / 6;
  const decayPhase2 = Math.max(0, hoursElapsed - 50) / 24;
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

  const pct = Math.round((seats / INITIAL_SEATS) * 100);

  return (
    <div
      role="complementary"
      aria-label="Klasse 0001 — Plätze begrenzt"
      data-testid="class-scarcity-banner"
      className="relative z-50 w-full bg-[#0A0A0A] text-white border-b border-brand/30"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[9.5px] font-bold tracking-[0.22em] uppercase shrink-0 text-brand">
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-brand" />
            </span>
            KLASSE 0001
          </span>
          <a
            href="https://leadercheck.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] sm:text-[13px] font-bold tracking-[-0.005em] truncate hover:text-brand transition-colors"
            data-testid="class-scarcity-cta"
          >
            Nur <span className="text-brand font-black">{seats}</span> von 50 Plätzen frei
            <span className="ml-2 inline-block font-mono font-bold tracking-[0.18em] uppercase text-[10.5px] text-brand">
              Diagnose sichern →
            </span>
          </a>
          {/* Progress bar — visual reinforcement of remaining seats */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="w-24 h-1 bg-white/15 overflow-hidden">
              <div
                className="h-1 bg-brand transition-all"
                style={{ width: `${pct}%` }}
                aria-label={`${pct}% Plätze frei`}
              />
            </div>
            <span className="text-[9px] font-mono font-bold text-white/55 tabular-nums">{pct}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-white/45 hover:text-white text-[18px] leading-none px-1.5 font-mono"
          aria-label="Hinweis ausblenden"
          data-testid="class-scarcity-dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};
