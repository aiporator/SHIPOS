/**
 * WladMark — Das offizielle Premium-Logo für Leader-OS.
 *
 * Geometrie: Drei aufsteigende Linien innerhalb eines abgerundeten
 * Containers, die das „W" formen UND gleichzeitig den 3-Säulen-Aufstieg
 * (Inspire → Convince → Lead) abbilden. Inspiration: Revolut-Mark,
 * Stripe, Linear — minimal, geometrisch, sofort wiedererkennbar.
 *
 * Modi:
 *   size           — Pixel-Größe (24 default)
 *   variant        — 'solid' (Brand bg, dark text) | 'outline' (transparent)
 *   className      — extra wrapper classes
 *   animated       — hover-pulse + interaction-glow
 *   withWordmark   — render side wordmark text next to mark
 */
import { forwardRef } from 'react';

export const WladMark = forwardRef(({
  size = 28,
  variant = 'solid',
  className = '',
  animated = false,
  ...props
}, ref) => {
  // Two distinct visual treatments. Solid = filled lime tile, Outline = mark
  // floating on transparent container (used on the brand bg itself).
  const isSolid = variant === 'solid';

  return (
    <span
      ref={ref}
      className={`relative inline-flex items-center justify-center shrink-0 group ${animated ? 'wlad-mark-animated' : ''} ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* Background tile — only for solid variant */}
      {isSolid && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-[28%] transition-all duration-300 group-hover:scale-[1.04]"
          style={{
            background: 'linear-gradient(135deg, #D4FF4D 0%, #BFFF00 60%, #9ACC00 100%)',
            boxShadow: '0 4px 16px -4px rgba(191,255,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        />
      )}

      {/* SVG mark — ASCENDING PIXEL CHART
          Three rising columns connected by an upward W stroke. The pattern
          reads as a clear "going-up" chart while still spelling W: each peak
          higher than the previous, with thick chunky pixel-style strokes. */}
      <svg
        viewBox="0 0 32 32"
        width={size * 0.74}
        height={size * 0.74}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        shapeRendering="crispEdges"
      >
        <defs>
          <linearGradient id="wm-stroke" x1="4" y1="26" x2="28" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isSolid ? '#0A0A0A' : '#BFFF00'} />
            <stop offset="100%" stopColor={isSolid ? '#1A1A1A' : '#D4FF4D'} />
          </linearGradient>
        </defs>

        {/* Pixel-style ascending columns — each step taller than the last */}
        <g fill="url(#wm-stroke)">
          <rect x="3"  y="18" width="3" height="9"  rx="0.5" />
          <rect x="9"  y="14" width="3" height="13" rx="0.5" />
          <rect x="15" y="10" width="3" height="17" rx="0.5" />
          <rect x="21" y="6"  width="3" height="21" rx="0.5" />
          <rect x="27" y="3"  width="3" height="24" rx="0.5" />
        </g>

        {/* Subtle W-connecting underline that ties the chart to the brand */}
        <path
          d="M3 27 L30 27"
          stroke={isSolid ? '#0A0A0A' : '#BFFF00'}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
          className="wlad-mark-path"
        />

        {/* Crown-dot — apex accent on top of the tallest bar */}
        <circle
          cx="28.5"
          cy="2.5"
          r="1.7"
          fill={isSolid ? '#0A0A0A' : '#BFFF00'}
          className="wlad-mark-dot"
        />
      </svg>
    </span>
  );
});

WladMark.displayName = 'WladMark';

/**
 * Wordmark wrapper — Mark + brand text combo for nav headers.
 */
export const WladWordmark = ({ size = 30, tagline, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2.5 group"
    data-testid="brand-wordmark"
  >
    <WladMark size={size} animated />
    <span className="flex flex-col items-start leading-none">
      <span className="text-[14px] font-black tracking-tight bg-clip-text text-transparent transition-all"
            style={{
              fontFamily: 'Outfit, Inter, sans-serif',
              backgroundImage: 'linear-gradient(135deg, currentColor 0%, currentColor 50%, currentColor 100%)',
              WebkitBackgroundClip: 'text',
            }}>
        Leader<span className="opacity-60">·</span>OS
      </span>
      {tagline && (
        <span className="text-[7.5px] tracking-[0.22em] uppercase font-bold mt-[2.5px] opacity-40">
          {tagline}
        </span>
      )}
    </span>
  </button>
);

export default WladMark;
