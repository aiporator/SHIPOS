import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowUpRight, Check, Star, PlayCircle, CalendarCheck, MessageCircleQuestion,
  Sparkles, Timer, BellRing, ShieldCheck, Gift, Users, BookOpen,
} from 'lucide-react';
import { LandingFooter } from '../components/landing/LandingFooter';
import { applyPageMeta } from '../lib/pageMeta';
import { isValidEmail } from '../features/newsletter/lib/newsletterClient';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';
import { WladMark } from '../components/brand/WladMark';

/**
 * WebinarPage · /webinar · the SQUEEZE page for the free live webinar.
 *
 * 2026-07 redesign: LIGHT theme. White canvas, soft-gray section bands,
 * rounded cards, generous whitespace — friendly, premium, approachable —
 * while keeping the LeaderOS accent system (ink + lime, Outfit display,
 * mono eyebrows) instead of generic SaaS blue so the funnel still reads
 * unmistakably as this brand (see frontend/DESIGN.md).
 *
 * One page, one goal: the registration. Minimal chrome (logo only, no nav
 * exits), outcome-first copy (sell the SYSTEM, Wlad is the trust anchor).
 *
 * Buying triggers, all honest (no fabricated numbers):
 *   Urgency    · live countdown to the real date
 *   Scarcity   · REAL registrant count from /api/webinar/stats, capped at a
 *                real published capacity (Zoom-room-size constraint, not a
 *                fake "3 spots left" lie)
 *   Authority  · Wlad's verified credentials (speaker section + badge strip)
 *   Proof      · real review-platform ratings (Trustpilot/Greator), never
 *                invented person-testimonials
 *   Risk-off   · 100% free, no card, unsubscribe anytime
 *   Clarity    · exact agenda timeline + outcome cards + honest "das
 *                bekommst du" list (calendar invite, reminders — the things
 *                the backend actually sends; no recording is promised
 *                because the webinar is live-only)
 *
 * Registration posts to the dedicated backend funnel (routes/webinar.py),
 * which sends an instant confirmation + Google-Calendar link and later the
 * 24h/1h reminders + day-after "start your trial" email — then routes to
 * the /webinar/danke thank-you page.
 */

const WEBINAR_TS = new Date('2026-08-20T10:00:00+02:00').getTime();
const DATE_LINE = 'DO 20. AUGUST 2026 · 10:00 UHR · LIVE · ONLINE';

// Same 30-second Wlad intro used on the landing page (VimeoIntroSection) —
// a real, existing asset; the preview section reuses it instead of
// promising a webinar-trailer that doesn't exist.
const PREVIEW_VIMEO_ID = '1197728183';
const PREVIEW_SRC =
  `https://player.vimeo.com/video/${PREVIEW_VIMEO_ID}` +
  '?badge=0&autopause=0&player_id=0&app_id=58479&byline=0&portrait=0&title=0';

const LEARN_CARDS = [
  ['Schwierige Gespräche führen', 'Mit Struktur statt Bauchgefühl — das Skript für Kritik, Konflikt und Kündigung.'],
  ['Der Charisma-Code live', 'Präsenz · Wärme · Kompetenz — die drei Signale, in Echtzeit demonstriert.'],
  ['Täglich trainieren mit KI', 'Wie ein KI-Coach aus einem Seminar-Wochenende ein tägliches System macht.'],
  ['Der 30-Tage-Plan', 'Wie Führung vom Vorsatz zum System wird — Schritt für Schritt.'],
  ['Ein echter Live-Case', 'Eine reale Führungssituation aus der Community, gemeinsam durchgearbeitet.'],
  ['Deine Fragen im Q&A', 'Wlad beantwortet live, was dich gerade wirklich beschäftigt.'],
];

