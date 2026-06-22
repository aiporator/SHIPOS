import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { PlusCircleCTA } from './PlusCircleCTA';
import { useGsapScrollIn } from './motion/useGsapScrollIn';

/**
 * BenefitSection — Poster-style chapter spread.
 *
 * Re-skin per user direction: each chapter (01-07) reads as a full-page
 * poster the way the launch mockups are designed. The hero photo bands
 * full-width across the top of the section (B&W treatment with subtle
 * grain), the chapter headline pulls up into the bottom of the photo for
 * the magazine-cover overlap effect, and a single lime ⊕ CTA sits at the
 * bottom-right corner of the photo for visual gravity.
 *
 * Layout (top → bottom):
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ KAPITEL XX VON 07  /  CODE  /  LEADER·OS    0001 · KOHORTE   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │                                                                │
 *   │ [Photo: full-bleed, ~48vh, B&W filter, soft bottom-gradient]   │
 *   │                                                                │
 *   │                                          ┌───────────────────┐ │
 *   │                                          │ ⊕ Lime CTA        │ │
 *   │ MASSIVE HEADLINE BLOCK ←pulls up         └───────────────────┘ │
 *   │ Subline mono caps                                              │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ Body copy (max-w-xl)        │   Specimen table (compact)      │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Variant-specific overlays (kept as small bottom-right insets ON TOP
 * of the photo so the typographic concept survives, just at poster scale):
 *
 *   variant: 'photo'  → no overlay; just the photo
 *   variant: 'bib'    → 0001 startnummer plate (small, white)
 *   variant: 'trust'  → 400/14 stat block (small, white)
 *   variant: 'cert'   → goldfolie-styled certificate seal
 *   variant: 'voxel'  → WladBot scan-grid pattern (lime dot pattern)
 *
 * Dark variant (chapter 07): inverts to black bg + white type.
 */

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ─────────────────────────────────────────────────────────────────────────
// Tiny overlay components — sit in the bottom-right of the photo
// ─────────────────────────────────────────────────────────────────────────
const BibOverlay = () => (
  <div className="absolute right-4 md:right-8 bottom-4 md:bottom-8 z-10 max-w-[180px] md:max-w-[230px]">
    <div className="relative bg-white border-[2.5px] border-foreground py-3 px-4 shadow-[6px_6px_0_0_rgba(0,0,0,0.45)]" style={{ borderRadius: '8px' }}>
      {/* corner punch-holes */}
      {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((pos) => (
        <span key={pos} aria-hidden className={`absolute ${pos} w-1.5 h-1.5 rounded-full border border-foreground/60 bg-white`} />
      ))}
      <div className="text-[8px] font-bold uppercase tracking-[0.26em] text-foreground/70 font-mono text-center">
        LEADER-OS · STARTNR
      </div>
      <div
        className="text-foreground leading-none text-center mt-1.5"
        style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(34px, 4.5vw, 52px)', letterSpacing: '-0.02em' }}
      >
        0001
      </div>
    </div>
  </div>
);

