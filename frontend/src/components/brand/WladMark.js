/**
 * WladMark — Premium asymmetric "W" mark for Leader-OS.
 *
 * Design rationale (Iter 92):
 *   The previous mark read as a generic ascending bar chart. Mert asked for
 *   something pixel-styled, asymmetric, animated, and unmistakably built
 *   around the letter "W" — i.e. the mark must spell W on first glance,
 *   while still feeling premium / glitch-tech.
 *
 *   New geometry:
 *     - Bold thick "W" letterform (custom hand-tuned path, not a font glyph)
 *     - Asymmetric: the right leg is taller / heavier than the left, with a
 *       single pixel "crown" floating off the top-right vertex
 *     - Pixel-style accents: 3 chunky squares orbit the mark
 *     - Animations: idle slow-glitch + hover trace-stroke + scan-line shimmer
 *
 * Modes:
 *   size           — pixel size (28 default)
 *   variant        — 'solid' (lime tile, dark glyph) | 'outline' (no bg)
 *   className      — extra wrapper classes
 *   animated       — adds idle-glitch + interaction-shimmer
 */
import { forwardRef } from 'react';

export const WladMark = forwardRef(({
  size = 28,
  variant = 'solid',
  className = '',
  animated = false,
  ...props
}, ref) => {
  const isSolid = variant === 'solid';
  const glyphFill = isSolid ? '#0A0A0A' : '#BFFF00';
  const accentFill = isSolid ? '#0A0A0A' : '#D4FF4D';

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

      {/* Scan-line shimmer (only animated) */}
      {animated && (
        <span aria-hidden className="absolute inset-0 rounded-[28%] overflow-hidden pointer-events-none">
          <span className="wlad-mark-scanline" />
        </span>
      )}

      {/*  ASYMMETRIC "W" GLYPH
            32×32 grid. Hand-tuned bold W with intentional asymmetry:
            - left leg starts at x=3, has 2.6 stroke
            - middle V dips to y=20 (shallow)
            - right leg ends higher than left (asymmetry) and is 0.6 thicker
            - tiny crown pixel floats off the right tip
       */}
      <svg
        viewBox="0 0 32 32"
        width={size * 0.78}
        height={size * 0.78}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 wlad-mark-glyph"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="wm-stroke" x1="4" y1="26" x2="28" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={glyphFill} stopOpacity="0.95" />
            <stop offset="100%" stopColor={glyphFill} />
          </linearGradient>
          <linearGradient id="wm-accent" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={accentFill} />
            <stop offset="100%" stopColor={accentFill} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Drop-shadow ghost (asymmetric offset for depth) */}
        <path
          d="M4.4 7.2 L9.0 26.8 L13.0 14.4 L17.0 26.8 L22.0 12.0 L25.4 26.4"
          stroke={glyphFill}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.18"
          transform="translate(0.8 0.8)"
        />

        {/* Main W stroke — the centerpiece */}
        <path
          className="wlad-mark-w"
          d="M3.6 6.4 L8.2 26.0 L12.2 13.6 L16.2 26.0 L21.2 11.2 L24.6 25.6"
          stroke="url(#wm-stroke)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Asymmetric heavy right tail — extra stroke that makes the W
            visually heavier on the right (signature asymmetry). */}
        <path
          className="wlad-mark-tail"
          d="M21.2 11.2 L25.4 23.0"
          stroke="url(#wm-stroke)"
          strokeWidth="3.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pixel accent #1 — left valley dot */}
        <rect className="wlad-mark-pixel-a" x="11" y="6.4" width="2.2" height="2.2" rx="0.35" fill="url(#wm-accent)" />
        {/* Pixel accent #2 — right crown */}
        <rect className="wlad-mark-pixel-b" x="25.6" y="3.4" width="2.6" height="2.6" rx="0.4" fill="url(#wm-accent)" />
        {/* Pixel accent #3 — lower trailing pixel (off-axis for asymmetry) */}
        <rect className="wlad-mark-pixel-c" x="6.4" y="27.8" width="1.6" height="1.6" rx="0.3" fill="url(#wm-accent)" opacity="0.7" />
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
