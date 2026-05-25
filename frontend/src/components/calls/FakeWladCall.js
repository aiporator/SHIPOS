/**
 * FakeWladCall — iOS-style incoming-call overlay from "Wlad Jachtchenko".
 *
 * Conversion-engagement trick (Iter 92): triggers automatically after the
 * user has been active for 3 minutes, can fire at most TWICE per browser
 * session (`sessionStorage` counter). Only mounts inside ProtectedRoute,
 * so unauthenticated visitors never see it.
 *
 * Accept   → navigates to /chat with a Wlad-style starter prompt
 * Decline  → silently closes and re-arms the next 3-min timer (only if
 *            cap not reached)
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, PhoneOff, Video, Volume2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SESSION_KEY = 'wlad_fake_call_count';
const MAX_CALLS_PER_SESSION = 2;
const TRIGGER_INTERVAL_MS = 3 * 60 * 1000;  // 3 minutes
// Routes where we must NOT pop the call (already in a call-equivalent flow)
const SUPPRESSED_PATHS = ['/chat', '/onboarding', '/payment-success', '/login', '/auth/magic'];

const getCallCount = () => {
  try { return parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10) || 0; }
  catch { return 0; }
};
const bumpCallCount = () => {
  try {
    const n = getCallCount() + 1;
    sessionStorage.setItem(SESSION_KEY, String(n));
    return n;
  } catch { return MAX_CALLS_PER_SESSION; }
};

const STARTER_PROMPTS = [
  'Du hast eben einen Anruf von mir verpasst. Lass uns sofort über deine größte Leadership-Herausforderung sprechen — bring sie auf den Tisch.',
  'Ich hatte gerade 30 Sekunden für dich. Sag mir: was hält dich gerade davon ab, deine Top-Priorität anzugehen? Antworte in 1 Satz.',
];

export const FakeWladCall = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const isSuppressed = SUPPRESSED_PATHS.some((p) => location.pathname.startsWith(p));

  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (getCallCount() >= MAX_CALLS_PER_SESSION) return;
    timerRef.current = setTimeout(() => {
      // Re-check at fire time (path may have changed, count may have grown)
      if (getCallCount() >= MAX_CALLS_PER_SESSION) return;
      const path = window.location.pathname;
      if (SUPPRESSED_PATHS.some((p) => path.startsWith(p))) {
        // Reschedule instead of firing — user is in a focus flow
        scheduleNext();
        return;
      }
      bumpCallCount();
      setOpen(true);
    }, TRIGGER_INTERVAL_MS);
  }, []);

  // Arm the timer once when user is authenticated. We deliberately do NOT
  // reset on every navigation so the 3-minute cadence is preserved.
  useEffect(() => {
    if (!user) return undefined;
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, scheduleNext]);

  const accept = () => {
    setOpen(false);
    const prompt = STARTER_PROMPTS[Math.min(getCallCount() - 1, STARTER_PROMPTS.length - 1)]
      || STARTER_PROMPTS[0];
    try { sessionStorage.setItem('wlad_starter_prompt', prompt); } catch { /* sessionStorage unavailable */ }
    scheduleNext();
    navigate('/chat');
  };
  const decline = () => {
    setOpen(false);
    scheduleNext();
  };

  if (!user || !open || isSuppressed) return null;

  const callNumber = getCallCount();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center wlad-call-overlay wlad-call-fade-in"
      role="dialog"
      aria-modal="true"
      data-testid="fake-wlad-call"
    >
      <div
        className="relative flex flex-col items-center gap-7 px-8 py-12 max-w-[420px] w-full text-center wlad-call-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* "Eingehender Anruf" eyebrow */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-[0.32em] uppercase text-white/45 font-bold wlad-call-shimmer">
            Eingehender Anruf
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-white/30 font-semibold">
            {callNumber === 1 ? 'Erinnerung · jetzt' : 'Letzte Erinnerung · jetzt'}
          </span>
        </div>

        {/* Avatar w/ animated rings */}
        <div className="relative">
          <div className="wlad-call-ring" />
          <div className="wlad-call-ring r2" />
          <div className="wlad-call-ring r3" />
          <div
            className="relative w-32 h-32 rounded-full wlad-call-avatar-glow overflow-hidden border-2 border-[#BFFF00]/45 bg-gradient-to-br from-[#1f2913] via-[#2e3b1e] to-[#0a0a0a] flex items-center justify-center"
            data-testid="fake-call-avatar"
          >
            <span
              className="text-[52px] font-black leading-none text-[#BFFF00] select-none"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.04em' }}
            >
              W
            </span>
          </div>
        </div>

        {/* Caller */}
        <div className="space-y-1">
          <h2
            className="text-white text-[26px] font-black tracking-tight leading-none"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.025em' }}
            data-testid="fake-call-name"
          >
            Wlad Jachtchenko
          </h2>
          <p className="text-white/55 text-[13px] font-semibold">
            mobil · Leadership Coaching
          </p>
        </div>

        {/* Subtle suggestion bubble */}
        <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-2.5 backdrop-blur-sm">
          <p className="text-white/75 text-[13px] leading-snug">
            „Ich hab dich heute auf dem Schirm. Hast du 60 Sekunden?"
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between w-full max-w-[280px] mt-3">
          <CallAction
            onClick={decline}
            color="#FF3B30"
            label="Ablehnen"
            testId="fake-call-decline"
            icon={<PhoneOff size={26} className="text-white" />}
          />
          <div className="flex flex-col items-center gap-2 opacity-40 select-none">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Volume2 size={22} className="text-white/80" />
            </div>
            <span className="text-white/35 text-[10px] uppercase tracking-wider">Lautstärke</span>
          </div>
          <CallAction
            onClick={accept}
            color="#30D158"
            label="Annehmen"
            testId="fake-call-accept"
            pulse
            icon={<Phone size={26} className="text-white" />}
          />
        </div>

        {/* tiny tertiary */}
        <button
          type="button"
          onClick={accept}
          className="mt-2 text-[11px] text-white/55 hover:text-white transition-colors inline-flex items-center gap-1.5"
          data-testid="fake-call-video"
        >
          <Video size={11} /> mit Video annehmen
        </button>
        <p className="text-white/15 text-[9px] tracking-[0.32em] uppercase mt-1">
          Leader OS · Wlad-Network
        </p>
      </div>
    </div>
  );
};

const CallAction = ({ onClick, color, label, icon, pulse = false, testId }) => (
  <div className="flex flex-col items-center gap-2">
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 hover:scale-105 ${pulse ? 'wlad-call-accept-pulse' : ''}`}
      style={{ background: color, boxShadow: `0 8px 24px -6px ${color}99` }}
      aria-label={label}
    >
      {icon}
    </button>
    <span className="text-white/55 text-[11px] font-semibold">{label}</span>
  </div>
);

export default FakeWladCall;
