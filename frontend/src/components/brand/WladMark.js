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

      {/* SVG mark */}
      <svg
        viewBox="0 0 32 32"
        width={size * 0.74}
        height={size * 0.74}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="wm-stroke" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isSolid ? '#0A0A0A' : '#BFFF00'} />
            <stop offset="100%" stopColor={isSolid ? '#0A0A0A' : '#D4FF4D'} />
          </linearGradient>
        </defs>

        {/* The three-stroke "W" — each stroke = ascending leadership pillar.
            Drawn with stroke + linecaps round for a premium-fintech look. */}
        <path
          d="M5 8 L9.5 23 L13.5 14 L18.5 23 L22.5 14 L27 23"
          stroke="url(#wm-stroke)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="wlad-mark-path"
        />

        {/* Crown-dot — apex accent (Revolut-style) */}
        <circle
          cx="16"
          cy="6.5"
          r="1.6"
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
