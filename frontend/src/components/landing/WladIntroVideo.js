import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WladIntroVideo — Selbst-gehostetes Wlad-Intro mit eingeblendetem
 * Text-Overlay und Outro-Card.
 *
 * Verhalten:
 *   - HTML5 video, autoplay-muted (DSGVO-konform, browser-allowed).
 *   - Klick anywhere → unmute + play. Pause → erscheint wieder play-affordance.
 *   - Text-Overlays werden zu definierten Sekunden eingeblendet (siehe CUES).
 *     Jede Cue: ein editorial Nike-DNA-Tile, fade-in, fade-out.
 *   - Beim "ended"-Event erscheint die Outro-Card mit CTA über dem Video.
 *
 * Editierbar: CUES-Array unten. Format: {start, end, eyebrow, headline, accent}.
 * Sekunden anpassen sobald wir die Video-Zeitpunkte kennen.
 */

const CUES = [
  { start: 0.5,  end: 5.0,  eyebrow: '▸ WLAD JACHTCHENKO',           headline: 'Hi, ich bin',       accent: 'Wlad' },
  { start: 5.5,  end: 11,   eyebrow: '▸ WAS WIR LÖSEN',              headline: 'KI bestimmt das Tempo.', accent: 'Du den Kurs.' },
  { start: 11.5, end: 18,   eyebrow: '▸ ZEHN SEKUNDEN',              headline: 'Diagnose.',         accent: 'Kostenlos.' },
  { start: 18.5, end: 24,   eyebrow: '▸ POWERED BY',                 headline: 'WladBot.',          accent: '24 / 7' },
];

const Cue = ({ cue }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="absolute inset-x-6 md:inset-x-12 bottom-8 md:bottom-14 pointer-events-none"
  >
    <div className="bg-white/95 backdrop-blur-md border-2 border-black p-5 md:p-7 max-w-xl shadow-[8px_8px_0_0_#000]">
      <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-strong font-mono mb-3">
        {cue.eyebrow}
      </div>
      <div
        className="text-black leading-[0.9] tracking-[-0.04em]"
        style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(36px, 6vw, 64px)' }}
      >
        {cue.headline}<br />
        <span className="text-black/55">{cue.accent.replace(/\.$/, '')}</span>
        <span className="text-brand not-italic">.</span>
      </div>
    </div>
  </motion.div>
);

const Outro = ({ onRestart }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="absolute inset-0 bg-white flex items-center justify-center px-6"
  >
    <div className="text-center max-w-2xl">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-6 font-mono">
        ▸ JETZT DRAN
      </div>
      <h3
        className="leading-[0.9] tracking-[-0.045em] text-black"
        style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(52px, 10vw, 120px)' }}
      >
        Finde deinen<br />
        <span className="text-black/55">Startpunkt</span>
        <span className="text-brand not-italic">.</span>
      </h3>
      <p className="mt-8 text-[14.5px] md:text-[16px] leading-[1.6] text-black/70 max-w-md mx-auto">
        Fünf Minuten. Drei Dimensionen. Sofort dein BIB-Score plus eine
        ehrliche Empfehlung was dein nächster Schritt ist.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <a
          href="/quiz"
          className="inline-flex items-center gap-2 px-7 py-4 bg-brand text-black text-[13px] font-bold uppercase tracking-[0.18em] shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_#000] transition-all"
        >
          <span className="text-base font-black">+</span>
          Diagnose starten
        </a>
        <button
          type="button"
          onClick={onRestart}
          className="text-[12px] font-bold uppercase tracking-[0.18em] text-black/55 hover:text-black transition-colors font-mono"
        >
          ↻ Video nochmal
        </button>
      </div>
    </div>
  </motion.div>
);

export const WladIntroVideo = () => {
  const ref = useRef(null);
  const [activeCue, setActiveCue] = useState(null);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const onTime = () => {
      const t = v.currentTime;
      const cue = CUES.find((c) => t >= c.start && t < c.end);
      setActiveCue(cue || null);
    };
    const onEnded = () => setEnded(true);
    const onPlay = () => setEnded(false);

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    v.addEventListener('play', onPlay);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('play', onPlay);
    };
  }, []);

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const restart = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    setEnded(false);
    v.play().catch(() => {});
  };

  return (
    <section
      id="wlad-intro"
      className="relative w-full bg-white border-y-2 border-black"
      aria-label="Wlad Intro Video"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-12 md:py-20">
        <div className="mb-6 md:mb-8 flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-3 font-mono">
              ▸ INTRO · WLAD IN 90 SEK
            </p>
            <h2
              className="text-[40px] sm:text-[60px] md:text-[80px] leading-[0.92] tracking-[-0.04em] text-black"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Bevor du startest<span className="text-brand">.</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={toggleMute}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/55 hover:text-black transition-colors border border-black/15 px-3 py-2 font-mono"
          >
            {muted ? '▸ TON AN' : '▸ TON AUS'}
          </button>
        </div>

        <div className="relative aspect-video border-2 border-black overflow-hidden shadow-[10px_10px_0_0_#000] bg-black">
          <video
            ref={ref}
            src="/videos/wlad-intro.mp4"
            autoPlay
            muted
            playsInline
            loop={false}
            preload="metadata"
            className="w-full h-full object-cover"
            data-testid="wlad-intro-video"
          />

          {/* Edge-darken-vignette für besser lesbare Cues */}
          {!ended && activeCue && (
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 45%)',
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {!ended && activeCue && <Cue key={activeCue.start} cue={activeCue} />}
          </AnimatePresence>

          <AnimatePresence>
            {ended && <Outro key="outro" onRestart={restart} />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