const TrustOverlay = ({ trustNumbers = [] }) => {
  const [a, b] = trustNumbers;
  return (
    <div className="absolute right-4 md:right-8 bottom-4 md:bottom-8 z-10 max-w-[280px] md:max-w-[340px]">
      <div className="bg-white border-2 border-foreground px-5 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-2 gap-4">
          {[a, b].filter(Boolean).map((n) => (
            <div key={n.suffix} className="leading-none">
              <div
                className="text-foreground"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.025em' }}
              >
                {n.big}
              </div>
              <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-foreground/70 font-mono">
                {n.suffix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CertOverlay = () => (
  <div className="absolute right-4 md:right-8 bottom-4 md:bottom-8 z-10">
    <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] bg-gradient-to-br from-[#F2D86A] via-[#E5C754] to-[#C8A839] border-2 border-foreground shadow-[6px_6px_0_0_rgba(0,0,0,0.45)] flex items-center justify-center" style={{ borderRadius: '50%' }}>
      <div className="text-center">
        <div className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-foreground/80 font-mono">
          ZERTIFIKAT
        </div>
        <div
          className="text-foreground leading-none mt-1"
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.02em' }}
        >
          0001
        </div>
        <div className="text-[7.5px] font-bold uppercase tracking-[0.22em] text-foreground/65 font-mono mt-0.5">
          Wlad J.
        </div>
      </div>
    </div>
  </div>
);

const VoxelOverlay = () => (
  <div className="absolute right-4 md:right-8 bottom-4 md:bottom-8 z-10 max-w-[180px] md:max-w-[230px]">
    <div className="bg-[#0A0A0A] border-2 border-brand px-4 py-3.5 shadow-[6px_6px_0_0_rgba(191,255,0,0.55)]">
      <div className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-brand font-mono mb-2">
        ▸ WLADBOT · 24/7
      </div>
      <div
        className="grid grid-cols-8 gap-[3px]"
        aria-hidden
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-brand' : 'bg-white/30'}`}
          />
        ))}
      </div>
      <div className="mt-2.5 text-[8.5px] font-bold uppercase tracking-[0.22em] text-white/60 font-mono">
        SCAN AKTIV · LIVE
      </div>
    </div>
  </div>
);

const VariantOverlay = ({ variant, trustNumbers }) => {
  switch (variant) {
    case 'bib':   return <BibOverlay />;
    case 'trust': return <TrustOverlay trustNumbers={trustNumbers} />;
    case 'cert':  return <CertOverlay />;
    case 'voxel': return <VoxelOverlay />;
    default:      return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Hero photo band — full-bleed B&W with grain, gradient bottom fade
// ─────────────────────────────────────────────────────────────────────────
const PhotoBand = ({ photo, photoFallback, photoFit, isDark, variant, trustNumbers, nr }) => (
  <div
    className="relative w-full h-[40vh] sm:h-[44vh] md:h-[52vh] lg:h-[56vh] min-h-[320px] max-h-[640px] overflow-hidden bg-foreground"
    data-testid={`benefit-photo-${nr}`}
  >
    {photo ? (
      <img
        src={photo}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 w-full h-full ${
          photoFit === 'portrait' ? 'object-cover object-[50%_28%]' : 'object-cover object-center'
        }`}
        style={{ filter: 'grayscale(1) contrast(1.06) brightness(0.94)' }}
        onError={(e) => {
          if (photoFallback && e.currentTarget.src !== photoFallback) e.currentTarget.src = photoFallback;
        }}
      />
    ) : (
      <div aria-hidden className="absolute inset-0 bg-foreground/[0.04]" />
    )}

    {/* Halftone grain overlay (matches newsroom-halftone aesthetic) */}
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-50"
      style={{
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.3) 1px, transparent 1.2px)',
        backgroundSize: '3.5px 3.5px',
      }}
    />

    {/* Bottom gradient fade so the headline below sits cleanly */}
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
      style={{
        background: `linear-gradient(to top, ${isDark ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.92)'}, transparent)`,
      }}
    />

    {/* Top corner: 0001 · KOHORTE tag */}
    <div className="absolute top-4 md:top-6 right-4 md:right-8 z-10">
      <div className="bg-white/95 backdrop-blur-sm border border-foreground/15 px-2.5 py-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-foreground">
        0001 · KOHORTE
      </div>
    </div>

    {/* Variant-specific overlay (bib plate, trust numbers, cert seal, voxel grid) */}
    <VariantOverlay variant={variant} trustNumbers={trustNumbers} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────────────────
export const BenefitSection = ({ asset, index, anchor, total = 7 }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yShift = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-2%', '2%']);

  // ghost numeral scrubbing in on scroll, behind the title block
  const numberRef = useGsapScrollIn('big-number');

  const isDark = asset.dark;

  return (
    <section
      ref={ref}
      id={anchor}
      className={`relative w-full overflow-hidden ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-background text-foreground'}`}
      data-testid={`landing-${anchor}`}
      aria-label={`Benefit ${asset.nr} — ${asset.headline} ${asset.headlineAccent}`}
    >
      {/* Top metadata strip (KAPITEL XX VON 07 / CODE / LEADER·OS) */}
      <div className={`max-w-[1480px] mx-auto px-5 md:px-10 lg:px-14 pt-10 md:pt-14 pb-5 md:pb-7 border-b ${isDark ? 'border-white/15' : 'border-foreground/15'}`}>
        <div className={`flex items-center justify-between font-mono text-[10px] md:text-[10.5px] font-bold uppercase tracking-[0.24em] ${isDark ? 'text-white/65' : 'text-foreground/65'}`}>
          <div className="flex items-center gap-x-3 md:gap-x-4 flex-wrap gap-y-1">
            <span>KAPITEL {asset.nr} VON {String(total).padStart(2, '0')}</span>
            <span className={isDark ? 'text-white/20' : 'text-foreground/20'}>/</span>
            <span className="text-brand">{asset.code}</span>
            {asset.eyebrow && (
              <>
                <span className={`hidden md:inline ${isDark ? 'text-white/20' : 'text-foreground/20'}`}>/</span>
                <span className="hidden md:inline">{asset.eyebrow}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline">LEADER · OS</span>
          </div>
        </div>
      </div>

      {/* Full-width photo poster band */}
      <PhotoBand
        photo={asset.photo}
        photoFallback={asset.photoFallback}
        photoFit={asset.photoFit}
        isDark={isDark}
        variant={asset.variant}
        trustNumbers={asset.trustNumbers}
        nr={asset.nr}
      />

      {/* Content area — headline pulls UP into the photo's bottom gradient */}
      <div className="relative max-w-[1480px] mx-auto px-5 md:px-10 lg:px-14 pb-20 md:pb-28 -mt-16 md:-mt-24 lg:-mt-32">
        {/* Ghost giant chapter-number behind content */}
        <div
          ref={numberRef}
          aria-hidden
          className={`absolute top-4 right-0 pointer-events-none select-none leading-none tracking-[-0.06em] z-0 ${
            isDark ? 'text-white/[0.05]' : 'text-foreground/[0.04]'
          }`}
          style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 'clamp(220px, 30vw, 460px)',
          }}
        >
          {asset.nr}
        </div>

        {/* Headline block — pulls into photo via negative margin above */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={FADE_UP}
          className="relative z-10 max-w-5xl"
        >
          <h2
            className={`leading-[0.88] tracking-[-0.045em] ${isDark ? 'text-white' : 'text-foreground'}`}
            style={{
              fontFamily: 'Outfit, Inter, system-ui, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 'clamp(48px, 8.5vw, 144px)',
            }}
          >
            {asset.headline.replace(/\.$/, '')}<span className="text-brand not-italic">.</span><br />
            <span className={isDark ? 'text-white/55' : 'text-foreground/55'}>
              {asset.headlineAccent.replace(/\.$/, '')}
            </span>
            <span className="text-brand not-italic">.</span>
          </h2>

          {asset.subline && (
            <p
              className={`mt-5 md:mt-7 max-w-2xl text-[15px] sm:text-[18px] md:text-[22px] leading-[1.25] tracking-[-0.015em] ${
                isDark ? 'text-white/80' : 'text-foreground/80'
              }`}
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 700, fontStyle: 'italic' }}
            >
              {asset.subline}
            </p>
          )}
        </motion.div>

        {/* 2-col body section · body left, specimen right */}
        <motion.div
          style={{ y: yShift }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mt-10 md:mt-14 grid md:grid-cols-12 gap-8 md:gap-12"
        >
          {/* Body copy */}
          <div className="md:col-span-7">
            <p className={`text-[15px] md:text-[17px] leading-[1.6] ${isDark ? 'text-white/75' : 'text-foreground/75'} max-w-xl`}>
              {asset.body}
            </p>
            <div className="mt-9 md:mt-12">
              <PlusCircleCTA
                href={asset.href}
                testId={`benefit-${asset.nr}-cta`}
                halo={false}
                className={isDark ? 'text-white' : 'text-foreground'}
              >
                {asset.cta}
              </PlusCircleCTA>
            </div>
          </div>

          {/* Specimen table */}
          <div className="md:col-span-5">
            <div
              className={`border ${isDark ? 'border-white/15 bg-white/[0.02]' : 'border-foreground/15 bg-foreground/[0.015]'} p-6 md:p-7`}
              data-testid={`specimen-${asset.nr}`}
            >
              <div className={`flex items-center justify-between pb-4 mb-5 border-b ${isDark ? 'border-white/10' : 'border-foreground/10'}`}>
                <span className={`text-[9.5px] font-bold uppercase tracking-[0.22em] font-mono ${isDark ? 'text-white/55' : 'text-foreground/55'}`}>
                  WAS DU BEKOMMST · {asset.nr}
                </span>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] font-mono text-brand">
                  {asset.code}
                </span>
              </div>

              <ul className="space-y-3.5">
                {asset.detail.map(([tag, label, value]) => (
                  <li key={`${asset.nr}-${tag}`} className="grid grid-cols-12 gap-2 items-start">
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
                <span>{`Kapitel ${asset.nr} von ${String(total).padStart(2, '0')}`}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
