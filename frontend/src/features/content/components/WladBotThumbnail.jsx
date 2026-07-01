/**
 * WladBotThumbnail · branded editorial cover for journal articles that have
 * no explicit photographic `cover`. Instead of the same figure on every
 * card, each article gets one of ten on-brand abstract textures
 * (black canvas + lime accents · /journal/covers/cover-NN.webp), picked
 * deterministically from the title so the blog reads as a varied,
 * image-rich set while staying on-brand and fast (~13 KB webp each).
 *
 * Props:
 *   - title:   article title (headline text on the cover)
 *   - eyebrow: small mono label (default 'LEADER·OS')
 *   - showText: false → texture-only tile (no headline overlay)
 */

const COVER_COUNT = 10;

// Stable hash → cover index 1..COVER_COUNT. Same title always maps to the
// same texture (no layout shift, deterministic across renders/SSR).
const coverFor = (title = '') => {
  let h = 0;
  for (let i = 0; i < title.length; i += 1) {
    h = (h * 31 + title.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(h) % COVER_COUNT) + 1;
};

export const WladBotThumbnail = ({ title = '', eyebrow = 'LEADER·OS', showText = true }) => {
  const idx = String(coverFor(title)).padStart(2, '0');

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#0A0A0A]">
      {/* Deterministic on-brand texture · varies per article. */}
      <img
        src={`/journal/covers/cover-${idx}.webp`}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Legibility wash · keeps the italic title readable on any texture. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(10,10,10,0.86) 0%, rgba(10,10,10,0.5) 45%, rgba(10,10,10,0.15) 100%)',
        }}
      />

      {showText && (
        <div className="relative z-10 flex h-full items-end p-5 md:p-6">
          <div className="min-w-0">
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
        </div>
      )}

      {/* Lime baseline rule · brand signature. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-brand/80" />
    </div>
  );
};
