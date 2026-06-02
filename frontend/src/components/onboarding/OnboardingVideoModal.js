/**
 * OnboardingVideoModal — Welcome-Video von Wlad nach erstem Login.
 *
 * Iter 92.9 (Mert): Neuer Nutzer soll direkt nach Sign-up ein kurzes
 * Onboarding-Video sehen ("Willkommen bei Leader-OS, hier ist wie du startest").
 *
 * Logik:
 *   - Triggert EINMAL pro Nutzer (localStorage `wlad_onboarding_video_seen`).
 *   - Dismissable via X-Button, Klick außerhalb des Modals, oder "Später ansehen".
 *   - Sekundärer CTA: "Free Strategiegespräch buchen" (Cal.com Modal).
 *
 * Video-Source:
 *   Mert hat den Google-Drive-Folder geschickt:
 *   https://drive.google.com/drive/folders/1VK2m343YcuKrrh3bykCHuRB9EdZbHCUK
 *
 *   Sobald die einzelne Video-File-ID feststeht, hier setzen via env:
 *     REACT_APP_ONBOARDING_VIDEO_FILE_ID=xxxxxx
 *
 *   Default-Fallback: wir embedden die Folder-Preview, damit der User
 *   trotzdem direkt landet und Wlads Video selber öffnen kann.
 */
import { useEffect, useState } from 'react';
import { X, PlayCircle, Calendar, ArrowRight } from 'lucide-react';
import { useBookConsultation } from '../brand/BookConsultationButton';

const STORAGE_KEY = 'wlad_onboarding_video_seen_v1';
const DRIVE_FOLDER_ID = '1VK2m343YcuKrrh3bykCHuRB9EdZbHCUK';
const FILE_ID = process.env.REACT_APP_ONBOARDING_VIDEO_FILE_ID || '';

const embedSrc = FILE_ID
  ? `https://drive.google.com/file/d/${FILE_ID}/preview`
  : `https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDER_ID}#list`;

export const OnboardingVideoModal = () => {
  const [open, setOpen] = useState(false);
  const openBooking = useBookConsultation();

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      // Slight delay so the dashboard renders first — better first impression
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    } catch {
      return undefined;
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* noop */ }
    setOpen(false);
  };

  const handleBookCall = () => {
    dismiss();
    openBooking();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 wlad-call-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
      data-testid="onboarding-video-modal"
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/[0.08] shadow-[0_40px_120px_-20px_rgba(191,255,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Aurora glow */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#BFFF00]/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#7B3FE4]/15 blur-3xl" aria-hidden />

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] flex items-center justify-center text-white/70 hover:text-white transition-all"
          data-testid="onboarding-video-close"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>

        <div className="relative p-6 sm:p-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#BFFF00]/20 flex items-center justify-center">
              <PlayCircle size={14} className="text-[#BFFF00]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#BFFF00] font-black">
              Willkommen bei Leader·OS
            </span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.025em' }}
          >
            Schau dir kurz an, wie du startest.
          </h2>
          <p className="text-sm text-white/55 mt-2 max-w-md">
            90 Sekunden von Wlad: was du als Erstes machen solltest, wie du das Maximum aus
            deinem 30-Tage-Sprint holst — und warum ein Free Call mit unserem Team der schnellste
            ROI ist.
          </p>
        </div>

        {/* Video Embed */}
        <div className="relative px-6 sm:px-8">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.06]">
            <iframe
              title="Onboarding-Video von Wlad Jachtchenko"
              src={embedSrc}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              data-testid="onboarding-video-iframe"
            />
          </div>
          {!FILE_ID && (
            <p className="text-[10px] text-white/30 mt-2 italic">
              Wlad lädt aktuell sein Welcome-Video hoch — schau gleich nochmal vorbei oder buch direkt deinen Free Call.
            </p>
          )}
        </div>

        {/* Action Row */}
        <div className="relative flex flex-col sm:flex-row gap-3 p-6 sm:p-8 pt-5">
          <button
            type="button"
            onClick={handleBookCall}
            className="btn-shine glow-lime flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#BFFF00] text-[#0A0A0A] font-black text-sm hover:bg-[#D4FF4D] transition-all"
            data-testid="onboarding-video-book-call"
          >
            <Calendar size={15} />
            Free Strategiegespräch buchen
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/85 font-semibold text-sm transition-colors"
            data-testid="onboarding-video-skip"
          >
            Später ansehen
          </button>
        </div>

        {/* Trust strip */}
        <div className="relative px-6 sm:px-8 pb-5 flex items-center gap-3 text-[10px] text-white/35 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            15 Min · Kostenlos · Unverbindlich
          </span>
          <span className="text-white/15">·</span>
          <span>Wird nur einmal angezeigt</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingVideoModal;
