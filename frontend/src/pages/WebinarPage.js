import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowUpRight, ArrowDown, Check, Star, PlayCircle, CalendarCheck,
  MessageCircleQuestion, BellRing, ClipboardCheck, Video, BookOpen, X,
} from 'lucide-react';
import { LandingFooter } from '../components/landing/LandingFooter';
import { applyPageMeta } from '../lib/pageMeta';
import { isValidEmail } from '../features/newsletter/lib/newsletterClient';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';
import { WladMark } from '../components/brand/WladMark';

/**
 * WebinarPage · /webinar · Hormozi-style ascension funnel (2026-07 rebuild).
 *
 * Narrative: Hook → Problem eskalieren → Neue Opportunity → Beweis →
 * Mechanismus → Value Stack → CTA → Risk Reversal → CTA. The webinar is not
 * the product — it sells the 4 free videos, the videos sell the trial, the
 * trial sells the Sprint (see docs/WEBINAR_FUNNEL.md for the full ascension
 * map + the hero-video script Wlad still needs to record).
 *
 * Every claim on this page is real:
 *   · stats are the verified set (400k+/20 Länder/4,9 Trustpilot/3× SPIEGEL)
 *   · client names are the ones cited on Wlad's public profiles
 *   · social proof = linked review platforms — NO invented person-quotes
 *     (video testimonials are a listed missing asset, not faked)
 *   · the 4 free videos exist (services_free_videos.py) with their real
 *     titles — framed as the participant bonus path, not fake exclusivity
 *   · scarcity = real registrant count vs. real capacity + live-only truth,
 *     never a fake "18 Plätze übrig" counter
 *   · hero video = the existing 30s Wlad intro until the scripted 90s
 *     version is recorded
 *
 * Light theme (white/#fafafa bands, rounded cards, pill CTAs) with the
 * LeaderOS ink+lime accent system — see frontend/DESIGN.md.
 */

const WEBINAR_TS = new Date('2026-08-20T10:00:00+02:00').getTime();
const DATE_LINE = 'DO 20. AUGUST 2026 · 10:00 UHR · LIVE · ONLINE';

// The existing 30-second Wlad intro (real asset). The 90s funnel version is
// scripted in docs/WEBINAR_FUNNEL.md — swap the ID once recorded.
const HERO_VIMEO_ID = '1197728183';
const HERO_VIDEO_SRC =
  `https://player.vimeo.com/video/${HERO_VIMEO_ID}` +
  '?badge=0&autopause=0&player_id=0&app_id=58479&byline=0&portrait=0&title=0';

const STATS = [
  ['400.000+', 'trainierte Klienten'],
  ['20+', 'Länder'],
  ['4,9/5', 'Trustpilot · 388 Bewertungen'],
  ['3×', 'SPIEGEL-Bestseller · 13 Bücher'],
];

// Companies whose executives have completed Wlad's trainings — the same
// verified set the bio page uses (typographic wordmarks, no logo images).
const CLIENTS = [
  'Allianz', 'BMW', 'Siemens', 'Telekom', 'Lufthansa', 'Bosch',
  'Vodafone', 'Daimler', 'Sky', 'Pro7', '3M', 'Generali',
];

const REVIEW_PLATFORMS = [
  ['Trustpilot', '4,9', '388 Bewertungen', 'https://uk.trustpilot.com/review/argumentorik.com'],
  ['Greator', '4,7', '995 Bewertungen', 'https://greator.com/coach/wlad-jachtchenko'],
];

// Problem escalation · the week every leader recognizes.
const WEEK = [
  ['Montag', '„Diese Woche gebe ich endlich gutes Feedback."', false],
  ['Dienstag', 'Stress. Drei Meetings. Ein Konflikt. Feedback verschoben.', false],
  ['Mittwoch', 'Das schwierige Gespräch? „Nächste Woche wirklich."', false],
  ['Donnerstag', 'Der Konflikt eskaliert — jetzt ist es ein Krisengespräch.', false],
  ['Freitag', 'Vom letzten Seminar ist nichts mehr übrig außer den Folien.', true],
];

const TRIPLES = [
  ['Nicht Motivation.', 'Training.'],
  ['Nicht Bücher.', 'Wiederholungen.'],
  ['Nicht Glück.', 'System.'],
];

const SEMINAR_FLOW = ['Seminar', 'Notizen', 'Alltag', 'Vergessen'];
const OS_FLOW = ['Täglich 15 Min', 'KI-Coach', 'Simulation', 'Feedback', 'Fortschritt'];

