import { motion } from 'framer-motion';
import { LANDING_ASSETS, LANDING_META } from '../../data/landingAssets';
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
 * Hero — Section §01 · "Elf Frameworks. Ein OS."
 *
 * Full-viewport editorial split: left half text (real semantic HTML,
 * scannable by Google + screen-readers), right half a hard-edged
 * full-bleed photo (the generated track-lane image).
 *
 * Designed to feel like the Electric-Hydrogen "Decarbonizing
 * Industry" hero — sober, mission-driven, scrollable beyond.
 */
export const HeroSection = () => {
  const b = LANDING_ASSETS.benefit01;

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-background pt-24 md:pt-28"
      data-testid="landing-hero"
      aria-label="Leader-OS — Elf Frameworks. Ein OS."
    >
      {/* Background editorial photo, masked into the right half on desktop */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-full md:w-[58%] overflow-hidden"
      >
        <motion.img
          src={b.url}
          alt=""
          className="w-full h-full object-cover object-center select-none pointer-events-none"
          initial={{ scale: 1.05, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          loading="eager"
          fetchpriority="high"
        />
        {/* On mobile, soft white fade over the image so headline reads */}
        <div className="absolute inset-0 md:hidden bg-gradient-to-b from-background/85 via-background/30 to-background/95" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-20 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7 lg:col-span-6 flex flex-col justify-center">
          <motion.p
            initial="hidden"
            animate="show"
            custom={0}
            variants={FADE_UP}
            className="text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/55 mb-6"
          >
            {b.eyebrow}
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={1}
            variants={FADE_UP}
            className="text-[40px] sm:text-[54px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-[-0.035em] text-foreground"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 800 }}
          >
            {b.headline}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={FADE_UP}
            className="mt-6 md:mt-8 max-w-xl text-[14px] md:text-[15.5px] leading-[1.55] text-foreground/70"
          >
            {b.body}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={3}
            variants={FADE_UP}
            className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-6 gap-y-4"
          >
            <PlusCircleCTA
              href={LANDING_META.cta.primary.href}
              testId="hero-cta-primary"
            >
              {LANDING_META.cta.primary.label}
            </PlusCircleCTA>
            <a
              href="#benefit-02"
              className="text-[12px] font-bold uppercase tracking-[0.18em] text-foreground/50 hover:text-foreground transition-colors"
              data-testid="hero-cta-scroll"
            >
              7 Benefits · scroll ↓
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            custom={4}
            variants={FADE_UP}
            className="mt-12 md:mt-16 flex items-center gap-4 text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/50"
          >
            <span className="text-brand">▸</span>
            <span>KOHORTE {LANDING_META.cohort} · OFFEN</span>
            <span className="h-px w-12 bg-foreground/15" />
            <span>leader-os.de</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll-hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/40"
      >
        <span>SCROLL</span>
        <span className="h-8 w-px bg-foreground/30 animate-pulse" />
      </motion.div>
    </section>
  );
};
