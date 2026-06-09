/**
 * BenefitVisual — section-specific inline visual anchor.
 *
 * Pure SVG + Tailwind. Zero external image dependencies, always loads,
 * brand-themed via `currentColor` so dark mode flips correctly.
 *
 * Each § renders a unique editorial-grade visual that anchors the
 * specimen-sheet aesthetic:
 *
 *   §01 — 11 vertical track lanes (Frameworks = lanes)
 *   §02 — Phone silhouette with lime chat-bubble grid (24/7 Coach)
 *   §03 — 30-day grid with motion-trail (Sprint)
 *   §04 — Massive Outfit W mark in framed pedestal (Wlad's identity)
 *   §05 — Bar-chart of 400K and 14M stats with axis labels (Trust)
 *   §06 — Certificate document with stamp + signature (Zertifikat)
 *   §07 — Dark mesh with glowing W + tech-stack icons (WladBot)
 */

const SpecimenFrame = ({ children, code, nr, isDark, className = '' }) => (
  <div
    className={`relative aspect-[4/5] w-full border-2 ${
      isDark ? 'border-white/15 bg-[#0A0A0A]' : 'border-foreground/15 bg-background'
    } overflow-hidden ${className}`}
    data-testid={`benefit-visual-${nr}`}
  >
    <div
      className={`absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2.5 border-b ${
        isDark ? 'border-white/10 text-white/55' : 'border-foreground/10 text-foreground/55'
      } text-[9px] font-bold uppercase tracking-[0.22em] font-mono z-10`}
    >
      <span>§ {nr} / 07</span>
      <span className="text-brand">{code}</span>
    </div>

    {children}

    <div
      className={`absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2.5 border-t ${
        isDark ? 'border-white/10 text-white/40' : 'border-foreground/10 text-foreground/40'
      } text-[9px] font-bold uppercase tracking-[0.22em] font-mono z-10`}
    >
      <span>LEADER-OS</span>
      <span>{`No. ${nr}/07`}</span>
    </div>
  </div>
);

const TrackLanes = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="none"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {Array.from({ length: 11 }).map((_, i) => {
      const x = 8 + i * 8.4;
      return (
        <line
          key={i}
          x1={x}
          y1="12"
          x2={x}
          y2="118"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="0.55"
        />
      );
    })}
    <line x1="8" y1="118" x2="92" y2="118" stroke="#BFFF00" strokeWidth="0.9" />
    <text x="10" y="125" fontSize="3.5" fontWeight="700" fill="currentColor" opacity="0.5">
      LANE 01 ── 11
    </text>
  </svg>
);

const PhoneCoach = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {/* Phone outline */}
    <rect x="32" y="14" width="36" height="102" rx="5" ry="5" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.6" />
    {/* Notch */}
    <rect x="44" y="18" width="12" height="1.6" rx="0.8" fill="currentColor" fillOpacity="0.4" />
    {/* Screen */}
    <rect x="34.5" y="22" width="31" height="89" rx="2" fill="currentColor" fillOpacity="0.02" />
    {/* Chat bubbles */}
    <rect x="36.5" y="28" width="20" height="6" rx="2" fill="currentColor" fillOpacity="0.12" />
    <rect x="42" y="38" width="22" height="6" rx="2" fill="#BFFF00" fillOpacity="0.85" />
    <rect x="36.5" y="48" width="18" height="6" rx="2" fill="currentColor" fillOpacity="0.12" />
    <rect x="40" y="58" width="24" height="9" rx="2" fill="#BFFF00" fillOpacity="0.85" />
    <rect x="36.5" y="71" width="14" height="6" rx="2" fill="currentColor" fillOpacity="0.12" />
    {/* Status dots */}
    <circle cx="50" cy="105" r="0.7" fill="currentColor" opacity="0.3" />
    <circle cx="50" cy="105" r="2.5" fill="none" stroke="#BFFF00" strokeWidth="0.4" opacity="0.5" />
  </svg>
);

const SprintGrid = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {/* 30 day grid: 5 columns × 6 rows */}
    {Array.from({ length: 30 }).map((_, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = 18 + col * 13;
      const y = 24 + row * 13;
      const isDone = i < 14;
      const isToday = i === 14;
      return (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width="10"
            height="10"
            fill={isToday ? '#BFFF00' : 'currentColor'}
            fillOpacity={isToday ? 1 : isDone ? 0.55 : 0.08}
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="0.3"
          />
          {isToday && (
            <text x={x + 5} y={y + 7.5} fontSize="4" fontWeight="900" textAnchor="middle" fill="#0A0A0A">
              {i + 1}
            </text>
          )}
        </g>
      );
    })}
    <text x="50" y="118" fontSize="3.5" fontWeight="700" fill="currentColor" opacity="0.5" textAnchor="middle">
      TAG 15 VON 30 · KOHORTE 0001
    </text>
  </svg>
);

const WladMark = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {/* Outfit-style W centered */}
    <text
      x="50"
      y="78"
      fontSize="72"
      fontWeight="900"
      fontStyle="italic"
      textAnchor="middle"
      fill="currentColor"
      style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
    >
      W
    </text>
    {/* Lime period */}
    <circle cx="76" cy="74" r="3.5" fill="#BFFF00" />
    {/* Annotations */}
    <line x1="14" y1="50" x2="32" y2="50" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.4" strokeDasharray="1.5 1" />
    <text x="14" y="46" fontSize="3.2" fontWeight="700" fill="currentColor" opacity="0.55">
      [ a. WLAD-MARK ]
    </text>
    <line x1="68" y1="80" x2="86" y2="80" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.4" strokeDasharray="1.5 1" />
    <text x="68" y="88" fontSize="3.2" fontWeight="700" fill="currentColor" opacity="0.55">
      [ b. LIME PUNKT ]
    </text>
    <text x="50" y="110" fontSize="3.5" fontWeight="700" fill="currentColor" opacity="0.5" textAnchor="middle">
      WLAD JACHTCHENKO · METHODIK
    </text>
  </svg>
);

