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
 *
 * Stack discipline: four text elements only.
 *   1. Wlad-anker strip   (eyebrow / trust)
 *   2. Headline           ("Sprint mit Wlad.")
 *   3. Subline            ("Dreißig Tage. Elf Frameworks. Ein KI-Coach...")
 *   4. CTA cluster        (primary + one secondary anchor)
 *
 * Anything else (scarcity pill, trust-strip, scroll-cue) moves into a
 * dedicated band directly below so it doesn't crowd the moment.
 */
export const HeroSection = () => (
  <section
    id="hero"
    className="relative w-full overflow-hidden bg-background"
    data-testid="landing-hero"
    aria-label="Sprint mit Wlad. 30 Tage zum Führungs-OS."
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

    {/* Brand-metadata callouts pinned just under the nav so they read
        as page-chrome, not as a competing content element. */}
    <div
      aria-hidden
      className="hidden md:block absolute top-3 left-6 lg:left-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/35 font-mono"
    >
      [ EST. 2026 · BERLIN ]
    </div>
    <div
      aria-hidden
      className="hidden md:block absolute top-3 right-6 lg:right-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/35 font-mono text-right"
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

    <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-12 md:pb-20">
      {/* 1 / 4 — Wlad-anker (eyebrow slot) */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={0}
        variants={FADE_UP}
        className="flex items-center gap-3.5 mb-6"
      >
        <img
          src={WLAD_AVATAR}
          onError={withFallback(WLAD_AVATAR_FALLBACKS)}
          alt="Wlad Jachtchenko"
          className="w-12 h-12 rounded-full object-cover object-top ring-2 ring-brand/45 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)]"
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

      {/* 2 / 4 — Headline */}
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

      {/* 3 / 4 — Subline */}
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

      {/* 4 / 4 — CTAs */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={3}
        variants={FADE_UP}
        className="mt-10 md:mt-14 flex flex-wrap items-center gap-x-8 gap-y-4"
      >
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
          So funktioniert's
        </a>
      </motion.div>
    </div>
  </section>
);