const WHY_ATTEND = [
  [Timer, 'Nur 90 Minuten', 'Kompakt und ohne Füllstoff — jede Minute hat einen Zweck.'],
  [MessageCircleQuestion, 'Live Q&A mit Wlad', 'Keine Konserve: du fragst, Wlad antwortet direkt.'],
  [Sparkles, 'Erprobte Frameworks', 'Methoden aus 13 Büchern und 400.000+ trainierten Klienten.'],
  [CalendarCheck, 'Kalender + Erinnerung', 'Google-Calendar-Einladung sofort per Mail, Erinnerung vor dem Start.'],
  [ShieldCheck, '100 % kostenlos', 'Keine Karte, kein Haken. Nur deine E-Mail — jederzeit abmeldbar.'],
  [BellRing, 'Sofort anwendbar', 'Du gehst mit konkreten Sätzen und Schritten raus, nicht mit Theorie.'],
];

const AGENDA = [
  ['10:00', 'Check-in & Warm-up', 'Kurz ankommen — worum es in den nächsten 90 Minuten geht.'],
  ['10:05', 'Der Charisma-Code live', 'Präsenz · Wärme · Kompetenz — die drei Signale, in Echtzeit demonstriert.'],
  ['10:25', 'Das Leadership Operating System', 'Wie WladBot, tägliche Drills und die 11 Frameworks zusammenspielen.'],
  ['10:55', 'Live-Case aus der Community', 'Eine echte Führungssituation, gemeinsam durchgearbeitet.'],
  ['11:15', 'Q&A mit Wlad', 'Deine Fragen, direkt beantwortet.'],
];

const AUTHORITY_BADGES = [
  ['13', 'Bücher · 3× SPIEGEL-Bestseller'],
  ['400.000+', 'trainierte Klienten'],
  ['4,9/5', 'Trustpilot · 388 Bewertungen'],
  ['3×', 'TEDx-Talks'],
];

// Real, verifiable review platforms — linked at the source. We deliberately
// do NOT render invented person-testimonials with stock photos.
const REVIEW_PLATFORMS = [
  ['Trustpilot', '4,9', '388 Bewertungen', 'Argumentorik · Wlad Jachtchenko', 'https://uk.trustpilot.com/review/argumentorik.com'],
  ['Greator', '4,7', '995 Bewertungen', 'Coach-Profil Wlad Jachtchenko', 'https://greator.com/coach/wlad-jachtchenko'],
];

// Who the webinar genuinely fits — plus one honest "not for you" line so
// the registration list stays high-intent instead of just long.
const AUDIENCE = [
  ['Teamleads & neue Führungskräfte', 'Du führst seit Kurzem — und merkst, dass Fachkompetenz allein nicht reicht.'],
  ['Erfahrene Manager & Directors', 'Du führst lange genug, um zu wissen, was ein Seminar-Wochenende NICHT verändert.'],
  ['Senior-Experten vor dem Sprung', 'Die Führungsrolle kommt — du willst vorbereitet sein statt hineinzustolpern.'],
];

// A real taste of the knowledge behind the webinar · exact canonical
// definitions (docs/WLAD_CANON.md), each linking to its journal deep-dive —
// the teaser IS correct content, not marketing-vague hints.
const FRAMEWORK_PEEK = [
  ['SEXIER-Modell', 'Statement · Explanation · eXample · Impact · Explanation of Impact · Rebuttal — die sechsstufige Argumentations-Architektur für strittige Thesen.', '/journal/die-5-argumentations-levels-von-behauptung-bis-sexier'],
  ['Feedbackformel B·W·W', 'Beobachtung + Wirkung + Wunsch. Nie „Du bist…", immer „Ich habe beobachtet, dass…" — das Skript für jedes schwierige Gespräch.', '/journal/die-feedback-formel-bww'],
  ['10 Stufen des Zuhörens', 'Von Stufe 1 (nicht zuhören) bis Stufe 10 (Stille als Zuhören). 80 % aller Führungskräfte hängen auf Stufe 2 fest: auf die eigene Antwort warten.', '/journal/die-10-stufen-des-zuhoerens-wlads-modell-erklaert'],
  ['Die 5 Rollen einer Führungskraft', 'Kommunikator · Manager · Team-Leader · Psychologe · Problemlöser — und warum die meisten eine der fünf systematisch weglassen.', '/journal/5-rollen-der-fuehrung-nach-wlad-jachtchenko'],
];

