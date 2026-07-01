import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, PlayCircle } from 'lucide-react';
import { FREE_VIDEOS } from '../../data/freeVideos';
import { captureFreeVideoLead } from '../../lib/leadCapture';

/**
 * FreeVideoFunnelSection · the "4 kostenlose Videos" lead-magnet on the
 * leader-os.de marketing landing.
 *
 * Godmode funnel (Hormozi / Sabri Suby / Brunson DNA):
 *   irresistible free offer  →  email capture  →  register  →  /free-videos
 *   (all 4 unlocked) + a Day 1-4 daily email drip pulling them back.
 *
 * The 4 videos are shown as locked specimen cards — visible, tantalizing,
 * one click from unlocking. Athletic-Editorial DNA per DESIGN.md: black
 * canvas, lime accent, mono BIB-codes, sharp corners, offset shadow.
 */
export const FreeVideoFunnelSection = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = (email || '').trim();
    if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setSubmitting(true);
    setError('');

    await captureFreeVideoLead({ email: trimmed, source: 'free-video-funnel' });

    // Straight to the standalone series page with the videos unlocked · the
    // lead is already captured, so the visitor gets instant gratification.
    navigate('/gratis-videos?unlock=1');
  };

  return (
    <section
      id="free-videos-funnel"
      data-newsletter-zone
      className="relative w-full bg-[#0A0A0A] text-white overflow-hidden"
      aria-label="4 kostenlose Leadership-Videos"
      data-testid="landing-free-video-funnel"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(at 85% 5%, rgba(191,255,0,0.10) 0px, transparent 50%), radial-gradient(at 10% 95%, rgba(191,255,0,0.06) 0px, transparent 55%)',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-10 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-brand mb-4">
            ▸ GRATIS · KEIN RISIKO · SOFORT-ZUGANG
          </div>

          <h2
            className="text-[40px] sm:text-[60px] md:text-[80px] leading-[0.92] tracking-[-0.04em] max-w-4xl"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            4 Videos.
            <br />
            <span className="text-white/55">0&nbsp;€</span>
            <span className="text-brand not-italic">.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-[15px] md:text-[17px] leading-[1.55] text-white/75">
            Registriere dich einmal — und schalte alle 4 Videos sofort frei. Danach schickt dir
            Wlad jeden Tag ein neues Video in dein Postfach. Ein Prinzip pro Tag, direkt anwendbar.
            <span className="text-white"> Keine Karte, kein Abo, kein Haken.</span>
          </p>
        </motion.div>

        {/* The 4 locked specimen cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FREE_VIDEOS.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border-2 border-white/15 bg-white/[0.02] p-5 hover:border-brand transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-brand">
                  TAG {video.day}
                </span>
                <Lock size={15} className="text-white/40 group-hover:text-brand transition-colors" />
              </div>
              <div className="aspect-video w-full bg-black border border-white/10 flex items-center justify-center mb-4">
                <PlayCircle size={30} className="text-white/25 group-hover:text-brand/70 transition-colors" />
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 mb-1">
                {video.tag}
              </div>
              <h3 className="text-[15px] font-black tracking-tight leading-tight">{video.title}</h3>
              <p className="text-[12px] text-white/55 mt-1 leading-snug">{video.subtitle}</p>
              {video.bullets?.[0] && (
                <p className="text-[11.5px] text-white/70 mt-3 pt-3 border-t border-white/10 leading-snug">
                  <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-brand block mb-1">▸ Du lernst u.a.</span>
                  {video.bullets[0]}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Reason-why · one honest line kills the "where's the catch" objection */}
        <p className="mt-8 max-w-2xl text-[13.5px] leading-[1.6] text-white/55">
          Warum kostenlos? Weil die Videos die beste Werbung sind, die wir machen können. Wer danach
          mehr will, testet Leader-OS 14 Tage kostenlos — wer nicht, nimmt 4 Prinzipien mit.
          <span className="text-white/75"> Beides ist okay.</span>
        </p>

        {/* Email capture → register */}
        <div className="mt-12 max-w-xl">
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3" data-testid="free-video-funnel-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dein.name@firma.de"
              required
              className="flex-1 px-4 h-14 bg-white/[0.04] border-2 border-white/20 focus:border-brand focus:bg-white/[0.06] focus:outline-none text-white text-[15px] transition-all font-medium placeholder:text-white/35"
              data-testid="free-video-funnel-email"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-3 px-7 h-14 bg-brand text-[#0A0A0A] border-2 border-brand text-[12.5px] font-black uppercase tracking-[0.08em] hover:brightness-105 active:scale-[0.985] transition-all disabled:opacity-60 whitespace-nowrap"
              data-testid="free-video-funnel-submit"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0A0A] text-brand text-base font-black leading-none">+</span>
              {submitting ? 'Wird freigeschaltet…' : '4 Videos freischalten'}
            </button>
          </form>
          {error && <p className="mt-3 text-[13px] text-red-400 font-semibold">{error}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.22em] font-mono text-white/40">
            <span className="text-brand">▸ SOFORT-ZUGANG</span>
            <span>1 VIDEO / TAG</span>
            <span className="text-white/20">/</span>
            <span>OHNE KARTE</span>
            <span className="text-white/20">/</span>
            <span>JEDERZEIT KÜNDBAR</span>
          </div>
        </div>
      </div>
    </section>
  );
};
