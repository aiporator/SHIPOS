import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { PlusCircleCTA } from './PlusCircleCTA';
import { BenefitVisual } from './BenefitVisual';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * BenefitSection — pure typography Heron-Preston specimen-sheet.
 *
 * Zero image dependency. Each §-section is a typographic plate:
 *   - Tech metadata strip (§ NR · CODE · BIB) across the top
 *   - Giant 2-line headline with lime period punctuation
 *   - Body copy in body type
 *   - Specimen-table with 3–4 callouts on the right side
 *   - Plus-circle CTA + BIB-strip footer
 *   - Subtle parallax on the specimen-table side for depth
 *
 * Dark variant for §07 — the counter-punch wall.
 */
export const BenefitSection = ({ asset, index, anchor, total = 7 }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['0%', '0%'] : ['-4%', '4%']
  );

  const reversed = index % 2 === 1;
  const isDark = asset.dark;

  return (
    <section
      ref={ref}
      id={anchor}
      className={`relative w-full overflow-hidden ${
        isDark
          ? 'bg-[#0A0A0A] text-white'
          : 'bg-background text-foreground'
      }`}
      data-testid={`landing-${anchor}`}
      aria-label={`Benefit ${asset.nr} — ${asset.headline} ${asset.headlineAccent}`}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-32">
        {/* Tech metadata header strip */}
        <div className={`flex items-center justify-between mb-12 md:mb-16 pb-4 border-b ${isDark ? 'border-white/15' : 'border-foreground/15'}`}>
          <div className={`flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.22em] font-mono ${isDark ? 'text-white/60' : 'text-foreground/55'}`}>
            <span>§ {asset.nr} / {String(total).padStart(2, '0')}</span>
            <span className={isDark ? 'text-white/20' : 'text-foreground/20'}>/</span>
            <span className="text-brand">{asset.code}</span>
            {asset.eyebrow && (
              <>
                <span className={isDark ? 'text-white/20' : 'text-foreground/20'}>/</span>
                <span className="hidden sm:inline">{asset.eyebrow}</span>
              </>
            )}
          </div>
          <div className={`hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.22em] font-mono ${isDark ? 'text-white/60' : 'text-foreground/55'}`}>
            <span>BIB · 0001</span>
            <span className={isDark ? 'text-white/20' : 'text-foreground/20'}>/</span>
            <span>CREW 01</span>
          </div>
        </div>

        <div className={`grid md:grid-cols-12 gap-10 md:gap-14 items-start ${reversed ? 'md:[&>*:first-child]:order-2' : ''}`}>
          {/* Text column */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={FADE_UP}
            className="md:col-span-7"
          >
            <h2
              className={`text-[44px] sm:text-[64px] md:text-[80px] lg:text-[104px] leading-[0.92] tracking-[-0.04em] ${isDark ? 'text-white' : 'text-foreground'}`}
              style={{
                fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
              }}
            >
              {asset.headline}<br />
              {asset.headlineAccent.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
            </h2>

            {asset.subline && (
              <p
                className={`mt-6 md:mt-8 max-w-xl text-[16px] md:text-[20px] lg:text-[22px] leading-[1.25] tracking-[-0.015em] ${
                  isDark ? 'text-white/85' : 'text-foreground/85'
                }`}
                style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 700, fontStyle: 'italic' }}
              >
                {asset.subline}
              </p>
            )}

            <p
              className={`mt-6 md:mt-7 max-w-xl text-[15px] md:text-[17px] leading-[1.55] ${isDark ? 'text-white/70' : 'text-foreground/70'}`}
            >
              {asset.body}
            </p>

            <div className="mt-10 md:mt-12">
              <PlusCircleCTA
                href={asset.href}
                testId={`benefit-${asset.nr}-cta`}
                className={isDark ? 'text-white' : 'text-foreground'}
              >
                {asset.cta}
              </PlusCircleCTA>
            </div>
          </motion.div>

          {/* Visual + specimen-table column */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 md:pt-8 space-y-5"
          >
            <BenefitVisual
              nr={asset.nr}
              code={asset.code}
              photo={asset.photo}
              photoFallback={asset.photoFallback}
              photoFit={asset.photoFit}
              variant={asset.variant}
              trustNumbers={asset.trustNumbers}
              isDark={isDark}
              total={total}
            />

            <div
              className={`border ${isDark ? 'border-white/15' : 'border-foreground/15'} p-6 md:p-7`}
              data-testid={`specimen-${asset.nr}`}
            >
              <div className={`flex items-center justify-between pb-4 mb-5 border-b ${isDark ? 'border-white/10' : 'border-foreground/10'}`}>
                <span className={`text-[9.5px] font-bold uppercase tracking-[0.22em] font-mono ${isDark ? 'text-white/55' : 'text-foreground/55'}`}>
                  SPECIMEN · § {asset.nr}
                </span>
                <span className={`text-[9.5px] font-bold uppercase tracking-[0.22em] font-mono ${isDark ? 'text-brand' : 'text-brand'}`}>
                  {asset.code}
                </span>
              </div>

              <ul className="space-y-3.5">
                {asset.detail.map(([tag, label, value]) => (
                  <li
                    key={`${asset.nr}-${tag}`}
                    className={`grid grid-cols-12 gap-2 items-start ${isDark ? '' : ''}`}
                  >
                    <span className={`col-span-2 text-[10px] font-bold uppercase tracking-[0.15em] font-mono ${isDark ? 'text-white/35' : 'text-foreground/35'}`}>
                      {tag}
                    </span>
                    <span className={`col-span-4 text-[11px] font-bold uppercase tracking-[0.12em] ${isDark ? 'text-white' : 'text-foreground'}`}>
                      {label}
                    </span>
                    <span className={`col-span-6 text-[12px] leading-[1.4] ${isDark ? 'text-white/70' : 'text-foreground/70'}`}>
                      {value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-white/10' : 'border-foreground/10'} flex items-center justify-between text-[9.5px] font-bold uppercase tracking-[0.22em] font-mono ${isDark ? 'text-white/40' : 'text-foreground/40'}`}>
                <span>LEADER-OS</span>
                <span>{`No. ${asset.nr}/${String(total).padStart(2, '0')}`}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
