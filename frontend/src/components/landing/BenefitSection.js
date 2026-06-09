import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { PlusCircleCTA } from './PlusCircleCTA';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * BenefitSection — reusable section §02..§07.
 *
 * Visual contract:
 *   - Full-bleed editorial photo (the generated asset) on one side
 *   - Real semantic HTML (eyebrow + headline + body + CTA) on the other
 *     side, NOT inside an image — so Google + screen-readers see it
 *   - Subtle parallax: the photo translates slower than scroll for depth
 *   - On viewport-enter, the text column fades up
 *   - Two layouts: photo-right (even sections) / photo-left (odd)
 *   - Dark variant for §07
 *
 * The image inside the asset already contains its own eyebrow/headline
 * baked in. We're using the asset as a brand-consistent visual chip;
 * the surrounding HTML is the SEO/a11y truth.
 */
export const BenefitSection = ({ asset, index, anchor }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['0%', '0%'] : ['-6%', '6%']
  );

  const reversed = index % 2 === 1; // §02 normal · §03 reversed · §04 normal · etc.
  const isDark = asset.dark;

  return (
    <section
      ref={ref}
      id={anchor}
      className={`relative w-full overflow-hidden ${
        isDark ? 'bg-[#0A0A0A] text-white' : 'bg-background text-foreground'
      }`}
      data-testid={`landing-${anchor}`}
      aria-label={`${asset.eyebrow} — ${asset.headline}`}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-20 md:py-32">
        <div className={`grid md:grid-cols-12 gap-10 md:gap-12 items-center ${reversed ? 'md:[&>*:first-child]:order-2' : ''}`}>
          {/* Text column */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={FADE_UP}
            className="md:col-span-5 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-[10.5px] font-bold uppercase tracking-[0.22em] ${isDark ? 'text-brand' : 'text-foreground/55'}`}>
                {asset.eyebrow}
              </span>
            </div>

            <h2
              className={`text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] leading-[0.98] tracking-[-0.035em] ${isDark ? 'text-white' : 'text-foreground'}`}
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 800 }}
            >
              {asset.headline}
            </h2>

            <p
              className={`mt-6 max-w-lg text-[14.5px] md:text-[16px] leading-[1.55] ${isDark ? 'text-white/70' : 'text-foreground/70'}`}
            >
              {asset.body}
            </p>

            <div className="mt-8 md:mt-10">
              <PlusCircleCTA
                href={asset.href}
                testId={`benefit-${asset.nr}-cta`}
                className={isDark ? 'text-white' : 'text-foreground'}
              >
                {asset.cta}
              </PlusCircleCTA>
            </div>
          </motion.div>

          {/* Editorial-poster column */}
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 relative"
          >
            <motion.div
              style={{ y, aspectRatio: asset.aspect }}
              className="relative w-full overflow-hidden border border-border/40 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]"
            >
              <img
                src={asset.url}
                alt={`${asset.headline} — ${asset.eyebrow}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {/* Subtle inner top vignette so the eyebrow inside the image reads */}
              <div aria-hidden className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background/15 to-transparent pointer-events-none" />
            </motion.div>

            {/* BIB-style index tag on the corner of the photo */}
            <div className={`absolute -top-4 left-4 md:left-6 inline-flex items-center gap-2 px-3 py-1.5 ${isDark ? 'bg-brand text-[#0A0A0A]' : 'bg-foreground text-background'} text-[10px] font-bold uppercase tracking-[0.2em]`}>
              <span>§ {asset.nr}</span>
              <span className="opacity-60">/</span>
              <span>07</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