// Only things the funnel actually delivers (routes/webinar.py + emails).
const INCLUDED = [
  'Google-Calendar-Einladung — sofort nach der Anmeldung per Mail',
  'Erinnerungs-Mails 24 Stunden und 1 Stunde vor dem Start',
  'Live-Q&A — deine Frage kommt dran, nicht nur die aus dem Skript',
  'Der kostenlose Leader-Check im Anschluss — dein Führungsprofil in 10 Minuten',
  '14-Tage-Zugang zu LeaderOS zum Ausprobieren — ohne Karte, jederzeit kündbar',
];

const FAQ = [
  ['Kostet das etwas?', 'Nein. Das Webinar ist komplett kostenlos — keine Karte, kein Haken. Du brauchst nur deine E-Mail.'],
  ['Wie lange dauert es?', '90 Minuten — von 10:00 bis etwa 11:30 Uhr, inklusive Live-Q&A.'],
  ['Gibt es eine Aufzeichnung?', 'Nein, das Webinar ist live. Genau deshalb lohnt es sich: du kannst deine Fragen direkt im Q&A stellen.'],
  ['Brauche ich Vorkenntnisse?', 'Nein. Für Führungskräfte und alle, die es werden wollen — Teamleads, Projektmanager, Senior-Experten. Keine KI-Vorkenntnisse nötig.'],
  ['Kann ich Fragen stellen?', 'Ja — das Q&A ist fester Teil der Agenda (ab 11:15 Uhr). Wlad beantwortet live.'],
];

const track = (event, props = {}) => {
  if (typeof window !== 'undefined' && window.posthog?.capture) {
    try { window.posthog.capture(event, { surface: 'leader-os', funnel: 'webinar', ...props }); } catch {}
  }
};

const useCountdown = (target) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

/** Animated stat counter · counts up once when scrolled into view. Falls
 * back to the plain string for non-numeric values ("4,9/5", "3×"). */
const CountUpValue = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const numeric = /^[\d.]+\+?$/.test(value.replace(/\./g, ''))
    ? parseInt(value.replace(/[^\d]/g, ''), 10)
    : null;
  const [display, setDisplay] = useState(numeric === null ? value : '0');

  useEffect(() => {
    if (!inView || numeric === null) return;
    const started = performance.now();
    const dur = 1200;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - started) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const n = Math.round(numeric * eased);
      setDisplay(n.toLocaleString('de-DE') + (value.includes('+') ? '+' : ''));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric, value]);

  return <span ref={ref} className="tabular-nums">{numeric === null ? value : display}</span>;
};

