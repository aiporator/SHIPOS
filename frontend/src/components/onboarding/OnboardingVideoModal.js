/**
 * OnboardingVideoModal — Welcome-Video von Wlad nach erstem Login.
 *
 * Iter 92.10 (Mert): Vimeo-Embed statt Drive, GSAP-Choreography statt
 * pure CSS, "FREE/Free"-Wording komplett ausgemerzt — wir verkaufen
 * keine Free-Calls, wir verkaufen Wlads Zeit (unverbindlich, 15 Min).
 *
 * Logik:
 *   - Triggert EINMAL pro Browser (`localStorage.wlad_onboarding_video_seen_v1`).
 *   - GSAP entrance: backdrop fade → card scale-up + slide → headline word-stagger
 *     → video fade → CTA-Row spring-in.
 *   - Dismiss via X-Button, click-outside, oder "Später ansehen".
 *   - CTA "Strategiegespräch buchen" öffnet Cal.com Modal.
 *
 * Video-Source: Vimeo 1197728183 (Mert lieferte den Link am 26.02.26).
 */
import { useEffect, useRef, useState } from 'react';
import { X, PlayCircle, Calendar, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useBookConsultation } from '../brand/BookConsultationButton';
import { VideoPlayer } from '../shared/VideoPlayer';

const STORAGE_KEY = 'wlad_onboarding_video_seen_v1';
const VIMEO_ID = process.env.REACT_APP_ONBOARDING_VIMEO_ID || '1197728183';

const HEADLINE_WORDS = ['Schau', 'dir', 'kurz', 'an,', 'wie', 'du', 'startest.'];

export const OnboardingVideoModal = () => {
  const [open, setOpen] = useState(false);
  const openBooking = useBookConsultation();
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const headlineRef = useRef(null);
  const videoRef = useRef(null);
  const ctaRef = useRef(null);
  const eyebrowRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const t = setTimeout(() => setOpen(true), 1100);
      return () => clearTimeout(t);
    } catch {
      return undefined;
    }
  }, []);

  // GSAP entrance choreography — runs when `open` flips true
  useEffect(() => {
    if (!open) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return undefined;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35 })
        .fromTo(cardRef.current,
          { y: 40, scale: 0.96, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.18')
        .fromTo(eyebrowRef.current,
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.35 }, '-=0.35')
        .fromTo(headlineRef.current?.querySelectorAll('span.word') || [],
          { y: 24, autoAlpha: 0, rotateX: -45 },
          { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.55, stagger: 0.06 }, '-=0.2')
        .fromTo(subRef.current,
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4 }, '-=0.3')
        .fromTo(videoRef.current,
          { autoAlpha: 0, scale: 0.97 },
          { autoAlpha: 1, scale: 1, duration: 0.55 }, '-=0.2')
        .fromTo(ctaRef.current?.children || [],
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(1.6)' }, '-=0.25');
    });
    return () => ctx.revert();
  }, [open]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* noop */ }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setOpen(false);
      return;
    }
    // Smooth exit
    gsap.to(cardRef.current, { y: 30, scale: 0.97, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3, delay: 0.05, onComplete: () => setOpen(false) });
  };

  const handleBookCall = () => {
    dismiss();
    setTimeout(openBooking, 320);
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
      data-testid="onboarding-video-modal"
      style={{ opacity: 0 }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/[0.08] shadow-[0_50px_140px_-30px_rgba(191,255,0,0.28)]"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0 }}
      >
        {/* Aurora glow layers — purely decorative */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-[#BFFF00]/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-[#7B3FE4]/18 blur-3xl" aria-hidden />
        {/* Grain texture for premium feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\' numOctaves=\'3\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\'/></svg>")' }}
          aria-hidden
        />

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-90 flex items-center justify-center text-white/70 hover:text-white transition-all"
          data-testid="onboarding-video-close"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>

        <div className="relative p-6 sm:p-8 pb-4">
          <div ref={eyebrowRef} className="flex items-center gap-2 mb-2" style={{ opacity: 0 }}>
            <div className="w-7 h-7 rounded-lg bg-[#BFFF00]/20 flex items-center justify-center">
              <PlayCircle size={14} className="text-[#BFFF00]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#BFFF00] font-black">
              Willkommen bei Leader·OS
            </span>
          </div>
          <h2
            ref={headlineRef}
            className="text-2xl sm:text-[34px] font-black text-white tracking-tight leading-[1.05]"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.03em', perspective: '600px' }}
          >
            {HEADLINE_WORDS.map((w, i) => (
              <span key={`${w}-${i}`} className="word inline-block mr-[0.28em]" style={{ opacity: 0 }}>
                {w}
              </span>
            ))}
          </h2>
          <p ref={subRef} className="text-sm text-white/55 mt-2.5 max-w-md" style={{ opacity: 0 }}>
            90 Sekunden von Wlad: was du als Erstes anpackst, wie du in 30 Tagen messbar weiter
            kommst — und warum ein 15-Min-Termin mit unserem Team der schnellste Hebel ist.
          </p>
        </div>

        {/* Vimeo Player */}
        <div ref={videoRef} className="relative px-6 sm:px-8" style={{ opacity: 0 }}>
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
            <VideoPlayer
              vimeoId={VIMEO_ID}
              autoplay
              title="Wlads Onboarding-Video"
            />
          </div>
        </div>

        {/* Action Row */}
        <div ref={ctaRef} className="relative flex flex-col sm:flex-row gap-3 p-6 sm:p-8 pt-5">
          <button
            type="button"
            onClick={handleBookCall}
            className="btn-shine glow-lime flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#BFFF00] text-[#0A0A0A] font-black text-sm hover:bg-[#D4FF4D] transition-all"
            data-testid="onboarding-video-book-call"
            style={{ opacity: 0 }}
          >
            <Calendar size={15} />
            Strategiegespräch buchen
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/85 font-semibold text-sm transition-colors"
            data-testid="onboarding-video-skip"
            style={{ opacity: 0 }}
          >
            Später ansehen
          </button>
        </div>

        {/* Trust strip — no "free" wording, just facts that build value */}
        <div className="relative px-6 sm:px-8 pb-5 flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/35 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            15 Min · 1:1 mit Wlads Team · Unverbindlich
          </span>
          <span className="text-white/15">·</span>
          <span>Wird nur einmal angezeigt</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingVideoModal;
