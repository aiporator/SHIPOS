import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { LandingFooter } from '../components/landing/LandingFooter';
import { DottedGlowBackground } from '../components/shared/DottedGlowBackground';
import { applyPageMeta } from '../lib/pageMeta';
import { subscribe, isValidEmail } from '../features/newsletter/lib/newsletterClient';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';
import { WladMark } from '../components/brand/WladMark';

/**
 * WebinarPage · /webinar · the SQUEEZE page for the free live webinar.
 *
 * One page, one goal: the registration. Unlike /event (the full editorial
 * event page) this is the high-converting funnel version: minimal chrome
 * (logo only, no nav exits), outcome-first copy per the product-positioning
 * brief (sell the SYSTEM, Wlad is the trust anchor), countdown urgency,
 * two opt-ins, sticky mobile CTA.
 */

const WEBINAR_TS = new Date('2026-08-20T10:00:00+02:00').getTime();
const DATE_LINE = 'DO 20. AUGUST 2026 · 10:00 UHR · LIVE · ONLINE';

const OUTCOMES = [
  'Wie du schwierige Mitarbeitergespräche souverän führst — mit Struktur statt Bauchgefühl',
  'Wie du mit einem KI-Coach jeden Tag trainierst, statt einmal im Jahr ein Seminar zu besuchen',
  'Der 30-Tage-Plan, mit dem Führung vom Vorsatz zum System wird',
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

const Countdown = () => {
  const { d, h, m, s } = useCountdown(WEBINAR_TS);
  return (
    <div className="flex gap-2.5 sm:gap-3">
      {[['Tage', d], ['Std', h], ['Min', m], ['Sek', s]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center justify-center w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] border-2 border-white/15 bg-white/[0.03]">
          <span className="tabular-nums leading-none text-brand text-[24px] sm:text-[30px]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
            {String(val).padStart(2, '0')}
          </span>
          <span className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</span>
        </div>
      ))}
    </div>
  );
};

