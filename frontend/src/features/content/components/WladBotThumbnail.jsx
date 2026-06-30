import { useState } from 'react';
import { WLADBOT_AVATAR } from '../../../lib/brandAssets';

/**
 * WladBotThumbnail · branded "thumbnail-with-text" cover for journal
 * articles. Consistent Leader-OS branding (black canvas, lime accent,
 * mono eyebrow, italic display title) with the WladBot 3.0 render as the
 * recurring brand character. Used as the cover wherever an article has no
 * explicit photographic `cover`, so the journal reads as one branded set
 * instead of random stock photography.
 *
 * The WladBot image self-hides if the asset is missing, so the thumbnail
 * still looks intentional (title + lime) before wladbot3.0.png lands.
 *
 * Props:
 *   - title:   article title (the headline text in the thumbnail)
 *   - eyebrow: small mono label (default 'LEADER·OS')
 *   - showText: false → image-only branded tile (the plain option)
 */
export const WladBotThumbnail = ({ title = '', eyebrow = 'LEADER·OS', showText = true }) => {
  const [faceFailed, setFaceFailed] = useState(false);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#0A0A0A]">
      {/* Lime brand mesh + faint grid · keeps the tile alive, never flat. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(at 82% 28%, rgba(191,255,0,0.18) 0px, transparent 55%), ' +
            'radial-gradient(at 0% 100%, rgba(191,255,0,0.06) 0px, transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative z-10 flex h-full items-center gap-3 p-5 md:p-6">
        {showText && (
          <div className="min-w-0 flex-1">
            <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-brand">
              ▸ {eyebrow}
            </div>
            <div
              className="text-white leading-[1.04] tracking-[-0.02em]"
              style={{
                fontFamily: 'Outfit, Inter, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(18px, 2.2vw, 26px)',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
              }}
            >
              {title.replace(/\.$/, '')}
              <span className="text-brand not-italic">.</span>
            </div>
          </div>
        )}

        {!faceFailed && (
          <img
            src={WLADBOT_AVATAR}
            alt="WladBot · dein KI-Coach"
            loading="lazy"
            decoding="async"
            onError={() => setFaceFailed(true)}
            className={`${showText ? 'h-[82%] max-w-[40%] self-end' : 'mx-auto h-[88%]'} w-auto shrink-0 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]`}
          />
        )}
      </div>

      {/* Lime baseline rule · brand signature. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-brand/80" />
    </div>
  );
};
