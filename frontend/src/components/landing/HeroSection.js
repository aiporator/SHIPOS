import { motion } from 'framer-motion';
import { LANDING_META } from '../../data/landingAssets';
import { PlusCircleCTA } from './PlusCircleCTA';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../../lib/brandAssets';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Hero — pure typography, zero image dependency.
 *
 * Heron-Preston specimen-sheet DNA: huge headline, lime period as
 * the punctuation, BIB-coded eyebrow and footer-strip, technical
 * metadata callouts at the corners. Nothing here depends on a CDN.
 */
export const HeroSection = () => (
  <section
    id="hero"
    className="relative w-full overflow-hidden bg-background"
    data-testid="landing-hero"
    aria-label="30 Tage mit Wlad — Sprint zum Führungs-System"
  >
    {/* Subtle radial mesh, never the focus */}
    <div
      aria-hidden
      className="absolute inset-0 opacity-70"
      style={{
        backgroundImage:
          'radial-gradient(at 85% 20%, rgba(191,255,0,0.08) 0px, transparent 50%), ' +
          'radial-gradient(at 5% 90%, rgba(191,255,0,0.04) 0px, transparent 55%)',
      }}
    />

    {/* Brand-metadata callouts — minimal. Eine Zeile links, eine rechts.
        Vorher 3+4 Zeilen — visual noise ohne payoff. */}
    <div
      aria-hidden
      className="hidden md:block absolute top-24 left-6 lg:left-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/35 font-mono"
    >
      [ EST. 2026 · BERLIN ]
    </div>
    <div
      aria-hidden
      className="hidden md:block absolute top-24 right-6 lg:right-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/35 font-mono text-right"
    >
      [ SPRINT · 997 € · DIAGNOSE FREE ]
    </div>

    {/* Background-W — Heron-Preston editorial ghost letterform */}
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-y-0 right-[-8%] md:right-[-4%] w-[80%] md:w-[58%] flex items-center justify-end pointer-events-none select-none"
    >
      <span
        className="text-[42vw] md:text-[34vw] lg:text-[28vw] leading-none tracking-[-0.06em] text-foreground/[0.04]"
        style={{
          fontFamily: 'Outfit, Inter, sans-serif',
          fontWeight: 900,
          fontStyle: 'italic',
        }}
      >
        W
      </span>
    </motion.div>

    <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-10 pt-16 md:pt-24 pb-10 md:pb-14">
      {/* Wlad-Anker — kompakter, ein Specimen-Tag statt drei Zeilen */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={0}
        variants={FADE_UP}
        className="flex items-center gap-3.5 mb-8"
      >
        <img
          src={WLAD_AVATAR}
          onError={withFallback(WLAD_AVATAR_FALLBACKS)}
          alt="Wlad Jachtchenko"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-brand/45 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
        />
        <div className="leading-tight">
          <p className="text-[13.5px] font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Wlad Jachtchenko
          </p>
          <p className="text-[11px] text-foreground/55 mt-0.5">
            3× SPIEGEL-Bestseller · 400 000 Kunden
          </p>
        </div>
      </motion.div>

      <motion.h1
        initial="hidden"
        animate="show"
        custom={1}
        variants={FADE_UP}
        className="text-[64px] sm:text-[96px] md:text-[136px] lg:text-[176px] leading-[0.84] tracking-[-0.048em] text-foreground"
        style={{
          fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          fontWeight: 900,
          fontStyle: 'italic',
        }}
      >
        Sprint<br />mit Wlad<span className="text-brand not-italic">.</span>
      </motion.h1>

      {/* Konkrete Outcomes statt Buzzwords */}
      <motion.p
        initial="hidden"
        animate="show"
        custom={2}
        variants={FADE_UP}
        className="mt-8 md:mt-12 max-w-3xl text-[22px] sm:text-[28px] md:text-[36px] leading-[1.18] tracking-[-0.018em] text-foreground"
        style={{
          fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          fontWeight: 800,
        }}
      >
        Dreißig Tage. <span className="text-brand">Elf</span> Frameworks.{' '}
        <span className="text-foreground/55">Ein KI-Coach der dich kennt<span className="text-brand">.</span></span>
      </motion.p>

      <motion.p
        initial="hidden"
        animate="show"
        custom={3}
        variants={FADE_UP}
        className="mt-8 md:mt-10 max-w-2xl text-[15px] md:text-[17px] leading-[1.6] text-foreground/65"
      >
        Klare Skripte statt Theorie. Tägliche Drills, sofort am echten Fall.
        Starte kostenlos auf{' '}
        <a
          href="https://leadercheck.de"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline decoration-brand decoration-2 underline-offset-4 hover:decoration-foreground transition-colors"
        >
          leadercheck.de
        </a>.
      </motion.p>

      <motion.div
        initial="hidden"
        animate="show"
        custom={4}
        variants={FADE_UP}
        className="mt-10 md:mt-14"
      >
        <div className="inline-flex items-center gap-2.5 mb-5 px-3 py-1.5 border-2 border-brand/60 bg-brand/[0.10]">
          <span className="w-2 h-2 rounded-full bg-brand animate-live-dot" aria-hidden />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground font-mono">
            ▸ Klasse 0001 · 43 von 50 Plätzen frei
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <PlusCircleCTA
            href={LANDING_META.cta.primary.href}
            testId="hero-cta-primary"
          >
            Diagnose starten · 5 Min · kostenlos
          </PlusCircleCTA>
          <a
            href="#how-it-works"
            className="text-[12px] font-bold uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground transition-colors"
            data-testid="hero-cta-scroll"
          >
            So funktioniert's ↓
          </a>
        </div>

        <p className="mt-4 text-[11px] text-foreground/45">
          Kein Abo · 14 Tage Geld-zurück auf den Sprint
        </p>
      </motion.div>

      {/* Scroll-cue — sanfter Pulse-Pfeil der das Auge nach unten zieht.
          Nur Desktop+ (Mobile-User scrollen sowieso) und nur bei
          prefers-reduced-motion:none aktiv (via .animate-scroll-cue media query). */}
      <a
        href="#how-it-works"
        aria-label="Weiter scrollen"
        data-testid="hero-scroll-cue"
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 text-foreground/55 hover:text-foreground transition-colors group"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.28em] font-mono">scroll</span>
        <span className="animate-scroll-cue text-[16px] leading-none">↓</span>
      </a>
    </div>
  </section>
);
