import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Star } from 'lucide-react';
import { LandingFooter } from '../components/landing/LandingFooter';
import { DottedGlowBackground } from '../components/shared/DottedGlowBackground';
import { applyPageMeta } from '../lib/pageMeta';
import { isValidEmail } from '../features/newsletter/lib/newsletterClient';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';
import { WladMark } from '../components/brand/WladMark';

/**
 * WebinarPage · /webinar · the SQUEEZE page for the free live webinar.
 *
 * One page, one goal: the registration. Unlike /event (the full editorial
 * event page) this is the high-converting funnel version: minimal chrome
 * (logo only, no nav exits), outcome-first copy per the product-positioning
 * brief (sell the SYSTEM, Wlad is the trust anchor).
 *
 * Buying triggers, all honest (no fabricated numbers):
 *   Urgency    · live countdown to the real date
 *   Scarcity   · REAL registrant count from /api/webinar/stats, capped at a
 *                real published capacity (Zoom-room-size constraint, not a
 *                fake "3 spots left" lie)
 *   Authority  · Wlad's verified credentials as a badge strip
 *   Proof      · real registrant count doubles as social proof
 *   Risk-off   · 100% free, no card, unsubscribe anytime
 *   Clarity    · exact agenda timeline + outcome bullets
 *
 * Registration posts to the dedicated backend funnel (routes/webinar.py),
 * which sends an instant confirmation + calendar link and later drives the
 * 24h/1h reminder + day-after "start your trial" emails — then routes to
 * a dedicated /webinar/danke thank-you page (not just an inline swap) so
 * the confirmation moment can carry its own CTAs toward leaderos.de.
 */

const WEBINAR_TS = new Date('2026-08-20T10:00:00+02:00').getTime();
const DATE_LINE = 'DO 20. AUGUST 2026 · 10:00 UHR · LIVE · ONLINE';

