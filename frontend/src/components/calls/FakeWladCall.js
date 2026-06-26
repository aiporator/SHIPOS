/**
 * FakeWladCall · iOS-style incoming-call overlay from "Wlad Jachtchenko".
 *
 * Conversion-engagement trick (Iter 92): triggers automatically after the
 * user has been active for 3 minutes, can fire at most TWICE per browser
 * session (`sessionStorage` counter). Only mounts inside ProtectedRoute,
 * so unauthenticated visitors never see it.
 *
 * Accept   → opens Cal.com booking modal (real consultation)
 * Decline  → navigates to /chat with a Wlad-style starter prompt
 *
 * A/B Test (Iter 92.4 · `fake_wlad_call_bribe`):
 *   - control: pure call overlay
 *   - bribe:   reveals a "WLAD10" 10% discount code during the call;
 *              code persists to localStorage so user sees it in checkout.
 *   Variant assignment happens via GET /api/ab/assign/fake_wlad_call_bribe,
 *   outcomes logged via POST /api/ab/event/fake_wlad_call_bribe.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, PhoneOff, MessageCircle, Volume2, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBookConsultation } from '../brand/BookConsultationButton';
import api from '../../lib/api';

const SESSION_KEY = 'wlad_fake_call_count';
const MAX_CALLS_PER_SESSION = 2;
const TRIGGER_INTERVAL_MS = 3 * 60 * 1000;  // 3 minutes
// Routes where we must NOT pop the call (already in a call-equivalent flow)
const SUPPRESSED_PATHS = ['/chat', '/onboarding', '/payment-success', '/login', '/auth/magic', '/email/unsubscribe'];
// Tiers that have already converted · they don't need conversion-pressure.
// Instead they see the call ONCE PER MONTH as a "Monthly Update Call" prompt
// from the consultant team.
const PRO_TIERS = new Set(['standard', 'accelerator', 'plus']);
const PRO_MONTHLY_KEY = 'wlad_pro_monthly_call_at';
const PRO_MONTHLY_MS = 30 * 24 * 60 * 60 * 1000;

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
  'Ich habe gerade nicht abgenommen, als Wlad anrief · aber zeig mir trotzdem: wo ist meine größte Leadership-Lücke? Stell mir 3 Diagnose-Fragen.',
  'Letzte Chance verpasst. Sag mir in 1 Satz: was hindert mich aktuell daran, meine Top-Priorität anzugehen?',
];

export const FakeWladCall = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const openBooking = useBookConsultation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const isSuppressed = SUPPRESSED_PATHS.some((p) => location.pathname.startsWith(p));

  // A/B variant: control | bribe (assigned once per user, deterministic)
  const [variant, setVariant] = useState('control');
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.get('/ab/assign/fake_wlad_call_bribe')
      .then((r) => {
        if (!cancelled && r?.data?.variant) setVariant(r.data.variant);
      })
      .catch(() => { /* assignment is best-effort; default to control */ });
    return () => { cancelled = true; };
  }, [user]);

  const logEvent = useCallback((event, meta = undefined) => {
    api.post('/ab/event/fake_wlad_call_bribe', { event, meta })
      .catch(() => { /* fire-and-forget; never block UX */ });
  }, []);

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
        // Reschedule instead of firing · user is in a focus flow
        scheduleNext();
        return;
      }
      bumpCallCount();
      setOpen(true);
      logEvent('impression', { call_number: getCallCount() });
    }, TRIGGER_INTERVAL_MS);
  }, [logEvent]);

  // Arm the timer once when user is authenticated. We deliberately do NOT
  // reset on every navigation so the 3-minute cadence is preserved.
  //
  // PRO users (standard / accelerator) get a DIFFERENT flow: ONE call per
  // month framed as a "Monthly Update Call mit dem Beraterteam". We use
  // localStorage timestamp to gate at 30-day intervals.
  const isPro = PRO_TIERS.has((user?.tier || '').toLowerCase());

  useEffect(() => {
    if (!user) return undefined;
    if (isPro) {
      // Pro-Tier: fire once if 30 days since last shown, then never again
      // until next month rolls around.
      const last = parseInt(localStorage.getItem(PRO_MONTHLY_KEY) || '0', 10) || 0;
      const ageMs = Date.now() - last;
      if (ageMs > PRO_MONTHLY_MS) {
        const t = setTimeout(() => {
          try { localStorage.setItem(PRO_MONTHLY_KEY, String(Date.now())); } catch { /* noop */ }
          setOpen(true);
        }, TRIGGER_INTERVAL_MS);
        return () => clearTimeout(t);
      }
      return undefined;
    }
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, scheduleNext, isPro]);

  // Accept = book a real consultation via Cal.com.
  // The Wlad team takes the actual call there. Highest-value path.
  // Bribe variant: persist WLAD10 discount code so it shows in checkout.
  const accept = () => {
    setOpen(false);
    logEvent('accept', { variant });
    if (variant === 'bribe') {
      try {
        localStorage.setItem('wlad_discount_code', JSON.stringify({
          code: 'WLAD10',
          percent: 10,
          earned_via: 'fake_wlad_call',
          expires_at: Date.now() + 24 * 60 * 60 * 1000,  // 24h
        }));
      } catch { /* localStorage unavailable */ }
    }
    scheduleNext();
    openBooking();
  };

  // Decline = fallback to chat with WladBot so the user gets value
  // immediately without committing to a calendar slot.
  const decline = () => {
    setOpen(false);
    logEvent('decline', { variant });
    const prompt = STARTER_PROMPTS[Math.min(getCallCount() - 1, STARTER_PROMPTS.length - 1)]
      || STARTER_PROMPTS[0];
    try { sessionStorage.setItem('wlad_starter_prompt', prompt); } catch { /* sessionStorage unavailable */ }
    scheduleNext();
    navigate('/chat');
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
            {isPro ? 'Monats-Update-Call' : 'Eingehender Anruf'}
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-white/30 font-semibold">
            {isPro ? 'Dein Beraterteam meldet sich' : callNumber === 1 ? 'Erinnerung · jetzt' : 'Letzte Erinnerung · jetzt'}
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
            {isPro ? 'Beraterteam · Leader OS' : 'Wlad Jachtchenko'}
          </h2>
          <p className="text-white/55 text-[13px] font-semibold">
            {isPro ? 'PLUS · 1:1 Update · monatlich' : 'mobil · Leadership Coaching'}
          </p>
        </div>

        {/* Subtle suggestion bubble */}
        <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-2.5 backdrop-blur-sm">
          <p className="text-white/75 text-[13px] leading-snug">
            {isPro
              ? '„Zeit für deinen Monats-Check-in. 30 Min, wo du gerade stehst."'
              : '„Lass uns 30 Min reden · ich helf dir, deinen Pfad zu klären."'}
          </p>
        </div>

        {/* Bribe variant · 10% discount appears ONLY for non-pro treatment group */}
        {variant === 'bribe' && !isPro && (
          <div
            className="flex items-center gap-2.5 bg-[#BFFF00]/[0.08] border border-[#BFFF00]/30 rounded-xl px-3.5 py-2 backdrop-blur-sm wlad-call-shimmer"
            data-testid="fake-call-bribe-banner"
          >
            <Gift size={14} className="text-[#BFFF00] shrink-0" />
            <span className="text-[#BFFF00] text-[11px] font-bold leading-tight">
              <span className="text-white/80 font-semibold">Beim Annehmen:</span> 10% auf Leader OS · Code <span className="font-black tracking-widest">WLAD10</span>
            </span>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-between w-full max-w-[280px] mt-3">
          <CallAction
            onClick={decline}
            color="#FF3B30"
            label="Ablehnen"
            sublabel="→ WladBot Chat"
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
            sublabel="→ Termin buchen"
            testId="fake-call-accept"
            pulse
            icon={<Phone size={26} className="text-white" />}
          />
        </div>

        {/* tiny tertiary · alternate fallback to chat */}
        <button
          type="button"
          onClick={decline}
          className="mt-2 text-[11px] text-white/55 hover:text-white transition-colors inline-flex items-center gap-1.5"
          data-testid="fake-call-chat-fallback"
        >
          <MessageCircle size={11} /> Lieber kurz mit WladBot chatten
        </button>
        <p className="text-white/15 text-[9px] tracking-[0.32em] uppercase mt-1">
          Leader OS · Wlad-Network
        </p>
      </div>
    </div>
  );
};

const CallAction = ({ onClick, color, label, sublabel, icon, pulse = false, testId }) => (
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
    <span className="text-white/70 text-[12px] font-bold leading-none">{label}</span>
    {sublabel && (
      <span className="text-white/35 text-[10px] font-semibold tracking-wide leading-none -mt-1">
        {sublabel}
      </span>
    )}
  </div>
);

export default FakeWladCall;
