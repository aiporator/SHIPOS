import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LANDING_META } from '../../data/landingAssets';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../../lib/brandAssets';

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Hero · T1 Vellum Specification (see frontend/DESIGN.md).
 *
 * Whisper-light weight-300 display lockup on the warm vellum canvas,
 * closed with the single lime period. Machined section-label captions
 * (4px carbon square) replace the old BIB-mono chrome. Tonal-only —
 * no gradients, no glow, no shadow. Two pills: one lime primary
 * (the brand's only colored action), one carbon ghost secondary.
 *
 * Stack: (1) Wlad anchor · (2) whisper display headline ·
 * (3) subline · (4) pill pair. The page sits on `theme-t1`, so
 * `bg-background` here resolves to vellum and `text-foreground` to carbon.
 */
export const HeroSection = () => (
  <section
    id="hero"
    className="relative w-full overflow-hidden bg-background"
    data-testid="landing-hero"
    aria-label="Führung ist Skill. Skill ist trainierbar."
  >
    {/* Machined metadata captions pinned under the nav — page chrome,
        not content. Carbon square + uppercase, the T1 dial-indicator. */}
    <div aria-hidden className="hidden md:flex absolute top-4 left-6 lg:left-10 t1-label text-foreground/45">
      EST. 2026 · BERLIN
    </div>
    <div aria-hidden className="hidden md:flex absolute top-4 right-6 lg:right-10 t1-label text-foreground/45">
      14 TAGE KOSTENLOS · OHNE KARTE
    </div>

    {/* Tonal ghost W · architectural, not chromatic (carbon at 3%). */}
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="hidden sm:flex absolute inset-y-0 right-[-8%] md:right-[-4%] w-[60%] md:w-[58%] items-center justify-end pointer-events-none select-none"
    >
      <span
        className="text-[32vw] md:text-[34vw] lg:text-[28vw] leading-none tracking-[-0.06em] text-foreground/[0.035]"
        style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 300 }}
      >
        W
      </span>
    </motion.div>

    <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10 pt-10 md:pt-16 pb-14 md:pb-20">
      {/* 1 / 4 · Wlad anchor — clean paper ring, no lime halo (tonal only). */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={WLAD_AVATAR}
            onError={withFallback(WLAD_AVATAR_FALLBACKS)}
            alt="Wlad Jachtchenko · 3× SPIEGEL-Bestseller-Autor und Gründer der Argumentorik-Akademie · Leader-OS"
            width="72"
            height="72"
            fetchpriority="high"
            decoding="async"
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full object-cover object-top ring-1 ring-foreground/15"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4"
        >
          <p className="text-[15px] md:text-[16px] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}>
            Wlad Jachtchenko
          </p>
          <p className="mt-1.5 t1-label justify-center text-foreground/50">
            3× SPIEGEL-Bestseller · 400 000 Kunden
          </p>
        </motion.div>
      </div>

      {/* 2 / 4 · Whisper-light display headline · the signature weight-300
          lockup, line-height 1.0, closed with the one lime period. */}
      <motion.h1
        initial="hidden"
        animate="show"
        custom={1}
        variants={FADE_UP}
        className="t1-display text-center text-foreground"
      >
        Führung ist Skill<span style={{ color: 'var(--t1-lime)' }}>.</span>
      </motion.h1>

      {/* 3 / 4 · Subline · body weight, carbon + mercury. No price here. */}
      <motion.p
        initial="hidden"
        animate="show"
        custom={2}
        variants={FADE_UP}
        className="mx-auto mt-6 md:mt-8 max-w-2xl text-center text-[18px] md:text-[22px] leading-[1.4] text-foreground/70"
        style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 300, letterSpacing: '0.01em' }}
      >
        Skill ist trainierbar — mit Wlads Methodik aus 400 000 Coachings,
        als drillbares Operating System mit einem KI-Coach, der 24/7 dein Sparring ist.
      </motion.p>

      {/* 4 / 4 · Pill pair · one lime primary (the brand's only color),
          one carbon ghost secondary. Both full 100px radius. */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={3}
        variants={FADE_UP}
        className="mt-9 md:mt-11 flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <a
          href={LANDING_META.cta.primary.href}
          data-testid="hero-cta-primary"
          className="t1-pill group inline-flex items-center gap-2.5 h-12 px-7 text-[13px] uppercase"
        >
          {LANDING_META.cta.primary.label}
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a
          href={LANDING_META.cta.diagnose.href}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="hero-cta-diagnose"
          className="t1-pill-ghost inline-flex items-center h-12 px-7 text-[13px] uppercase"
        >
          Diagnose · 10 Min · kostenlos
        </a>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="mt-6 text-center t1-label justify-center text-foreground/40"
      >
        Kein Abo · Jederzeit kündbar
      </motion.p>
    </div>
  </section>
);