const OUTCOMES = [
  'Wie du schwierige Mitarbeitergespräche souverän führst — mit Struktur statt Bauchgefühl',
  'Wie du mit einem KI-Coach jeden Tag trainierst, statt einmal im Jahr ein Seminar zu besuchen',
  'Der 30-Tage-Plan, mit dem Führung vom Vorsatz zum System wird',
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

const FAQ = [
  ['Kostet das etwas?', 'Nein. Das Webinar ist komplett kostenlos — keine Karte, kein Haken. Du brauchst nur deine E-Mail.'],
  ['Gibt es eine Aufzeichnung?', 'Nein, das Webinar ist live. Genau deshalb lohnt es sich: du kannst deine Fragen direkt im Q&A stellen.'],
  ['Für wen ist es?', 'Für Führungskräfte und alle, die es werden wollen — Teamleads, Projektmanager, Senior-Experten. Keine KI-Vorkenntnisse nötig.'],
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

const Countdown = () => {
  const { d, h, m, s } = useCountdown(WEBINAR_TS);
  return (
    <div className="flex gap-2.5 sm:gap-3">
      {[['Tage', d], ['Std', h], ['Min', m], ['Sek', s]].map(([label, val], i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] border-2 border-white/15 bg-white/[0.03]"
        >
          <span className="tabular-nums leading-none text-brand text-[24px] sm:text-[30px]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
            {String(val).padStart(2, '0')}
          </span>
          <span className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</span>
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
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-white/55 mb-1.5">
        <span>{stats.registered} bereits angemeldet</span>
        <span>{stats.spots_left} Plätze frei</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-brand"
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
          className="flex-1 h-14 px-5 bg-white/[0.05] border-2 border-white/20 focus:border-brand outline-none text-white text-[15px] placeholder:text-white/35 transition-colors"
        />
        <motion.button
          type="submit"
          disabled={!valid || state === 'loading'}
          whileHover={valid ? { y: -2 } : {}}
          whileTap={valid ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className="h-14 px-7 bg-[#BFFF00] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {state === 'loading' ? 'Wird reserviert…' : 'Platz sichern · kostenlos'}
          {state !== 'loading' && <ArrowUpRight size={16} />}
        </motion.button>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
        100 % kostenlos · live · begrenzte Plätze · jederzeit abmeldbar
        {state === 'error' && (
          <span className="block mt-1.5 tracking-normal normal-case text-[12px] text-red-400">
            Das hat nicht geklappt — bitte E-Mail prüfen und erneut senden.
          </span>
        )}
      </p>
    </form>
  );
};

export default function WebinarPage() {
  const formRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');
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

    return () => { restoreMeta(); ld.remove(); if (!wasDark) root.classList.remove('dark'); };
  }, []);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="bg-background text-foreground min-h-[100dvh] antialiased" data-testid="webinar-page">
      {/* Squeeze chrome · logo only, no nav exits */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[1100px] mx-auto px-5 md:px-10 pt-6 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-3" aria-label="LeaderOS Startseite">
          <WladMark size={34} />
          <span className="font-black tracking-tight text-foreground text-[19px]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
            Leader<span className="text-brand mx-0.5">·</span>OS
          </span>
        </Link>
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-brand"
        >
          ▸ Live-Webinar · kostenlos
        </motion.span>
      </motion.header>

      <main id="main-content">
        {/* Hero + inline registration */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <DottedGlowBackground gap={16} radius={1.8} color="rgba(255,255,255,0.18)" glowColor="rgba(191,255,0,0.6)" opacity={0.5} />
          </div>
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 pt-12 md:pt-16 pb-16 md:pb-20 lg:flex lg:items-start lg:gap-14">
            <div className="lg:flex-1 lg:min-w-0">
              {/* Mobile-only compact portrait · the desktop floating card
                  below is hidden under lg, so without this a phone visitor
                  would see zero photos until scrolling to the host strip. */}
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
                  className="w-11 h-11 rounded-full object-cover object-top ring-2 ring-brand shrink-0"
                />
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">
                  Wlad Jachtchenko<br /><span className="text-foreground/35">Host &amp; Q&amp;A</span>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-foreground/55 mb-5"
              >
                {DATE_LINE}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 }}
                className="text-[40px] sm:text-[62px] md:text-[76px] leading-[0.94] tracking-[-0.04em] text-foreground max-w-4xl"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Führe besser.<br />Jeden Tag<span className="text-brand not-italic">.</span>
              </motion.h1>
              <motion.p
                initial="hidden" animate="show" custom={1} variants={FADE_UP}
                className="mt-6 max-w-2xl text-[16px] sm:text-[19px] leading-[1.55] text-foreground/70"
              >
                Das kostenlose Live-Webinar zum <span className="text-foreground font-semibold">Leadership Operating System</span>:
                wie du Kommunikation, Entscheidungen und Führung täglich trainierst — mit KI-Coach,
                System und den Methoden von Wlad Jachtchenko. Statt Motivation, die am Montag verpufft.
              </motion.p>

              <ul className="mt-8 space-y-3 max-w-2xl">
                {OUTCOMES.map((o, i) => (
                  <motion.li
                    key={o}
                    initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                    className="flex items-start gap-3 text-[15px] leading-[1.5] text-foreground/85"
                  >
                    <span className="mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center bg-[#BFFF00] text-[#0A0A0A]">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {o}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-9"><Countdown /></div>
              <ScarcityBar />

              <div ref={formRef} className="mt-9 max-w-2xl scroll-mt-24">
                <RegisterForm idSuffix="-hero" />
              </div>
            </div>

            {/* Host visual · desktop only, the moment that reads "premium
                event" instead of "text-only funnel page". Floating stat
                card + soft chrome frame, gentle idle drift. */}
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block lg:w-[340px] lg:shrink-0 relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative border-2 border-foreground/15 bg-white/[0.03] p-3"
              >
                <img
                  src={WLAD_AVATAR}
                  onError={withFallback(WLAD_AVATAR_FALLBACKS)}
                  alt="Wlad Jachtchenko"
                  fetchpriority="high"
                  className="w-full aspect-[4/5] object-cover object-top grayscale-[15%]"
                />
                <div className="absolute -bottom-4 -left-4 bg-brand text-[#0A0A0A] px-4 py-2.5 shadow-[4px_4px_0_0_#0A0A0A]">
                  <div className="text-[20px] tabular-nums leading-none" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>400.000+</div>
                  <div className="mt-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]">trainierte Klienten</div>
                </div>
              </motion.div>
              <div className="mt-8 pl-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-foreground/45">
                ▸ Wlad Jachtchenko · Host &amp; Q&amp;A
              </div>
            </motion.div>
          </div>
        </section>

        {/* Authority badge strip · verified facts only, no fabricated proof */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-8 md:py-9">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {AUTHORITY_BADGES.map(([value, label], i) => (
                <motion.div
                  key={label}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                  className="text-center sm:text-left"
                >
                  <div className="text-[26px] sm:text-[32px] text-foreground tabular-nums" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                    {value}<span className="text-brand not-italic">.</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-foreground/50">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Host strip · Wlad as trust anchor, not the product */}
        <section className="border-t-2 border-foreground/12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1100px] mx-auto px-5 md:px-10 py-10 md:py-12 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <img
              src={WLAD_AVATAR}
              onError={withFallback(WLAD_AVATAR_FALLBACKS)}
              alt="Wlad Jachtchenko"
              loading="lazy"
              className="w-20 h-20 rounded-full object-cover object-[50%_20%] ring-2 ring-brand shrink-0"
            />
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-brand mb-1.5">▸ Live dabei · im Q&A</p>
              <p className="text-[15px] leading-[1.55] text-foreground/75 max-w-2xl">
                <span className="font-bold text-foreground">Wlad Jachtchenko</span> — 3× SPIEGEL-Bestseller-Autor,
                400.000+ trainierte Klienten, Trustpilot 4,9/5. Seine Methodik ist das Fundament von LeaderOS.
                Im Webinar zeigt er sie live — und beantwortet deine Fragen.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Agenda · exact timeline, buying trigger via clarity/specificity */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={FADE_UP}
              className="font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-brand mb-3"
            >
              ▸ Ablauf · 90 Minuten
            </motion.p>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} variants={FADE_UP}
              className="text-[28px] sm:text-[40px] leading-[1.0] tracking-[-0.035em] text-foreground mb-10"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Genau das erwartet dich<span className="text-brand not-italic">.</span>
            </motion.h2>
            <ol className="space-y-0">
              {AGENDA.map(([time, title, desc], i) => (
                <motion.li
                  key={time}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={i} variants={FADE_UP}
                  className="flex gap-5 py-4 border-b border-foreground/12 last:border-b-0"
                >
                  <span className="shrink-0 w-14 font-mono text-[13px] font-bold text-brand tabular-nums pt-0.5">{time}</span>
                  <div>
                    <p className="text-[15.5px] font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p>
                    <p className="mt-0.5 text-[13.5px] leading-[1.5] text-foreground/60">{desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Mini-FAQ + final ask */}
        <section className="relative isolate overflow-hidden border-t-2 border-foreground/12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <DottedGlowBackground gap={16} radius={1.8} color="rgba(255,255,255,0.2)" glowColor="rgba(191,255,0,0.6)" opacity={0.5} />
          </div>
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <dl className="border-t-2 border-foreground/15 mb-12">
              {FAQ.map(([q, a], i) => (
                <motion.div
                  key={q}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.7 }} custom={i} variants={FADE_UP}
                  className="py-4 border-b border-foreground/15"
                >
                  <dt className="text-[15.5px] leading-[1.3] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{q}</dt>
                  <dd className="mt-1.5 text-[13.5px] leading-[1.55] text-foreground/65">{a}</dd>
                </motion.div>
              ))}
            </dl>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-[28px] sm:text-[40px] md:text-[48px] leading-[1.0] tracking-[-0.035em] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                  Sichere dir deinen Platz<span className="text-brand not-italic">.</span>
                </h2>
                <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-foreground/50 flex items-center justify-center gap-1.5">
                  <Star size={11} className="text-brand fill-brand" /> {DATE_LINE}
                </p>
              </motion.div>
              <div className="mt-7 max-w-xl mx-auto text-left">
                <RegisterForm idSuffix="-final" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur border-t-2 border-brand/40 px-4 py-3">
        <button
          onClick={scrollToForm}
          className="w-full inline-flex items-center justify-center gap-2 h-12 bg-[#BFFF00] text-[#0A0A0A] font-bold text-[12.5px] uppercase tracking-[0.14em]"
        >
          Platz sichern · kostenlos <ArrowUpRight size={15} />
        </button>
      </div>

      <LandingFooter />
    </div>
  );
}