const LEARN_CARDS = [
  ['Schwierige Gespräche', 'Wie du Kritik äußerst, ohne Vertrauen zu verlieren — mit Skript statt Bauchgefühl.'],
  ['Der KI-Coach', 'Wie du mit WladBot jeden Tag 15 Minuten trainierst — an deinen echten Fällen.'],
  ['Simulationen', 'Realistische Führungssituationen durchspielen, bevor sie im echten Meeting passieren.'],
  ['Die 30-Tage-Challenge', 'Der Trainingsplan, der aus einem Vormittag Impuls eine tägliche Routine macht.'],
  ['Die Frameworks', 'Die Methoden hinter 400.000+ Coachings — von SEXIER bis zur Feedbackformel.'],
];

// Value stack · only things the funnel genuinely delivers.
const VALUE_STACK = [
  [Video, 'Live-Demonstration', 'Das komplette Leadership Operating System, live gezeigt — kein Foliensatz.'],
  [CalendarCheck, 'Der 30-Tage-Trainingsplan', 'Die Struktur der Challenge, mit der Führung zur täglichen Routine wird.'],
  [MessageCircleQuestion, 'Live Q&A mit Wlad', 'Deine Fragen, live beantwortet — ab 11:15 Uhr fester Teil der Agenda.'],
  [ClipboardCheck, 'Der kostenlose Leader-Check', 'Dein Führungsprofil in 10 Minuten — KI-Readiness, Rhetorik, EQ.'],
  [PlayCircle, 'Die 4-teilige Videoserie', '„Führung beginnt hier" — schaltest du direkt nach der Anmeldung frei.'],
  [BellRing, 'Kalender + Erinnerungen', 'Google-Calendar-Einladung sofort, Erinnerung 24h und 1h vor dem Start.'],
];

// The real free-video series (services_free_videos.py) — real titles and
// durations, unlocked from the thank-you page after registration.
const FREE_VIDEOS = [
  ['Warum die meisten Führungskräfte unsichtbar bleiben', '8 Min'],
  ['Natürliche Autorität — ohne lauter zu werden', '11 Min'],
  ['Weniger arbeiten, mehr bewirken', '9 Min'],
  ['Dein 30-Tage-Plan zur KI-nativen Führungskraft', '12 Min'],
];

// Canon-correct framework teasers (docs/WLAD_CANON.md) → journal deep-dives.
const FRAMEWORK_PEEK = [
  ['SEXIER-Modell', 'Statement · Explanation · eXample · Impact · Explanation of Impact · Rebuttal — die sechsstufige Argumentations-Architektur für strittige Thesen.', '/journal/die-5-argumentations-levels-von-behauptung-bis-sexier'],
  ['Feedbackformel B·W·W', 'Beobachtung + Wirkung + Wunsch. Nie „Du bist…", immer „Ich habe beobachtet, dass…" — das Skript für jedes schwierige Gespräch.', '/journal/die-feedback-formel-bww'],
  ['10 Stufen des Zuhörens', 'Von Stufe 1 (nicht zuhören) bis Stufe 10 (Stille als Zuhören). 80 % aller Führungskräfte hängen auf Stufe 2 fest: auf die eigene Antwort warten.', '/journal/die-10-stufen-des-zuhoerens-wlads-modell-erklaert'],
  ['Die 5 Rollen einer Führungskraft', 'Kommunikator · Manager · Team-Leader · Psychologe · Problemlöser — und warum die meisten eine der fünf systematisch weglassen.', '/journal/5-rollen-der-fuehrung-nach-wlad-jachtchenko'],
];

// Honest scarcity · real reasons to be there live, no fake counters.
const LIVE_REASONS = [
  'Keine Aufzeichnung — das Webinar ist bewusst live-only.',
  'Deine Fragen kommen dran, nicht die aus dem Skript.',
  'Ein echter Live-Case wird gemeinsam durchgearbeitet.',
  'Die Videoserie schaltest du als Teilnehmer direkt frei.',
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

/** Animated stat counter · counts up once when scrolled into view. */
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

/** Real registrant scarcity bar · fetched, never fabricated. Renders nothing
 * if the endpoint is unreachable — a missing bar is fine, a fake one is not. */
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
          {state === 'loading' ? 'Wird reserviert…' : 'Ja, ich möchte teilnehmen'}
          {state !== 'loading' && <ArrowUpRight size={16} />}
        </motion.button>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#707072]">
        Keine Kreditkarte · 100 % kostenlos · live · keine Aufzeichnung
        {state === 'error' && (
          <span className="block mt-1.5 tracking-normal normal-case text-[12px] text-red-600">
            Das hat nicht geklappt — bitte E-Mail prüfen und erneut senden.
          </span>
        )}
      </p>
    </form>
  );
};