const Countdown = () => {
  const { d, h, m, s } = useCountdown(WEBINAR_TS);
  return (
    <div className="flex gap-2.5 sm:gap-3" aria-label="Countdown bis zum Webinar">
      {[['Tage', d], ['Std', h], ['Min', m], ['Sek', s]].map(([label, val], i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-[#111111]/10 shadow-[0_10px_30px_-18px_rgba(17,17,17,0.25)]"
        >
          <span className="tabular-nums leading-none text-[#111111] text-[24px] sm:text-[30px]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
            {String(val).padStart(2, '0')}
          </span>
          <span className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#707072]">{label}</span>
        </motion.div>
      ))}
    </div>
  );
};

/** Real registrant scarcity bar · fetched, never fabricated. Fails silently
 * (renders nothing) if the endpoint is unreachable — a missing bar is fine,
 * a fake one is not. */
const ScarcityBar = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/webinar/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled && data) setStats(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!stats || !stats.max_capacity) return null;
  const pct = Math.min(100, Math.round((stats.registered / stats.max_capacity) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-6 max-w-md"
      data-testid="webinar-scarcity-bar"
    >
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-[#707072] mb-1.5">
        <span>{stats.registered} bereits angemeldet</span>
        <span>{stats.spots_left} Plätze frei</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#111111]/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#BFFF00]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const RegisterForm = ({ idSuffix = '' }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const valid = isValidEmail(email);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || state === 'loading') return;
    setState('loading');
    track('webinar_register_submit');
    try {
      const res = await fetch('/api/webinar/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'webinar-lp',
          referrer: typeof document !== 'undefined' ? document.referrer || null : null,
          landing_path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });
      const data = await res.json().catch(() => null);
      const ok = res.ok && data?.ok;
      track('webinar_register_result', { ok });
      if (ok) {
        navigate(`/webinar/danke?email=${encodeURIComponent(email)}`);
        return;
      }
      setState('error');
    } catch {
      setState('error');
      track('webinar_register_result', { ok: false });
    }
  };

  return (
    <form onSubmit={submit} noValidate data-testid={`webinar-form${idSuffix}`} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Deine beste E-Mail-Adresse"
          aria-label="E-Mail-Adresse"
          className="flex-1 h-14 px-5 rounded-full bg-white border border-[#111111]/15 focus:border-[#111111] outline-none text-[#111111] text-[15px] placeholder:text-[#9e9ea0] transition-colors shadow-[0_10px_30px_-20px_rgba(17,17,17,0.2)]"
        />
        <motion.button
          type="submit"
          disabled={!valid || state === 'loading'}
          whileHover={valid ? { y: -2 } : {}}
          whileTap={valid ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className="h-14 px-7 rounded-full bg-[#111111] hover:bg-[#BFFF00] hover:text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[13px] uppercase tracking-[0.14em] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {state === 'loading' ? 'Wird reserviert…' : 'Platz sichern · kostenlos'}
          {state !== 'loading' && <ArrowUpRight size={16} />}
        </motion.button>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#707072]">
        100 % kostenlos · live · begrenzte Plätze · jederzeit abmeldbar
        {state === 'error' && (
          <span className="block mt-1.5 tracking-normal normal-case text-[12px] text-red-600">
            Das hat nicht geklappt — bitte E-Mail prüfen und erneut senden.
          </span>
        )}
      </p>
    </form>
  );
};

const SectionEyebrow = ({ children }) => (
  <motion.p
    initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE_UP}
    className="font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#5A7700] mb-3"
  >
    {children}
  </motion.p>
);

const SectionHeadline = ({ children, className = '' }) => (
  <motion.h2
    initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} variants={FADE_UP}
    className={`text-[28px] sm:text-[40px] leading-[1.02] tracking-[-0.035em] text-[#111111] ${className}`}
    style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
  >
    {children}
  </motion.h2>
);