const TrustBars = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {/* Bar 1 — 400K kunden */}
    <text x="14" y="38" fontSize="3.5" fontWeight="700" fill="currentColor" opacity="0.5">
      KUNDEN
    </text>
    <rect x="14" y="42" width="72" height="6" fill="currentColor" fillOpacity="0.08" />
    <rect x="14" y="42" width="68" height="6" fill="#BFFF00" />
    <text x="14" y="56" fontSize="7" fontWeight="900" fill="currentColor" fontStyle="italic" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      400.000
    </text>
    {/* Bar 2 — 14M views */}
    <text x="14" y="74" fontSize="3.5" fontWeight="700" fill="currentColor" opacity="0.5">
      VIEWS · PODCAST + YOUTUBE
    </text>
    <rect x="14" y="78" width="72" height="6" fill="currentColor" fillOpacity="0.08" />
    <rect x="14" y="78" width="64" height="6" fill="currentColor" fillOpacity="0.6" />
    <text x="14" y="92" fontSize="7" fontWeight="900" fill="currentColor" fontStyle="italic" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      14.000.000
    </text>
    {/* Bar 3 — 3 Bestseller */}
    <text x="14" y="106" fontSize="3.5" fontWeight="700" fill="currentColor" opacity="0.5">
      SPIEGEL-BESTSELLER
    </text>
    <rect x="14" y="110" width="72" height="6" fill="currentColor" fillOpacity="0.08" />
    <rect x="14" y="110" width="18" height="6" fill="currentColor" fillOpacity="0.4" />
    <text x="14" y="124" fontSize="7" fontWeight="900" fill="currentColor" fontStyle="italic" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      3 ×
    </text>
  </svg>
);

const Certificate = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {/* Certificate paper, slightly tilted */}
    <g transform="rotate(-2 50 65)">
      <rect x="16" y="22" width="68" height="86" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
      <text x="50" y="40" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
        ZERTIFIKAT
      </text>
      <line x1="32" y1="44" x2="68" y2="44" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.3" />
      <text x="50" y="54" fontSize="2.8" fontWeight="700" textAnchor="middle" fill="currentColor" opacity="0.55">
        KOHORTE 01 · NR. 0001
      </text>
      <text x="50" y="68" fontSize="6" fontStyle="italic" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
        Anna Schmidt
      </text>
      <text x="50" y="76" fontSize="2.6" textAnchor="middle" fill="currentColor" opacity="0.55">
        hat den 30-Tage Sprint
      </text>
      <text x="50" y="80" fontSize="2.6" textAnchor="middle" fill="currentColor" opacity="0.55">
        erfolgreich abgeschlossen.
      </text>
      {/* Signature line */}
      <line x1="32" y1="94" x2="50" y2="94" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.3" />
      <text x="32" y="100" fontSize="2.2" fill="currentColor" opacity="0.5">
        Wlad Jachtchenko
      </text>
      {/* Lime stamp */}
      <circle cx="66" cy="92" r="6.5" fill="none" stroke="#BFFF00" strokeWidth="0.6" />
      <text x="66" y="94" fontSize="4" fontWeight="900" textAnchor="middle" fill="#BFFF00" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
        W
      </text>
    </g>
  </svg>
);

const WladBotTech = () => (
  <svg
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    className="absolute inset-0 w-full h-full"
  >
    {/* Glowing center W */}
    <defs>
      <radialGradient id="wlimeGlow" cx="50%" cy="42%" r="50%">
        <stop offset="0%" stopColor="#BFFF00" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#BFFF00" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="100" height="130" fill="url(#wlimeGlow)" />
    <text
      x="50"
      y="62"
      fontSize="56"
      fontWeight="900"
      fontStyle="italic"
      textAnchor="middle"
      fill="#BFFF00"
      style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
    >
      W
    </text>

    {/* Tech-stack labels orbiting */}
    <text x="14" y="90" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.85">▸ GPT 5.2</text>
    <text x="14" y="98" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.85">▸ VOYAGE-3</text>
    <text x="14" y="106" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.85">▸ RRF HYBRID</text>
    <text x="65" y="90" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.85">▸ 2 212 CHUNKS</text>
    <text x="65" y="98" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.85">▸ DE / EN</text>
    <text x="65" y="106" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.85">▸ DSGVO</text>

    <text x="50" y="120" fontSize="3.5" fontWeight="700" fill="#ffffff" opacity="0.55" textAnchor="middle">
      ENGINEERED FOR LEADERSHIP
    </text>
  </svg>
);

const RENDERERS = {
  '01': TrackLanes,
  '02': PhoneCoach,
  '03': SprintGrid,
  '04': WladMark,
  '05': TrustBars,
  '06': Certificate,
  '07': WladBotTech,
};

const CODES = {
  '01': '11 LANES',
  '02': 'CHAT · 24/7',
  '03': 'TAG 15 / 30',
  '04': 'WLAD · MARK',
  '05': '400K · 14M',
  '06': 'NR · 0001',
  '07': 'GPT 5.2',
};

export const BenefitVisual = ({ nr, isDark = false }) => {
  const Render = RENDERERS[nr];
  if (!Render) return null;
  return (
    <SpecimenFrame nr={nr} code={CODES[nr]} isDark={isDark}>
      <div className={`absolute inset-x-0 top-10 bottom-10 ${isDark ? 'text-white' : 'text-foreground'}`}>
        <Render />
      </div>
    </SpecimenFrame>
  );
};
