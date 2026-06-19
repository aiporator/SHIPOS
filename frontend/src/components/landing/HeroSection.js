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

    {/* Brand-metadata callouts — Heron-Preston DNA, real content */}
    <div
      aria-hidden
      className="hidden md:block absolute top-24 left-6 lg:left-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono"
    >
      <div>[ BY WLAD JACHTCHENKO ]</div>
      <div className="mt-0.5">[ EST. 2026 · BERLIN ]</div>
      <div className="mt-0.5">[ DE / EN · DSGVO ]</div>
    </div>
    <div
      aria-hidden
      className="hidden md:block absolute top-24 right-6 lg:right-10 text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono text-right"
    >
      <div>[ JETZT OFFEN ]</div>
      <div className="mt-0.5">[ START · SOFORT ]</div>
      <div className="mt-0.5">[ 30 TAGE · INDIVIDUELL ]</div>
      <div className="mt-0.5 text-foreground/30">[ SPRINT · 997 € · DIAGNOSE FREE ]</div>
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
      <motion.p
        initial="hidden"
        animate="show"
        custom={0}
        variants={FADE_UP}
        className="text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-6 font-mono"
      >
        ▸ KI-COACH · WLAD-METHODIK · 30-TAGE-SPRINT
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

      {/* Wlad's Doppel-Claim — zwei konkrete Outcomes statt eines abstrakten Slogans. */}
      <motion.p
        initial="hidden"
        animate="show"
        custom={2}
        variants={FADE_UP}
        className="mt-7 md:mt-10 max-w-3xl text-[20px] sm:text-[26px] md:text-[34px] lg:text-[40px] leading-[1.15] tracking-[-0.02em] text-foreground"
        style={{
          fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          fontWeight: 800,
        }}
      >
        Werde mit KI <span className="text-brand">10×</span> produktiver.{' '}
        <span className="text-foreground/55">Oder <span className="text-brand">10×</span> zu einer Persönlichkeit<span className="text-brand">.</span></span>
      </motion.p>

      <motion.p
        initial="hidden"
        animate="show"
        custom={3}
        variants={FADE_UP}
        className="mt-7 md:mt-9 max-w-2xl text-[15px] md:text-[18px] leading-[1.55] text-foreground/70"
      >
        Endlich überzeugend auftreten. Klare Skripte statt Theorie-Geschwafel.
        Wlads Methodik live, ein KI-Coach der dich 24/7 begleitet und ein
        30-Tage-Plan der wirkt. Starte kostenlos mit der Diagnose auf{' '}
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
        <div className="inline-flex items-center gap-2.5 mb-5 px-3 py-1.5 border border-brand/40 bg-brand/[0.07]">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" aria-hidden />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground font-mono">
            Jetzt sofort starten
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

        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/45 font-mono">
          ▸ Kein Abo · Keine Kreditkarte für die Diagnose · DSGVO-konform
        </p>
      </motion.div>

      {/* BIB-strip footer */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={5}
        variants={FADE_UP}
        className="mt-20 md:mt-32 pt-6 border-t border-foreground/10 flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/50 font-mono"
      >
        <span className="text-brand">▸</span>
        <span>LEADER · OS</span>
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
