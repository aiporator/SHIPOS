/**
 * BenefitVisual — real photo inside the Heron-Preston specimen frame.
 *
 * Photos are served from picsum.photos with stable per-section seeds
 * (so the same visitor sees the same photo, but every section gets a
 * distinct one). Grayscale at the source for editorial consistency.
 * If a photo fails to load, the frame + metadata still render — the
 * section is never broken.
 *
 * The frame itself does the brand work: a hard-edged border, a
 * tech-header strip (§ NR / CODE), a tech-footer strip (LEADER-OS ·
 * No. X/05). Heron-Preston specimen-sheet DNA.
 */

const SpecimenFrame = ({ children, code, nr, isDark, total = 5 }) => (
  <div
    className={`relative aspect-[4/5] w-full border ${
      isDark ? 'border-white/20 bg-[#0A0A0A]' : 'border-foreground/20 bg-foreground/[0.03]'
    } overflow-hidden`}
    data-testid={`benefit-visual-${nr}`}
  >
    {/* tech header strip */}
    <div
      className={`absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2.5 z-10 ${
        isDark
          ? 'bg-[#0A0A0A]/85 backdrop-blur-sm border-b border-white/10 text-white/70'
          : 'bg-background/85 backdrop-blur-sm border-b border-foreground/10 text-foreground/70'
      } text-[9px] font-bold uppercase tracking-[0.22em] font-mono`}
    >
      <span>§ {nr} / 0{total}</span>
      <span className="text-brand">{code}</span>
    </div>

    {children}

    {/* tech footer strip */}
    <div
      className={`absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2.5 z-10 ${
        isDark
          ? 'bg-[#0A0A0A]/85 backdrop-blur-sm border-t border-white/10 text-white/55'
          : 'bg-background/85 backdrop-blur-sm border-t border-foreground/10 text-foreground/55'
      } text-[9px] font-bold uppercase tracking-[0.22em] font-mono`}
    >
      <span>LEADER-OS</span>
      <span>{`No. ${nr}/0${total}`}</span>
    </div>
  </div>
);

export const BenefitVisual = ({ nr, code, photo, isDark = false, total = 5 }) => (
  <SpecimenFrame nr={nr} code={code} isDark={isDark} total={total}>
    {photo ? (
      <img
        src={photo}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover ${
          isDark ? 'opacity-80' : 'opacity-95'
        }`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    ) : (
      <div
        aria-hidden
        className={`absolute inset-0 ${
          isDark ? 'bg-white/[0.03]' : 'bg-foreground/[0.05]'
        }`}
      />
    )}

    {/* Subtle bottom-to-top gradient for footer-strip legibility */}
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-10 h-24 pointer-events-none"
      style={{
        background: isDark
          ? 'linear-gradient(to top, rgba(10,10,10,0.6), transparent)'
          : 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)',
      }}
    />
  </SpecimenFrame>
);
