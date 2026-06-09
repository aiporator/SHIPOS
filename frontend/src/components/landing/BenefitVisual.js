/**
 * BenefitVisual — per-section specimen visual.
 *
 * Three variants drive distinct treatments inside the same Heron-Preston
 * frame so the page reads as a magazine, not a row of identical cards:
 *
 *   variant: 'photo' (default)
 *     Editorial photo inside the frame, with optional portrait crop via
 *     `photoFit: 'portrait'` for tighter face framing.
 *
 *   variant: 'bib'
 *     Typographic BIB 0001 startnummer plate. No photo. Pure marathon
 *     race-bib energy — used on §03 SPRINT.
 *
 *   variant: 'trust'
 *     Giant 400 / 14 numerals with TAUSEND / MILLIONEN suffix labels,
 *     plus a small book-stack inset. Used on §05 TRUST.
 *
 * Photos are bundled local assets (/landing/*) or picsum fallback. If a
 * photo fails to load the frame + metadata still render — the section
 * is never broken.
 */

const SpecimenFrame = ({ children, code, nr, isDark, total = 5 }) => (
  <div
    className={`relative aspect-[4/5] w-full border ${
      isDark ? 'border-white/20 bg-[#0A0A0A]' : 'border-foreground/20 bg-foreground/[0.03]'
    } overflow-hidden`}
    data-testid={`benefit-visual-${nr}`}
  >
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

const PhotoBody = ({ photo, isDark, photoFit }) => (
  <>
    {photo ? (
      <img
        src={photo}
        alt=""
        className={`absolute inset-0 w-full h-full ${
          photoFit === 'portrait' ? 'object-cover object-[50%_25%]' : 'object-cover'
        } ${isDark ? 'opacity-80' : 'opacity-95'}`}
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
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-10 h-24 pointer-events-none"
      style={{
        background: isDark
          ? 'linear-gradient(to top, rgba(10,10,10,0.6), transparent)'
          : 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)',
      }}
    />
  </>
);

// Marathon race-bib plate. SVG cutouts in the corners sell the
// "actually a numbered start-plate" read.
const BibBody = ({ isDark }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-12 pb-12">
    <div
      className={`relative w-[88%] max-w-[280px] aspect-[5/4] border-[2.5px] ${
        isDark ? 'border-white/85 bg-[#0A0A0A]' : 'border-foreground/85 bg-background'
      } flex flex-col items-center justify-between py-4`}
      style={{ borderRadius: '8px' }}
    >
      {/* corner punch-holes */}
      {[
        'top-2 left-2', 'top-2 right-2',
        'bottom-2 left-2', 'bottom-2 right-2',
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute ${pos} w-2.5 h-2.5 rounded-full border ${
            isDark ? 'border-white/60 bg-[#0A0A0A]' : 'border-foreground/60 bg-background'
          }`}
        />
      ))}

      <span
        className={`text-[8.5px] font-bold uppercase tracking-[0.28em] font-mono ${
          isDark ? 'text-white/75' : 'text-foreground/75'
        }`}
      >
        LEADER-OS &nbsp;·&nbsp; KOHORTE 01
      </span>

      <span
        className={`leading-none ${isDark ? 'text-white' : 'text-foreground'}`}
        style={{
          fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(72px, 12vw, 132px)',
          letterSpacing: '-0.02em',
        }}
      >
        0001
      </span>

      <span
        className={`text-[8.5px] font-bold uppercase tracking-[0.28em] font-mono text-center px-3 ${
          isDark ? 'text-white/70' : 'text-foreground/70'
        }`}
      >
        Startnummer<br />Für deine Führungs-Evolution
      </span>
    </div>
  </div>
);

// Big-numbers trust wall. 400 + 14 with TAUSEND / MILLIONEN beneath,
// optional book-stack image bottom-right for editorial texture.
const TrustBody = ({ photo, isDark, trustNumbers = [] }) => {
  const [a, b] = trustNumbers;
  return (
    <div className="absolute inset-0">
      {photo && (
        <img
          src={photo}
          alt=""
          className="absolute right-0 bottom-10 h-[55%] w-[55%] object-cover object-right opacity-70"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 px-6 pt-14 pb-14 flex flex-col justify-center gap-4">
        {[a, b].filter(Boolean).map((n, i) => (
          <div key={i} className="flex items-baseline gap-3">
            <span
              className={isDark ? 'text-white' : 'text-foreground'}
              style={{
                fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(56px, 10vw, 104px)',
                lineHeight: 0.85,
                letterSpacing: '-0.04em',
              }}
            >
              {n.big}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.22em] font-mono ${
                isDark ? 'text-white/65' : 'text-foreground/65'
              }`}
            >
              {n.suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BenefitVisual = ({
  nr,
  code,
  photo,
  photoFit,
  variant = 'photo',
  trustNumbers,
  isDark = false,
  total = 5,
}) => (
  <SpecimenFrame nr={nr} code={code} isDark={isDark} total={total}>
    {variant === 'bib' && <BibBody isDark={isDark} />}
    {variant === 'trust' && (
      <TrustBody photo={photo} isDark={isDark} trustNumbers={trustNumbers} />
    )}
    {(variant === 'photo' || !variant) && (
      <PhotoBody photo={photo} isDark={isDark} photoFit={photoFit} />
    )}
  </SpecimenFrame>
);
