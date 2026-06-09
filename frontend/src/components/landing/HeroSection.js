import { motion } from 'framer-motion';
import { LANDING_META } from '../../data/landingAssets';
import { PlusCircleCTA } from './PlusCircleCTA';

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
    aria-label="Werde KI-nativ — Das OS für Führungskräfte"
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

    {/* Technical specimen-sheet callouts (Heron-Preston DNA) */}
    <div
      aria-hidden
      className="hidden md:block absolute top-24 left-6 lg:left-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/40 font-mono"
    >
      <div>[ a. EYEBROW ]</div>
      <div className="mt-0.5">[ b. SLOGAN ]</div>
      <div className="mt-0.5">[ c. SUBLINE ]</div>
    </div>
    <div
      aria-hidden
      className="hidden md:block absolute top-24 right-6 lg:right-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/40 font-mono text-right"
    >
      <div>[ {LANDING_META.bib} ]</div>
      <div className="mt-0.5">[ K01 · OFFEN ]</div>
      <div className="mt-0.5">[ EU · DE / EN ]</div>
    </div>

    <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-10 pt-32 md:pt-40 pb-20 md:pb-28">
      <motion.p
        initial="hidden"
        animate="show"
        custom={0}
        variants={FADE_UP}
        className="text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-6 font-mono"
      >
        ▸ Leader-OS · Powered by WladBot
      </motion.p>

      <motion.h1
        initial="hidden"
        animate="show"
        custom={1}
        variants={FADE_UP}
        className="text-[56px] sm:text-[88px] md:text-[128px] lg:text-[168px] leading-[0.86] tracking-[-0.045em] text-foreground"
        style={{
          fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          fontWeight: 900,
          fontStyle: 'italic',
        }}
      >
        Werde<br />KI-nativ<span className="text-brand not-italic">.</span>
      </motion.h1>

      <motion.p
        initial="hidden"
        animate="show"
        custom={2}
        variants={FADE_UP}
        className="mt-8 md:mt-12 max-w-2xl text-[15px] md:text-[18px] leading-[1.55] text-foreground/70"
      >
        Das Operating System für die nächste Generation Führungskräfte.
        Wlad Jachtchenkos Methodik live, jeden Tag, in deiner Tasche.
        Starte mit der kostenlosen Diagnose auf{' '}
        <a
          href="https://leader-check.de"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline decoration-brand decoration-2 underline-offset-4 hover:decoration-foreground transition-colors"
        >
          leader-check.de
        </a>.
      </motion.p>

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
          So funktioniert's ↓
        </a>
      </motion.div>

      {/* BIB-strip footer */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={4}
        variants={FADE_UP}
        className="mt-20 md:mt-32 pt-6 border-t border-foreground/10 flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/50 font-mono"
      >
        <span className="text-brand">▸</span>
        <span>KOHORTE {LANDING_META.cohort}</span>
        <span className="text-foreground/20">/</span>
        <span>DREIßIG TAGE</span>
        <span className="text-foreground/20">/</span>
        <span>ELF FRAMEWORKS</span>
        <span className="text-foreground/20">/</span>
        <span>WLADBOT 24-7</span>
        <span className="text-foreground/20">/</span>
        <span>ZERTIFIKAT</span>
      </motion.div>
    </div>
  </section>
);