const RegisterForm = ({ idSuffix = '' }) => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const valid = isValidEmail(email);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || state === 'loading') return;
    setState('loading');
    track('webinar_register_submit');
    const res = await subscribe({ email, source: 'webinar-lp', campaign: 'webinar-2026-08-20' });
    setState(res.ok ? 'done' : 'error');
    track('webinar_register_result', { ok: res.ok });
  };

  if (state === 'done') {
    return (
      <div className="flex items-start gap-3 border-2 border-brand/50 bg-brand/[0.06] p-5" data-testid={`webinar-success${idSuffix}`}>
        <span className="mt-0.5 inline-flex w-6 h-6 items-center justify-center bg-[#BFFF00] text-[#0A0A0A] shrink-0">
          <Check size={15} strokeWidth={3} />
        </span>
        <div>
          <p className="text-[15px] font-bold text-white">Platz reserviert · check deine Mails.</p>
          <p className="mt-1 text-[13px] leading-[1.5] text-white/60">
            Bestätige kurz deine E-Mail — dann bekommst du den Zugangs-Link.
            Bis dahin: hol dir die{' '}
            <Link to="/fuehrung-beginnt-hier" className="text-brand underline underline-offset-2">4 kostenlosen Videos</Link>.
          </p>
        </div>
      </div>
    );
  }

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
        <button
          type="submit"
          disabled={!valid || state === 'loading'}
          className="h-14 px-7 bg-[#BFFF00] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {state === 'loading' ? 'Wird reserviert…' : 'Platz sichern · kostenlos'}
          {state !== 'loading' && <ArrowUpRight size={16} />}
        </button>
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
  const [registered] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');
    track('webinar_view');

    const restoreMeta = applyPageMeta({
      title: 'Kostenloses Live-Webinar · Führe besser. Jeden Tag. · Leader-OS',
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
      name: 'Führe besser. Jeden Tag. · Das kostenlose Leader-OS Live-Webinar',
      startDate: '2026-08-20T10:00:00+02:00',
      endDate: '2026-08-20T11:30:00+02:00',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'VirtualLocation', url: 'https://leader-os.de/webinar' },
      image: ['https://leader-os.de/og-wlad.jpg'],
      description: 'Kostenloses Live-Webinar: das Leadership Operating System für Führungskräfte.',
      organizer: { '@type': 'Organization', name: 'Leader-OS', url: 'https://leader-os.de' },
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
      <header className="max-w-[1100px] mx-auto px-5 md:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Leader-OS Startseite">
          <WladMark size={34} />
          <span className="font-black tracking-tight text-foreground text-[19px]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
            Leader<span className="text-brand mx-0.5">·</span>OS
          </span>
        </Link>
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-brand">▸ Live-Webinar · kostenlos</span>
      </header>

      <main id="main-content">
        {/* Hero + inline registration */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <DottedGlowBackground gap={16} radius={1.8} color="rgba(255,255,255,0.18)" glowColor="rgba(191,255,0,0.6)" opacity={0.5} />
          </div>
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-12 md:pt-16 pb-16 md:pb-20">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-foreground/55 mb-5">{DATE_LINE}</p>
            <h1
              className="text-[40px] sm:text-[62px] md:text-[84px] leading-[0.94] tracking-[-0.04em] text-foreground max-w-4xl"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Führe besser.<br />Jeden Tag<span className="text-brand not-italic">.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] sm:text-[19px] leading-[1.55] text-foreground/70">
              Das kostenlose Live-Webinar zum <span className="text-foreground font-semibold">Leadership Operating System</span>:
              wie du Kommunikation, Entscheidungen und Führung täglich trainierst — mit KI-Coach,
              System und den Methoden von Wlad Jachtchenko. Statt Motivation, die am Montag verpufft.
            </p>

            <ul className="mt-8 space-y-3 max-w-2xl">
              {OUTCOMES.map((o) => (
                <li key={o} className="flex items-start gap-3 text-[15px] leading-[1.5] text-foreground/85">
                  <span className="mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center bg-[#BFFF00] text-[#0A0A0A]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {o}
                </li>
              ))}
            </ul>

            <div className="mt-9"><Countdown /></div>

            <div ref={formRef} className="mt-9 max-w-2xl scroll-mt-24">
              <RegisterForm idSuffix="-hero" />
            </div>
          </div>
        </section>

        {/* Host strip · Wlad as trust anchor, not the product */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-10 md:py-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
                420.000+ trainierte Klienten, Trustpilot 4,9/5. Seine Methodik ist das Fundament von Leader-OS.
                Im Webinar zeigt er sie live — und beantwortet deine Fragen.
              </p>
            </div>
          </div>
        </section>

        {/* Mini-FAQ + final ask */}
        <section className="relative isolate overflow-hidden border-t-2 border-foreground/12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <DottedGlowBackground gap={16} radius={1.8} color="rgba(255,255,255,0.2)" glowColor="rgba(191,255,0,0.6)" opacity={0.5} />
          </div>
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <dl className="border-t-2 border-foreground/15 mb-12">
              {FAQ.map(([q, a]) => (
                <div key={q} className="py-4 border-b border-foreground/15">
                  <dt className="text-[15.5px] leading-[1.3] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{q}</dt>
                  <dd className="mt-1.5 text-[13.5px] leading-[1.55] text-foreground/65">{a}</dd>
                </div>
              ))}
            </dl>
            <div className="text-center">
              <h2 className="text-[28px] sm:text-[40px] md:text-[48px] leading-[1.0] tracking-[-0.035em] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                Sichere dir deinen Platz<span className="text-brand not-italic">.</span>
              </h2>
              <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-foreground/50">{DATE_LINE}</p>
              <div className="mt-7 max-w-xl mx-auto text-left">
                <RegisterForm idSuffix="-final" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      {!registered && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur border-t-2 border-brand/40 px-4 py-3">
          <button
            onClick={scrollToForm}
            className="w-full inline-flex items-center justify-center gap-2 h-12 bg-[#BFFF00] text-[#0A0A0A] font-bold text-[12.5px] uppercase tracking-[0.14em]"
          >
            Platz sichern · kostenlos <ArrowUpRight size={15} />
          </button>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}