export default function WebinarPage() {
  const formRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Light theme is the design of this page — force it so a dark-mode
    // visitor still gets the bright, friendly funnel, restore on leave.
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    track('webinar_view');

    const restoreMeta = applyPageMeta({
      title: 'Kostenloses Live-Webinar · Führe besser. Jeden Tag. · LeaderOS',
      description:
        'Live-Webinar am 20.08.2026: Wie du mit einem Leadership Operating System jeden Tag besser führst — ' +
        'KI-Coach, tägliche Übungen, Wlads Methodik. Kostenlos, live, mit Q&A. Jetzt Platz sichern.',
      url: 'https://leader-os.de/webinar',
      image: 'https://leader-os.de/og-wlad.jpg',
    });

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Führe besser. Jeden Tag. · Das kostenlose LeaderOS Live-Webinar',
      startDate: '2026-08-20T10:00:00+02:00',
      endDate: '2026-08-20T11:30:00+02:00',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'VirtualLocation', url: 'https://leader-os.de/webinar' },
      image: ['https://leader-os.de/og-wlad.jpg'],
      description: 'Kostenloses Live-Webinar: das Leadership Operating System für Führungskräfte.',
      organizer: { '@type': 'Organization', name: 'LeaderOS', url: 'https://leader-os.de' },
      performer: { '@type': 'Person', name: 'Wlad Jachtchenko' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: 'https://leader-os.de/webinar', validFrom: '2026-07-04T00:00:00+02:00' },
    });
    document.head.appendChild(ld);

    // FAQPage schema · mirrors the on-page FAQ 1:1 (AEO: eligible for FAQ
    // rich results + directly quotable by AI answer engines).
    const ldFaq = document.createElement('script');
    ldFaq.type = 'application/ld+json';
    ldFaq.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
    document.head.appendChild(ldFaq);

    return () => { restoreMeta(); ld.remove(); ldFaq.remove(); if (wasDark) root.classList.add('dark'); };
  }, []);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const scrollToVideo = () => {
    track('webinar_preview_click');
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="bg-white text-[#111111] min-h-[100dvh] antialiased" data-testid="webinar-page">
      {/* Squeeze chrome · logo only, no nav exits */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[1100px] mx-auto px-5 md:px-10 pt-6 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-3" aria-label="LeaderOS Startseite">
          <WladMark size={34} />
          <span className="font-black tracking-tight text-[#111111] text-[19px]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
            Leader<span className="text-[#5A7700] mx-0.5">·</span>OS
          </span>
        </Link>
        <motion.span
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 rounded-full bg-[#BFFF00]/25 px-3.5 py-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#111111]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111] inline-block" />
          Live-Webinar · kostenlos
        </motion.span>
      </motion.header>

      <main id="main-content">
        {/* ── Hero · light, airy, inline registration ─────────────────── */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                'radial-gradient(at 80% 0%, rgba(191,255,0,0.16) 0px, transparent 50%), ' +
                'radial-gradient(at 0% 65%, rgba(191,255,0,0.08) 0px, transparent 50%), ' +
                'linear-gradient(#ffffff, #fafafa)',
            }}
          />
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 pt-12 md:pt-16 pb-16 md:pb-20 lg:flex lg:items-start lg:gap-14">
            <div className="lg:flex-1 lg:min-w-0">
              {/* Mobile-only compact portrait */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:hidden flex items-center gap-3 mb-5"
              >
                <img
                  src={WLAD_AVATAR}
                  onError={withFallback(WLAD_AVATAR_FALLBACKS)}
                  alt="Wlad Jachtchenko"
                  width="44"
                  height="44"
                  fetchpriority="high"
                  className="w-11 h-11 rounded-full object-cover object-top ring-2 ring-[#BFFF00] shrink-0"
                />
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#707072]">
                  Wlad Jachtchenko<br /><span className="text-[#9e9ea0]">Host &amp; Q&amp;A</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#707072] mb-5"
              >
                {DATE_LINE}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 }}
                className="text-[40px] sm:text-[62px] md:text-[76px] leading-[0.94] tracking-[-0.04em] text-[#111111] max-w-4xl"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Führe besser.<br />Jeden Tag<span className="text-[#5A7700] not-italic">.</span>
              </motion.h1>
              <motion.p
                initial="hidden" animate="show" custom={1} variants={FADE_UP}
                className="mt-6 max-w-2xl text-[16px] sm:text-[19px] leading-[1.55] text-[#4b4b4d]"
              >
                Das kostenlose Live-Webinar zum <span className="text-[#111111] font-semibold">Leadership Operating System</span>:
                wie du Kommunikation, Entscheidungen und Führung täglich trainierst — mit KI-Coach,
                System und den Methoden von Wlad Jachtchenko. Statt Motivation, die am Montag verpufft.
              </motion.p>

              {/* Primary + secondary CTA */}
              <motion.div
                initial="hidden" animate="show" custom={2} variants={FADE_UP}
                className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <motion.button
                  onClick={scrollToForm}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="h-14 px-8 rounded-full bg-[#111111] text-white hover:bg-[#BFFF00] hover:text-[#111111] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors inline-flex items-center justify-center gap-2"
                >
                  Platz sichern · kostenlos <ArrowUpRight size={16} />
                </motion.button>
                <button
                  onClick={scrollToVideo}
                  className="h-14 px-6 rounded-full border border-[#111111]/20 hover:border-[#111111] text-[#111111] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors inline-flex items-center justify-center gap-2 bg-white"
                >
                  <PlayCircle size={17} /> Vorschau ansehen
                </button>
              </motion.div>

              <div className="mt-9"><Countdown /></div>
              <ScarcityBar />

              <div ref={formRef} className="mt-9 max-w-2xl scroll-mt-24">
                <RegisterForm idSuffix="-hero" />
              </div>
            </div>

            {/* Host visual · desktop only */}
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block lg:w-[340px] lg:shrink-0 relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-3xl bg-white border border-[#111111]/10 p-3 shadow-[0_30px_60px_-30px_rgba(17,17,17,0.25)]"
              >
                <img
                  src={WLAD_AVATAR}
                  onError={withFallback(WLAD_AVATAR_FALLBACKS)}
                  alt="Wlad Jachtchenko"
                  fetchpriority="high"
                  className="w-full aspect-[4/5] object-cover object-top rounded-2xl"
                />
                <div className="absolute -bottom-4 -left-4 rounded-2xl bg-[#BFFF00] text-[#111111] px-4 py-2.5 shadow-[0_16px_30px_-14px_rgba(17,17,17,0.4)]">
                  <div className="text-[20px] tabular-nums leading-none" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>400.000+</div>
                  <div className="mt-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]">trainierte Klienten</div>
                </div>
              </motion.div>
              <div className="mt-8 pl-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9e9ea0]">
                ▸ Wlad Jachtchenko · Host &amp; Q&amp;A
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Authority badge strip with animated counters ─────────────── */}
        <section className="border-t border-[#111111]/8 bg-white">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-9 md:py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {AUTHORITY_BADGES.map(([value, label], i) => (
                <motion.div
                  key={label}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                  className="text-center sm:text-left"
                >
                  <div className="text-[26px] sm:text-[32px] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                    <CountUpValue value={value} /><span className="text-[#5A7700] not-italic">.</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#707072]">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Video preview ────────────────────────────────────────────── */}
        <section ref={videoRef} className="bg-[#fafafa] border-t border-[#111111]/8 scroll-mt-16">
          <div className="max-w-[900px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Vorschau · 30 Sekunden</SectionEyebrow>
            <SectionHeadline className="mb-4">Sieh, worum es geht<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
              className="text-[15px] leading-[1.6] text-[#4b4b4d] max-w-xl mb-8"
            >
              30 Sekunden Wlad — damit du weißt, wer da spricht und wie er spricht.
              Kein Marketing-Sprech, keine Buzzwords. So läuft auch das Webinar.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl overflow-hidden bg-[#111111] shadow-[0_40px_80px_-40px_rgba(17,17,17,0.4)]"
            >
              <div className="aspect-video">
                <iframe
                  src={PREVIEW_SRC}
                  title="Wlad Jachtchenko in 30 Sekunden"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── What you'll learn · rounded cards ────────────────────────── */}
        <section className="bg-white border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Inhalte</SectionEyebrow>
            <SectionHeadline className="mb-10">Das lernst du in 90 Minuten<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {LEARN_CARDS.map(([title, desc], i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-[#fafafa] border border-[#111111]/8 p-6 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)]"
                >
                  <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[#BFFF00] text-[#111111] mb-4">
                    <Check size={15} strokeWidth={3} />
                  </span>
                  <h3 className="text-[17px] text-[#111111] mb-1.5" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{title}</h3>
                  <p className="text-[13.5px] leading-[1.55] text-[#707072]">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why attend · icon cards ──────────────────────────────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Warum dabei sein</SectionEyebrow>
            <SectionHeadline className="mb-10">Kein Fluff. Nur Substanz<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {WHY_ATTEND.map(([Icon, title, desc], i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  className="flex items-start gap-4 rounded-3xl bg-white border border-[#111111]/8 p-6"
                >
                  <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-2xl bg-[#BFFF00]/25 text-[#111111]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="text-[15.5px] text-[#111111] mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{title}</h3>
                    <p className="text-[13px] leading-[1.55] text-[#707072]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Für wen · audience fit keeps the list high-intent ────────── */}
        <section className="bg-white border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Für wen</SectionEyebrow>
            <SectionHeadline className="mb-10">Du bist hier richtig, wenn<span className="text-[#5A7700] not-italic">…</span></SectionHeadline>
            <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
              {AUDIENCE.map(([title, desc], i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  className="rounded-3xl bg-[#fafafa] border border-[#111111]/8 p-6"
                >
                  <span className="inline-flex w-11 h-11 items-center justify-center rounded-2xl bg-[#BFFF00]/25 text-[#111111] mb-4">
                    <Users size={20} />
                  </span>
                  <h3 className="text-[16px] text-[#111111] mb-1.5" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{title}</h3>
                  <p className="text-[13.5px] leading-[1.55] text-[#707072]">{desc}</p>
                </motion.div>
              ))}
            </div>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={3} variants={FADE_UP}
              className="mt-6 text-[13.5px] leading-[1.55] text-[#707072] max-w-2xl"
            >
              Ehrlich gesagt: wenn du nur einen Motivations-Kick suchst und danach alles beim Alten
              bleiben soll, sind die 90 Minuten woanders besser investiert. Das Webinar ist für
              Leute, die ein System wollen.
            </motion.p>
          </div>
        </section>

        {/* ── Speaker · trust anchor ───────────────────────────────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20 grid md:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-4"
            >
              <div className="rounded-3xl overflow-hidden border border-[#111111]/10 shadow-[0_30px_60px_-35px_rgba(17,17,17,0.35)]">
                <img
                  src={WLAD_AVATAR}
                  onError={withFallback(WLAD_AVATAR_FALLBACKS)}
                  alt="Wlad Jachtchenko · Host des Webinars"
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover object-top"
                />
              </div>
            </motion.div>
            <div className="md:col-span-8">
              <SectionEyebrow>▸ Dein Host</SectionEyebrow>
              <SectionHeadline className="mb-5">Wlad Jachtchenko<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
              <motion.p
                initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
                className="text-[15.5px] leading-[1.65] text-[#4b4b4d] max-w-2xl mb-6"
              >
                Europas führender Argumentations-Coach. Seit 2007 im Coaching, Gründer der
                Argumentorik-Akademie und der KI-Coaching-Plattform LeaderOS. Seine Methodik
                ist das Fundament des Webinars — und er ist live dabei, nicht nur auf der Folie:
                das komplette Q&amp;A beantwortet er selbst.
              </motion.p>
              <motion.ul
                initial="hidden" whileInView="show" viewport={{ once: true }} custom={3} variants={FADE_UP}
                className="flex flex-wrap gap-2.5"
              >
                {['3× SPIEGEL-Bestseller-Autor', '13 Bücher', '400.000+ trainierte Klienten', '3× TEDx', 'LinkedIn-Learning · 250.000+ Teilnehmer'].map((chip) => (
                  <li key={chip} className="rounded-full bg-white border border-[#111111]/10 px-4 py-2 text-[12.5px] font-semibold text-[#39393b]">
                    {chip}
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* ── Frameworks preview · the teaser IS correct knowledge ─────── */}
        <section className="bg-white border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Die Methodik dahinter</SectionEyebrow>
            <SectionHeadline className="mb-4">Ein Vorgeschmack auf Wlads Frameworks<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
              className="text-[15px] leading-[1.6] text-[#4b4b4d] max-w-2xl mb-10"
            >
              Kein Geheimwissen hinter der Anmelde-Wand — hier sind vier der Frameworks aus
              Wlads Büchern, exakt so, wie sie im Webinar und in LeaderOS trainiert werden.
              Zum Nachlesen verlinkt, zum Können brauchst du den Drill.
            </motion.p>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              {FRAMEWORK_PEEK.map(([name, def, href], i) => (
                <motion.div
                  key={name}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-[#fafafa] border border-[#111111]/8 p-7 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)]"
                >
                  <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#BFFF00] text-[#111111] mb-4">
                    <BookOpen size={16} />
                  </span>
                  <h3 className="text-[17px] text-[#111111] mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{name}</h3>
                  <p className="text-[13.5px] leading-[1.6] text-[#4b4b4d] mb-4">{def}</p>
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#5A7700] hover:text-[#111111] transition-colors"
                  >
                    Zum Deep-Dive im Journal <ArrowUpRight size={11} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof · real platform ratings, no invented quotes ─── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Bewertungen · verifizierbar</SectionEyebrow>
            <SectionHeadline className="mb-10">Was Klienten sagen<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5 max-w-3xl">
              {REVIEW_PLATFORMS.map(([name, rating, count, sub, href], i) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-white border border-[#111111]/8 p-7 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)] group"
                >
                  <div className="flex items-center gap-1 mb-4" aria-hidden>
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={16} className="text-[#111111] fill-[#BFFF00]" />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[34px] leading-none text-[#111111] tabular-nums" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>{rating}</span>
                    <span className="text-[13px] text-[#707072]">/ 5 · {count}</span>
                  </div>
                  <div className="mt-2 text-[14px] font-bold text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif' }}>{name}</div>
                  <div className="text-[12px] text-[#9e9ea0]">{sub}</div>
                  <div className="mt-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#5A7700] opacity-0 group-hover:opacity-100 transition-opacity">
                    Zur Quelle <ArrowUpRight size={10} className="inline" />
                  </div>
                </motion.a>
              ))}
            </div>
            <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9e9ea0] max-w-3xl">
              ▸ Beide Bewertungsprofile sind öffentlich — klick dich rein und prüf selbst.
            </p>
          </div>
        </section>

        {/* ── Agenda · timeline ────────────────────────────────────────── */}
        <section className="bg-white border-t border-[#111111]/8">
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Ablauf · 90 Minuten</SectionEyebrow>
            <SectionHeadline className="mb-10">Genau das erwartet dich<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <ol className="relative border-l-2 border-[#111111]/10 ml-3 space-y-0">
              {AGENDA.map(([time, title, desc], i) => (
                <motion.li
                  key={time}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                  className="relative pl-8 pb-8 last:pb-0"
                >
                  <span aria-hidden className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#BFFF00] ring-4 ring-white" />
                  <span className="font-mono text-[12px] font-bold text-[#5A7700] tabular-nums">{time}</span>
                  <p className="mt-0.5 text-[16px] font-bold text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p>
                  <p className="mt-0.5 text-[13.5px] leading-[1.55] text-[#707072]">{desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Das bekommst du · honest deliverables ────────────────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Inklusive</SectionEyebrow>
            <SectionHeadline className="mb-8">Das bekommst du mit der Anmeldung<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={1} variants={FADE_UP}
              className="rounded-3xl bg-white border border-[#111111]/8 p-7 md:p-9"
            >
              <ul className="space-y-4">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-[#39393b]">
                    <span className="mt-0.5 inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-[#BFFF00] text-[#111111]">
                      <Gift size={13} strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="bg-white border-t border-[#111111]/8">
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Häufige Fragen</SectionEyebrow>
            <SectionHeadline className="mb-8">Kurz beantwortet<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <dl className="space-y-3">
              {FAQ.map(([q, a], i) => (
                <motion.div
                  key={q}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                  className="rounded-2xl bg-[#fafafa] border border-[#111111]/8 px-6 py-5"
                >
                  <dt className="text-[15.5px] leading-[1.3] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{q}</dt>
                  <dd className="mt-1.5 text-[13.5px] leading-[1.55] text-[#707072]">{a}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-t border-[#111111]/8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                'radial-gradient(at 50% 100%, rgba(191,255,0,0.18) 0px, transparent 55%), ' +
                'linear-gradient(#ffffff, #fafafa)',
            }}
          />
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-[30px] sm:text-[44px] md:text-[52px] leading-[1.0] tracking-[-0.035em] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                Sichere dir deinen Platz<span className="text-[#5A7700] not-italic">.</span>
              </h2>
              <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#707072] flex items-center justify-center gap-1.5">
                <Star size={11} className="text-[#5A7700] fill-[#BFFF00]" /> {DATE_LINE}
              </p>
            </motion.div>
            <div className="mt-8 flex justify-center"><Countdown /></div>
            <div className="mt-8 max-w-xl mx-auto text-left">
              <RegisterForm idSuffix="-final" />
            </div>
            <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9e9ea0]">
              ▸ Kalender-Einladung kommt sofort per Mail · Erinnerung vor dem Start
            </p>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#111111]/10 px-4 py-3 shadow-[0_-12px_30px_-20px_rgba(17,17,17,0.25)]">
        <button
          onClick={scrollToForm}
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-[#111111] text-white font-bold text-[12.5px] uppercase tracking-[0.14em]"
        >
          Platz sichern · kostenlos <ArrowUpRight size={15} />
        </button>
      </div>

      <LandingFooter />
    </div>
  );
}