const SectionEyebrow = ({ children, light = false }) => (
  <motion.p
    initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE_UP}
    className={`font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] mb-3 ${light ? 'text-[#BFFF00]' : 'text-[#5A7700]'}`}
  >
    {children}
  </motion.p>
);

const SectionHeadline = ({ children, className = '', light = false }) => (
  <motion.h2
    initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} variants={FADE_UP}
    className={`text-[28px] sm:text-[40px] leading-[1.02] tracking-[-0.035em] ${light ? 'text-white' : 'text-[#111111]'} ${className}`}
    style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
  >
    {children}
  </motion.h2>
);

/** Full-bleed ink statement band · the Hormozi "big sentence" moment. */
const StatementBand = ({ eyebrow, children }) => (
  <section className="bg-[#111111]">
    <div className="max-w-[900px] mx-auto px-5 md:px-10 py-14 md:py-20 text-center">
      {eyebrow && (
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE_UP}
          className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#BFFF00] mb-5"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.p
        initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} variants={FADE_UP}
        className="text-[26px] sm:text-[38px] md:text-[46px] leading-[1.08] tracking-[-0.03em] text-white"
        style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
      >
        {children}
      </motion.p>
    </div>
  </section>
);

export default function WebinarPage() {
  const formRef = useRef(null);

  useEffect(() => {
    // Light theme is the design of this funnel — force it, restore on leave.
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    track('webinar_view');

    const restoreMeta = applyPageMeta({
      title: 'Kostenloses Live-Webinar · Führung wird trainiert · LeaderOS',
      description:
        'Live-Webinar am 20.08.2026 mit Wlad Jachtchenko: Warum Seminare Wissen verändern, aber nicht Verhalten — ' +
        'und wie das erste Leadership Operating System Führung täglich trainierbar macht. Kostenlos, live, mit Q&A.',
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
        {/* ── HOOK · headline + video first ────────────────────────────── */}
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
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 pt-12 md:pt-16 pb-16 md:pb-20">
            <div className="lg:flex lg:items-start lg:gap-14">
              <div className="lg:flex-1 lg:min-w-0">
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
                  className="text-[34px] sm:text-[50px] md:text-[62px] leading-[1.0] tracking-[-0.04em] text-[#111111] max-w-4xl"
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
                >
                  Die meisten Führungskräfte trainieren nie<span className="text-[#5A7700] not-italic">.</span><br />
                  <span className="text-[#4b4b4d]">Deshalb führen sie jedes Jahr dieselben schwierigen Gespräche.</span>
                </motion.h1>
                <motion.p
                  initial="hidden" animate="show" custom={1} variants={FADE_UP}
                  className="mt-6 max-w-2xl text-[16px] sm:text-[19px] leading-[1.55] text-[#4b4b4d]"
                >
                  Im kostenlosen Live-Webinar zeigt dir 3× SPIEGEL-Bestseller-Autor{' '}
                  <span className="text-[#111111] font-semibold">Wlad Jachtchenko</span> das erste
                  Leadership Operating System, mit dem Führung täglich trainiert wird — unterstützt durch KI.
                </motion.p>

                <motion.div
                  initial="hidden" animate="show" custom={2} variants={FADE_UP}
                  className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <motion.button
                    onClick={scrollToForm}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                    className="h-14 px-8 rounded-full bg-[#111111] text-white hover:bg-[#BFFF00] hover:text-[#111111] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Ja, ich möchte teilnehmen <ArrowUpRight size={16} />
                  </motion.button>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {['Keine Kreditkarte', '100 % kostenlos', 'Live', 'Keine Aufzeichnung'].map((t) => (
                      <li key={t} className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#707072]">
                        <Check size={11} className="text-[#5A7700]" strokeWidth={3} /> {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Emotional Wlad portrait · real photo, desktop */}
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block lg:w-[320px] lg:shrink-0 relative"
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

            {/* Video · immediately after the hook, not buried below */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 md:mt-14 relative rounded-3xl overflow-hidden bg-[#111111] shadow-[0_40px_80px_-40px_rgba(17,17,17,0.4)] max-w-[900px]"
            >
              <div className="aspect-video">
                <iframe
                  src={HERO_VIDEO_SRC}
                  title="Wlad Jachtchenko — worum es im Webinar geht"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            <div className="mt-10"><Countdown /></div>
            <ScarcityBar />
            <div ref={formRef} className="mt-9 max-w-2xl scroll-mt-24">
              <RegisterForm idSuffix="-hero" />
            </div>
          </div>
        </section>

        {/* ── BEWEIS · social proof immediately after the hook ─────────── */}
        <section className="border-t border-[#111111]/8 bg-white">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-10 md:py-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-10">
              {STATS.map(([value, label], i) => (
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
            {/* Client wordmarks · typographic, verifiable, no logo-soup images */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
              className="border-t border-[#111111]/8 pt-7"
            >
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#9e9ea0] mb-4">
                ▸ Führungskräfte dieser Unternehmen haben Wlads Trainings durchlaufen
              </p>
              <ul className="flex flex-wrap items-center gap-x-7 gap-y-2.5">
                {CLIENTS.map((c) => (
                  <li key={c} className="font-mono text-[12px] md:text-[13px] font-bold uppercase tracking-[0.14em] text-[#707072]">{c}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                {REVIEW_PLATFORMS.map(([name, rating, count, href]) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[12.5px] text-[#4b4b4d] hover:text-[#111111] transition-colors"
                  >
                    <Star size={13} className="text-[#111111] fill-[#BFFF00]" />
                    <span className="font-bold text-[#111111]">{rating}/5</span> {name} · {count} <ArrowUpRight size={11} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── PROBLEM eskalieren · the week everyone recognizes ────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20 grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div className="md:col-span-5">
              <SectionEyebrow>▸ Das Problem</SectionEyebrow>
              <SectionHeadline className="mb-5">
                Führung scheitert heute nicht am Wissen. Sie scheitert am Alltag<span className="text-[#5A7700] not-italic">.</span>
              </SectionHeadline>
              <motion.p
                initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
                className="text-[15px] leading-[1.65] text-[#4b4b4d]"
              >
                Jeder weiß, dass man Feedback geben sollte. Jeder weiß, dass man Konflikte
                früh anspricht. Jeder weiß, dass gute Kommunikation wichtig ist.
                Warum passiert es trotzdem nicht? Weil Wissen kein Verhalten ist —
                und der Kalender jede gute Absicht frisst.
              </motion.p>
            </div>
            <div className="md:col-span-7">
              <ol className="space-y-3">
                {WEEK.map(([day, text, isPunchline], i) => (
                  <motion.li
                    key={day}
                    initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} custom={i} variants={FADE_UP}
                    className={`flex items-start gap-4 rounded-2xl px-5 py-4 border ${isPunchline ? 'bg-[#111111] border-[#111111]' : 'bg-white border-[#111111]/8'}`}
                  >
                    <span className={`shrink-0 w-24 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] pt-0.5 ${isPunchline ? 'text-[#BFFF00]' : 'text-[#5A7700]'}`}>{day}</span>
                    <span className={`text-[14px] leading-[1.5] ${isPunchline ? 'text-white font-semibold' : 'text-[#39393b]'}`}>{text}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <StatementBand>
          Seminare verändern Wissen.<br />Nicht Verhalten<span className="text-[#BFFF00] not-italic">.</span>
        </StatementBand>

        {/* ── NEUE OPPORTUNITY · Führung als Training ──────────────────── */}
        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Die neue Möglichkeit</SectionEyebrow>
            <SectionHeadline className="mb-8 max-w-3xl">
              Was wäre, wenn Führung so trainierbar wäre wie Fitness<span className="text-[#5A7700] not-italic">?</span>
            </SectionHeadline>
            <div className="grid sm:grid-cols-3 gap-4 md:gap-5 mb-12">
              {TRIPLES.map(([not_, but], i) => (
                <motion.div
                  key={but}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} custom={i} variants={FADE_UP}
                  className="rounded-3xl bg-[#fafafa] border border-[#111111]/8 p-6 text-center"
                >
                  <div className="text-[15px] text-[#9e9ea0] line-through decoration-[#9e9ea0]/60" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{not_}</div>
                  <div className="mt-1 text-[24px] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>{but}</div>
                </motion.div>
              ))}
            </div>

            {/* Seminar vs. LeaderOS flow */}
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={FADE_UP}
                className="rounded-3xl border border-[#111111]/10 bg-[#fafafa] p-7"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9e9ea0] mb-5 flex items-center gap-2">
                  <X size={13} className="text-red-500" /> Der alte Weg
                </p>
                <ol className="space-y-2">
                  {SEMINAR_FLOW.map((step, i) => (
                    <li key={step} className="flex flex-col items-start">
                      <span className={`text-[15px] font-bold ${i === SEMINAR_FLOW.length - 1 ? 'text-red-600' : 'text-[#4b4b4d]'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{step}</span>
                      {i < SEMINAR_FLOW.length - 1 && <ArrowDown size={13} className="text-[#9e9ea0] my-1 ml-1" />}
                    </li>
                  ))}
                </ol>
              </motion.div>
              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={1} variants={FADE_UP}
                className="rounded-3xl border-2 border-[#BFFF00] bg-white p-7 shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)]"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#5A7700] mb-5 flex items-center gap-2">
                  <Check size={13} strokeWidth={3} /> Mit LeaderOS
                </p>
                <ol className="space-y-2">
                  {OS_FLOW.map((step, i) => (
                    <li key={step} className="flex flex-col items-start">
                      <span className={`text-[15px] font-bold ${i === OS_FLOW.length - 1 ? 'text-[#5A7700]' : 'text-[#111111]'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{step}</span>
                      {i < OS_FLOW.length - 1 && <ArrowDown size={13} className="text-[#5A7700] my-1 ml-1" />}
                    </li>
                  ))}
                </ol>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── MECHANISMUS · what the webinar teaches ───────────────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Inhalte</SectionEyebrow>
            <SectionHeadline className="mb-10">Das lernst du in 90 Minuten<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {LEARN_CARDS.map(([title, desc], i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-white border border-[#111111]/8 p-6 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)]"
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

        <StatementBand eyebrow="▸ Warum jetzt">
          Die Zukunft gehört nicht den besten Führungskräften. Sondern denen, die am schnellsten besser werden<span className="text-[#BFFF00] not-italic">.</span>
        </StatementBand>

        {/* ── VALUE STACK ──────────────────────────────────────────────── */}
        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Value Stack</SectionEyebrow>
            <SectionHeadline className="mb-10">Im Webinar bekommst du Zugriff auf<span className="text-[#5A7700] not-italic">:</span></SectionHeadline>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {VALUE_STACK.map(([Icon, title, desc], i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  className="flex items-start gap-4 rounded-3xl bg-[#fafafa] border border-[#111111]/8 p-6"
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
            <div className="mt-9">
              <motion.button
                onClick={scrollToForm}
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE_UP}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="h-13 px-7 py-3.5 rounded-full bg-[#111111] text-white hover:bg-[#BFFF00] hover:text-[#111111] font-bold text-[12.5px] uppercase tracking-[0.14em] transition-colors inline-flex items-center gap-2"
              >
                Ja, ich möchte teilnehmen <ArrowUpRight size={15} />
              </motion.button>
            </div>
          </div>
        </section>

        {/* ── REVEAL · die 4 kostenlosen Videos ────────────────────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Teilnehmer-Bonus</SectionEyebrow>
            <SectionHeadline className="mb-4">Dazu: die 4-teilige Videoserie<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
              className="text-[15px] leading-[1.6] text-[#4b4b4d] max-w-2xl mb-10"
            >
              „Führung beginnt hier" — vier Videos von Wlad, ein Video pro Tag in dein Postfach.
              Als Webinar-Teilnehmer schaltest du die Serie direkt auf der Bestätigungsseite frei,
              damit du vorbereitet in den Termin gehst.
            </motion.p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {FREE_VIDEOS.map(([title, duration], i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} custom={i} variants={FADE_UP}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-white border border-[#111111]/8 p-6 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#111111] text-[#BFFF00] text-[14px] font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>{i + 1}</span>
                    <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#9e9ea0]">{duration}</span>
                  </div>
                  <h3 className="text-[15px] leading-[1.3] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{title}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ÜBER WLAD · Story, nicht Lebenslauf ──────────────────────── */}
        <section className="bg-white border-t border-[#111111]/8">
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
              <SectionEyebrow>▸ Dein Host · die Geschichte</SectionEyebrow>
              <SectionHeadline className="mb-5">Warum es LeaderOS gibt<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true }} custom={2} variants={FADE_UP}
                className="space-y-4 text-[15.5px] leading-[1.65] text-[#4b4b4d] max-w-2xl"
              >
                <p>
                  Wlad Jachtchenko hat als UNO-Assistent gearbeitet, in München und an der
                  Columbia University studiert und sich durch die K.-o.-Runden der europäischen
                  Debating-Meisterschaften argumentiert. Seit 2007 trainiert er Führungskräfte —
                  über 400.000 Klienten, 13 Bücher, drei davon SPIEGEL-Bestseller.
                </p>
                <p>
                  Und irgendwann fiel ihm auf: Das Problem seiner Klienten war fast nie fehlendes
                  Wissen. Nach jedem Seminar wussten alle, was zu tun ist. Sechs Wochen später
                  war das Verhalten das alte. Wissen wird gelehrt — Verhalten wird trainiert.
                </p>
                <p>
                  Genau dafür hat er mit seinem Team LeaderOS gebaut: seine komplette Methodik
                  als tägliches Trainingssystem, mit einem KI-Coach, der seine 13 Bücher, Kurse
                  und Vorträge kennt. Im Webinar zeigt er das System zum ersten Mal live — und
                  beantwortet deine Fragen persönlich.
                </p>
              </motion.div>
              <motion.ul
                initial="hidden" whileInView="show" viewport={{ once: true }} custom={3} variants={FADE_UP}
                className="mt-6 flex flex-wrap gap-2.5"
              >
                {['Seit 2007 im Coaching', '3× SPIEGEL-Bestseller', '3× TEDx', 'Gründer Argumentorik-Akademie'].map((chip) => (
                  <li key={chip} className="rounded-full bg-[#fafafa] border border-[#111111]/10 px-4 py-2 text-[12.5px] font-semibold text-[#39393b]">
                    {chip}
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* ── BEWEIS II · die Frameworks (der Mechanismus ist echt) ────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
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
                  className="rounded-3xl bg-white border border-[#111111]/8 p-7 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(17,17,17,0.3)]"
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

        {/* ── ECHTE SCARCITY · reasons, not fake counters ──────────────── */}
        <section className="bg-white border-t border-[#111111]/8">
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Warum live dabei sein</SectionEyebrow>
            <SectionHeadline className="mb-8">Vier ehrliche Gründe<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <ol className="space-y-3 mb-8">
              {LIVE_REASONS.map((reason, i) => (
                <motion.li
                  key={reason}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} custom={i} variants={FADE_UP}
                  className="flex items-start gap-4 rounded-2xl bg-[#fafafa] border border-[#111111]/8 px-5 py-4"
                >
                  <span className="shrink-0 inline-flex w-7 h-7 items-center justify-center rounded-full bg-[#BFFF00] text-[#111111] text-[13px] font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>{i + 1}</span>
                  <span className="text-[14.5px] leading-[1.5] text-[#39393b] pt-0.5">{reason}</span>
                </motion.li>
              ))}
            </ol>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={4} variants={FADE_UP}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9e9ea0] leading-[1.7]"
            >
              ▸ Du findest hier keinen „Nur noch 18 Plätze!"-Zähler. Die Kapazität oben ist echt —
              sie kommt live aus der Anmelde-Datenbank.
            </motion.p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="bg-[#fafafa] border-t border-[#111111]/8">
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <SectionEyebrow>▸ Häufige Fragen</SectionEyebrow>
            <SectionHeadline className="mb-8">Kurz beantwortet<span className="text-[#5A7700] not-italic">.</span></SectionHeadline>
            <dl className="space-y-3">
              {FAQ.map(([q, a], i) => (
                <motion.div
                  key={q}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                  className="rounded-2xl bg-white border border-[#111111]/8 px-6 py-5"
                >
                  <dt className="text-[15.5px] leading-[1.3] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{q}</dt>
                  <dd className="mt-1.5 text-[13.5px] leading-[1.55] text-[#707072]">{a}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
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
          <div className="max-w-[860px] mx-auto px-5 md:px-10 py-16 md:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-[28px] sm:text-[40px] md:text-[48px] leading-[1.05] tracking-[-0.035em] text-[#111111]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                In einem Jahr wirst du sowieso geführt haben.<br />
                Die einzige Frage: mit System — oder mit Bauchgefühl<span className="text-[#5A7700] not-italic">?</span>
              </h2>
              <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#707072] flex items-center justify-center gap-1.5">
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
          Ja, ich möchte teilnehmen <ArrowUpRight size={15} />
        </button>
      </div>

      <LandingFooter />
    </div>
  );
}
