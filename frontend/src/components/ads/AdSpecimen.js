import { AD_PALETTES } from '../../data/contentAds';

/**
 * AdSpecimen · Netflix-Bites-DNA für Leader-OS-Werbeflächen.
 *
 * Komposition pro Tile:
 *   - voller Hintergrund in `palette.bg` (gesättigte Brand-Farbe)
 *   - 1 Portrait-Foto, gecroppt auf full-bleed mit `object-cover`
 *   - oben links: 2-zeilige TRACKED UPPERCASE Headline in `palette.hi`
 *   - unten: zweite Headline + Datum/CTA-Strip + URL
 *   - Tracking 0.02em, Weight 900, Font Outfit (kein Italic · Ads
 *     sollen lauter sein als die editorial-Specimen).
 *
 * Drei Aspect-Ratios:
 *   '1x1'  → 1080×1080  Meta-Feed
 *   '4x5'  → 1080×1350  Meta-Feed-Vertical
 *   '9x16' → 1080×1920  Stories · Reels · TikTok
 *
 * Das ganze rendert auf einer 1080-Breite-Bühne; im Studio wird der
 * Stage via CSS-Transform runter-skaliert. Beim Screenshot greift
 * das Modal die native Auflösung.
 */

const RATIO = {
  '1x1':  { w: 1080, h: 1080 },
  '4x5':  { w: 1080, h: 1350 },
  '9x16': { w: 1080, h: 1920 },
};

const LINES = (raw) => raw.split('\n');

const HeadlineBlock = ({ text, color, size, align = 'left' }) => (
  <div
    className={`leading-[0.86] ${align === 'center' ? 'text-center' : ''}`}
    style={{
      color,
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
      fontWeight: 900,
      letterSpacing: '0.005em',
      fontSize: size,
      textTransform: 'uppercase',
    }}
  >
    {LINES(text).map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

export const AdSpecimen = ({ ad, scale = 0.4 }) => {
  const dim = RATIO[ad.format] || RATIO['1x1'];
  const palette = AD_PALETTES[ad.palette] || AD_PALETTES.midnight;

  // Headline-Größe skaliert mit dem Format, damit eine 9x16-Story
  // nicht denselben Headline-Block hat wie ein 1x1-Feed.
  const heroSize = ad.format === '9x16' ? 132 : 116;
  const subSize = ad.format === '9x16' ? 116 : 102;

  return (
    <div
      data-ad-id={ad.id}
      className="relative shrink-0 overflow-hidden shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]"
      style={{
        width: dim.w * scale,
        height: dim.h * scale,
        backgroundColor: palette.bg,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: dim.w,
          height: dim.h,
          transform: `scale(${scale})`,
          backgroundColor: palette.bg,
        }}
      >
        {/* ── Foto-Layer (full-bleed, hinter dem Text) ── */}
        {ad.photo && (
          <img
            src={ad.photo}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: ad.photoFit || 'cover' }}
            crossOrigin="anonymous"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}

        {/* ── Farb-Wash damit Text immer lesbar ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg,
              ${palette.bg}EE 0%,
              ${palette.bg}55 20%,
              ${palette.bg}11 50%,
              ${palette.bg}55 80%,
              ${palette.bg}EE 100%)`,
          }}
        />

        {/* ── Inhalt ── */}
        <div className="absolute inset-0 flex flex-col justify-between p-[72px]">
          {/* TOP: kleinere Eyebrow-Headline */}
          <HeadlineBlock
            text={ad.topText}
            color={palette.hi}
            size={subSize}
          />

          {/* MITTE: ggf. Logo / Watermark · bewusst leer für Foto-Atmung */}
          <div />

          {/* BOTTOM: Haupt-Title + Strip */}
          <div className="space-y-10">
            <HeadlineBlock
              text={ad.titleText}
              color={palette.hi}
              size={heroSize}
            />

            <div className="flex items-end justify-between gap-6 pt-8 border-t-4" style={{ borderColor: palette.hi }}>
              <div className="space-y-2" style={{ color: palette.lo }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  {ad.bottomText}
                </div>
              </div>
              <div
                className="shrink-0 inline-flex items-center justify-center px-6 py-3"
                style={{
                  backgroundColor: palette.hi,
                  color: palette.bg,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                ▸ {ad.cta}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AD_RATIO = RATIO;
