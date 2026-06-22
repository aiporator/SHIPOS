import { useEffect, useState } from 'react';
import { AdSpecimen } from '../components/ads/AdSpecimen';
import { AD_SERIES, AD_PALETTES } from '../data/contentAds';

/**
 * AdStudio · internal Paid-Ad-Studio bei /ads.
 *
 * Schwester-Seite zum Specimen-Studio: gleiches Workflow-Pattern
 * (Grid → Native-Size-Modal → Screenshot → Copy-Caption), aber für
 * die laute Netflix-Bites-DNA statt der editorial-stillen Specimens.
 *
 * Beweis-of-Concept dass das Design lebendig aus dem Codebase
 * gemanaged wird: Edit `frontend/src/data/contentAds.js` →
 * `git push` → Vercel rebuild → live unter /ads in ~90 Sek.
 * Kein Figma-Hop, kein Asset-Übergabe, eine Wahrheit.
 */

export default function AdStudio() {
  const [format, setFormat] = useState('all');
  const [palette, setPalette] = useState('all');
  const [nativeId, setNativeId] = useState(null);

  useEffect(() => {
    document.title = 'Ad-Studio · Leader-OS Paid Creatives';
  }, []);

  const ads = AD_SERIES.filter((a) => {
    if (format !== 'all' && a.format !== format) return false;
    if (palette !== 'all' && a.palette !== palette) return false;
    return true;
  });

  const nativeAd = nativeId ? AD_SERIES.find((a) => a.id === nativeId) : null;

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-black">
      {/* ── Top-Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#F5F5F2]/95 backdrop-blur-md border-b border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black text-brand font-black"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              W
            </span>
            <div>
              <div
                className="text-[18px] font-black tracking-tight"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}
              >
                Ad<span className="text-brand mx-0.5">·</span>Studio
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/50 font-mono">
                Meta · Stories · Reels · TikTok
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] font-mono">
            <span className="text-black/45 mr-1">▸ FORMAT</span>
            {['all', '1x1', '4x5', '9x16'].map((k) => (
              <button
                key={k}
                onClick={() => setFormat(k)}
                className={`px-2.5 py-1.5 border transition-colors ${
                  format === k
                    ? 'bg-black text-white border-black'
                    : 'border-black/20 text-black/60 hover:border-black/60 hover:text-black'
                }`}
              >
                {k}
              </button>
            ))}
            <span className="text-black/45 mr-1 ml-2">▸ PALETTE</span>
            {['all', ...Object.keys(AD_PALETTES)].map((k) => (
              <button
                key={k}
                onClick={() => setPalette(k)}
                className={`px-2.5 py-1.5 border transition-colors ${
                  palette === k
                    ? 'bg-black text-white border-black'
                    : 'border-black/20 text-black/60 hover:border-black/60 hover:text-black'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <h1
          className="text-[44px] md:text-[64px] leading-[0.9] tracking-[-0.04em] mb-3"
          style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
          }}
        >
          {ads.length} Ads.<span className="text-brand">.</span>
        </h1>
        <p className="text-[14px] font-mono uppercase tracking-[0.18em] text-black/55 mb-3">
          ▸ NATIVE GROSSE · TILE KLICKEN · SCREENSHOT · IN META ADS HOCHLADEN
        </p>
        <p className="text-[13px] leading-[1.55] text-black/65 mb-12 max-w-2xl">
          Daten leben in <code className="px-1 py-0.5 bg-black/[0.06]">frontend/src/data/contentAds.js</code>.
          Eine Änderung dort, ein <code className="px-1 py-0.5 bg-black/[0.06]">git push</code>,
          ein Vercel-Rebuild · alle Ads ziehen mit. Kein Figma-Hop, kein
          Asset-Versandt. Das Design wird vom Code gemanaged.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {ads.map((ad) => (
            <article
              key={ad.id}
              className="bg-white border border-black/10 p-5 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-black/55 font-mono">
                <span>
                  {ad.id} · {ad.format} · {ad.palette}
                </span>
                <button
                  onClick={() => setNativeId(ad.id)}
                  className="px-2.5 py-1 bg-black text-white hover:bg-black/80 transition-colors"
                >
                  Native ↗
                </button>
              </div>

              <div className="flex justify-center bg-[#F5F5F2] py-6 border border-black/[0.06]">
                <AdSpecimen ad={ad} scale={ad.format === '9x16' ? 0.22 : 0.32} />
              </div>

              <details className="border-t border-black/10 pt-3 group">
                <summary className="cursor-pointer text-[10.5px] font-bold uppercase tracking-[0.22em] text-black/60 font-mono select-none">
                  ▸ AD-COPY · {ad.slug}
                </summary>
                <pre className="mt-3 text-[12.5px] leading-[1.55] whitespace-pre-wrap font-sans text-black/80 bg-[#FAFAF7] p-3 border border-black/[0.06]">
                  {ad.caption}
                </pre>
                <button
                  onClick={() => navigator.clipboard?.writeText(ad.caption)}
                  className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black/55 hover:text-black font-mono"
                >
                  ▸ Caption kopieren
                </button>
              </details>
            </article>
          ))}
        </div>
      </main>

      {/* ── Native-Size-Modal ──────────────────────────────────── */}
      {nativeAd && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-auto"
          onClick={() => setNativeId(null)}
        >
          <div className="min-h-full flex flex-col items-center justify-center py-12 px-6 gap-6">
            <div
              className="text-white text-[11px] font-bold uppercase tracking-[0.22em] font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              ▸ NATIVE 1080-PIXEL · SCREENSHOT DIESES TILES · KLICK AUSSEN ZUM SCHLIESSEN
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <AdSpecimen ad={nativeAd} scale={1} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
