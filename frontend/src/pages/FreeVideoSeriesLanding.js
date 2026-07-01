/**
 * FreeVideoSeriesLanding · /gratis-videos — standalone lead-gen squeeze page.
 *
 * Full-depth godmode funnel (Hormozi / Sabri Suby / Russell Brunson):
 *
 *   HOOK (hero + fascinations + opt-in)
 *   → PAIN (agitation vignettes — the Monday the visitor recognizes)
 *   → VALUE STACK (4 videos, each with "Du lernst"-fascination bullets)
 *   → REASON WHY ("Warum kostenlos?" — the honest Brunson trust-builder)
 *   → HOW IT WORKS (3 steps, friction removal)
 *   → AUTHORITY (verified Wlad numbers + DAX client namestrip)
 *   → QUALIFIER (for-you / not-for-you — self-selection raises intent)
 *   → FAQ (8 objection-handling entries)
 *   → FINAL CTA (stack recap checklist + opt-in)
 *   + sticky mobile CTA bar after scroll.
 *
 * Instant opt-in reveals all 4 videos inline (no account — max opt-in rate).
 * Every claim in the authority section is verified against
 * WladJachtchenkoPage.js (420K+ clients, 12 books / 3× SPIEGEL, 14M views,
 * Trustpilot 4.9/5 · 388 reviews, DAX client list). No invented testimonials.
 *
 * Leads persist server-side via /api/free-videos/lead (durable Mongo store +
 * Supabase mirror + instant Video-1 email) — see lib/leadCapture.js.
 *
 * NOTE: path is in LANDING_ALLOWED_ROUTES so it renders on the marketing host.
 * Design: Athletic-Editorial DNA (DESIGN.md) — black/white canvas, lime
 * accent, mono BIB-codes, massive Outfit-Black-Italic display, sharp corners.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlayCircle, Lock, Check, ArrowRight, X } from 'lucide-react';
import { WladMark } from '../components/brand/WladMark';
import {
  FREE_VIDEOS,
  freeVideoEmbedUrl,
  isFreeVideoReady,
  hasFreeVideoOptIn,
} from '../data/freeVideos';
import { captureFreeVideoLead } from '../lib/leadCapture';

const SIGNUP_URL = 'https://leaderos.de/login';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Verified against WladJachtchenkoPage.js — never invent numbers here.
const PROOF = [
  ['420K+', 'KLIENTEN WELTWEIT'],
  ['3×', 'SPIEGEL-BESTSELLER'],
  ['14M', 'VIEWS · PODCAST + YT'],
  ['4.9/5', 'TRUSTPILOT · 388 REVIEWS'],
];

// Trained-at companies · verified list from the authority page.
const CLIENT_NAMES = ['ALLIANZ', 'BMW', 'SIEMENS', 'LUFTHANSA', 'TELEKOM', 'VODAFONE', 'BOSCH', 'SKY'];

// The Monday every overloaded leader recognizes. Agitation before solution.
const PAIN_VIGNETTES = [
  {
    time: '07:40',
    text: 'Dein Postfach entscheidet über deinen Tag — nicht du. 40 Mails, 3 Eskalationen, 0 Minuten zum Denken.',
  },
  {
    time: '11:15',
    text: 'Überall redet jemand über KI. Aber niemand zeigt dir, was DU als Führungskraft heute konkret damit machst.',
  },
  {
    time: '16:50',
    text: 'Das Strategie-Thema, das dich wirklich weiterbringt? Wieder auf morgen verschoben. Wie letzte Woche.',
  },
  {
    time: '22:30',
    text: 'Und leise die Frage: Wer führt in drei Jahren — du, oder jemand, der KI-nativ arbeitet?',
  },
];

const STEPS = [
  { nr: '01', title: 'E-Mail eintragen', body: '30 Sekunden. Kostenlos, keine Karte, kein Abo — nur deine E-Mail.' },
  { nr: '02', title: 'Sofort alle 4 Videos', body: 'Kein Warten, kein Freischalt-Countdown. Alle vier Videos spielen direkt hier im Browser.' },
  { nr: '03', title: 'Täglich ein Impuls', body: 'Wlad schickt dir 4 Tage lang je ein Video mit dem Kern-Prinzip — direkt anwendbar im nächsten Meeting.' },
];

const FOR_YOU = [
  'Du führst ein Team, einen Bereich oder ein Unternehmen — und dein Kalender ist voller als dein Kopf frei',
  'Du spürst, dass KI dein Thema sein muss, hattest aber nie Zeit, es systematisch anzugehen',
  'Du willst Prinzipien statt Tool-Listen — Dinge, die auch nächstes Jahr noch stimmen',
  'Du gibst 4 × ein paar Minuten, wenn der Gegenwert stimmt',
];

const NOT_FOR_YOU = [
  'Du suchst einen Prompt-Katalog oder das nächste Tool-Tutorial',
  'Du willst delegieren statt selbst verstehen — „soll sich die IT drum kümmern"',
  'Du erwartest, dass sich Führung ohne dein Zutun verändert',
];

const FAQ = [
  ['Was kostet die Video-Serie?', 'Nichts. Die 4 Videos sind komplett kostenlos — keine Kreditkarte, kein Abo, kein Kleingedrucktes. Du gibst deine E-Mail, du bekommst die Videos. Das ist der ganze Deal.'],
  ['Wie viel Zeit brauche ich?', 'Ein Video pro Tag, jeweils wenige Minuten konzentriert. Die Serie ist bewusst so gebaut, dass sie in einen vollen Führungskalender passt — ein Prinzip pro Tag statt Binge-Watching ohne Umsetzung.'],
  ['Ich habe keine KI-Vorkenntnisse. Ist das ein Problem?', 'Nein — im Gegenteil, genau dafür ist die Serie gebaut. Es geht nicht um Technik, sondern um Führungsprinzipien: was du entscheidest, was du delegierst, wie du KI in deinen Alltag einbaust. Kein Vorwissen nötig.'],
  ['Muss ich etwas installieren?', 'Nein. Die Videos laufen direkt im Browser — Desktop, Tablet oder Handy. Kein Download, kein Account-Zwang, kein Setup.'],
  ['Warum ist das kostenlos — wo ist der Haken?', 'Kein Haken, nur ein offenes Kalkül: Die Videos sind die beste Werbung, die wir machen können. Ein Teil der Zuschauer will danach mehr und testet Leader-OS 14 Tage kostenlos. Die meisten nehmen einfach die 4 Prinzipien mit — auch gut.'],
  ['Was passiert mit meinen Daten?', 'Deine E-Mail wird für die Video-Serie genutzt, DSGVO-konform gespeichert und nicht weiterverkauft. Jede Mail hat einen 1-Klick-Abmeldelink — ein Klick, und du hörst nichts mehr von uns.'],
  ['Muss ich danach etwas kaufen?', 'Nein. Am Ende der Serie zeigen wir dir, wie es mit Leader-OS weitergehen kann — 14 Tage kostenlos, ohne Karte. Ob du das nutzt, ist allein deine Entscheidung. Die 4 Videos bleiben so oder so deine.'],
  ['Wer ist Wlad Jachtchenko?', 'Europas führender Argumentations-Coach: 12 Bücher (davon 3 SPIEGEL-Bestseller), über 420.000 Klienten weltweit seit 2007, Trainer für Führungskräfte von Allianz bis Lufthansa, 3× TEDx-Speaker. In dieser Serie bringt er seine Führungs-Methodik mit KI zusammen.'],
];

// Everything the visitor gets — recapped as a stack before the final ask.
const STACK_RECAP = [
  'Alle 4 Videos — sofort freigeschaltet, kein Warten',
  '4 Tage · je ein Kern-Prinzip per Mail, direkt anwendbar',
  'Material aus Trainings, für die Unternehmen Tagessätze zahlen',
  '0 € · keine Karte · 1-Klick-Abmeldung jederzeit',
];

function OptInForm({ source, onUnlock, cta = '4 Videos gratis freischalten', dark = true }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = (email || '').trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setSubmitting(true);
    setError('');

    await captureFreeVideoLead({ email: trimmed, name, source });

    setSubmitting(false);
    onUnlock(trimmed);
  };

  const inputBase = dark
    ? 'bg-white/[0.04] border-white/20 focus:border-brand focus:bg-white/[0.06] text-white placeholder:text-white/35'
    : 'bg-black/[0.03] border-black/20 focus:border-black text-black placeholder:text-black/35';

  return (
    <form onSubmit={submit} className="w-full max-w-xl" data-testid={`optin-${source}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vorname"
          aria-label="Vorname"
          autoComplete="given-name"
          className={`sm:w-40 px-4 h-14 border-2 focus:outline-none text-[15px] font-medium transition-all ${inputBase}`}
          data-testid={`optin-name-${source}`}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="dein.name@firma.de"
          required
          aria-label="E-Mail-Adresse"
          autoComplete="email"
          className={`flex-1 px-4 h-14 border-2 focus:outline-none text-[15px] font-medium transition-all ${inputBase}`}
          data-testid={`optin-email-${source}`}
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-3 px-7 h-14 bg-brand text-[#0A0A0A] border-2 border-brand text-[12.5px] font-black uppercase tracking-[0.08em] hover:brightness-105 active:scale-[0.985] transition-all disabled:opacity-60 whitespace-nowrap"
          data-testid={`optin-submit-${source}`}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0A0A] text-brand text-base font-black leading-none">+</span>
          {submitting ? 'Wird freigeschaltet…' : cta}
        </button>
      </div>
      {error && <p className={`mt-3 text-[13px] font-semibold ${dark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      <div className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[0.2em] font-mono ${dark ? 'text-white/40' : 'text-black/45'}`}>
        <span className="text-brand">▸ SOFORT-ZUGANG</span>
        <span>OHNE KARTE</span>
        <span className={dark ? 'text-white/20' : 'text-black/20'}>/</span>
        <span>JEDERZEIT KÜNDBAR</span>
      </div>
    </form>
  );
}

/** Mid-page conversion nudge · scrolls to the hero form (or videos if unlocked). */
function MidCta({ unlocked, label = 'Jetzt gratis freischalten', dark = true }) {
  const target = unlocked ? '#videos' : '#optin-hero';
  const text = unlocked ? 'Zu deinen Videos' : label;
  return (
    <a
      href={target}
      className={`inline-flex items-center gap-2.5 px-6 h-12 border-2 text-[12px] font-black uppercase tracking-[0.08em] transition-all ${
        dark
          ? 'bg-brand text-[#0A0A0A] border-brand hover:brightness-105'
          : 'bg-black text-white border-black hover:bg-brand hover:text-black hover:border-brand'
      }`}
    >
      {unlocked ? <PlayCircle size={17} /> : <ArrowRight size={16} />}
      {text}
    </a>
  );
}

function VideoPlayer() {
  const readyVideos = useMemo(() => FREE_VIDEOS.filter(isFreeVideoReady), []);
  const [activeId, setActiveId] = useState((readyVideos[0] || FREE_VIDEOS[0])?.id);
  const active = FREE_VIDEOS.find((v) => v.id === activeId) || FREE_VIDEOS[0];
  const embedUrl = freeVideoEmbedUrl(active);

  const select = (video) => {
    if (!isFreeVideoReady(video)) return;
    setActiveId(video.id);
    if (typeof window !== 'undefined' && window.posthog?.capture) {
      try {
        window.posthog.capture('free_video_played', { video_id: video.id, day: video.day, surface: 'landing' });
      } catch { /* posthog never blocks UX */ }
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="border-2 border-white/15 bg-black overflow-hidden">
        <div className="relative w-full aspect-video bg-black">
          {embedUrl ? (
            <iframe
              key={active?.id}
              src={embedUrl}
              title={active?.title}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              data-testid="lp-video-player"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-2">
              <Lock size={26} className="text-brand" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">In Kürze verfügbar</span>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t-2 border-white/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">
            ▸ TAG {active?.day} / {FREE_VIDEOS.length} · {active?.tag}
          </div>
          <h3 className="text-xl font-black tracking-tight text-white mt-1">{active?.title}</h3>
          <p className="text-sm text-white/60 mt-1">{active?.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {FREE_VIDEOS.map((video) => {
          const ready = isFreeVideoReady(video);
          const isActive = video.id === active?.id;
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => select(video)}
              disabled={!ready}
              data-testid={`lp-video-card-${video.id}`}
              className={`group text-left flex items-center gap-3 p-3 border-2 transition-all ${
                isActive
                  ? 'border-brand bg-brand/[0.08]'
                  : ready
                  ? 'border-white/15 hover:border-white/40'
                  : 'border-white/10 opacity-55 cursor-not-allowed'
              }`}
            >
              <div className={`shrink-0 w-10 h-10 flex items-center justify-center border-2 ${isActive ? 'border-brand bg-brand text-black' : 'border-white/20 text-white/70'}`}>
                {ready ? <PlayCircle size={18} /> : <Lock size={16} />}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 font-bold">
                  TAG {video.day} · {ready ? video.tag : 'IN KÜRZE'}
                </div>
                <div className="text-[13px] font-bold text-white truncate">{video.title}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FreeVideoSeriesLanding() {
  const [params] = useSearchParams();
  const [unlocked, setUnlocked] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const stickyDismissed = useRef(false);

  useEffect(() => {
    document.title = '4 Gratis-Videos: Führe KI-nativ · Leader-OS';
    const desc =
      'Kostenlose 4-teilige Video-Serie von Wlad Jachtchenko: Wie du als Führungskraft KI-nativ wirst. Sofort-Zugang, keine Karte, jederzeit kündbar.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    // Landing runs in light mode; the sections opt into dark surfaces themselves.
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    if (wasDark) root.classList.remove('dark');
    return () => { if (wasDark) root.classList.add('dark'); };
  }, []);

  useEffect(() => {
    if (params.get('unlock') === '1' || hasFreeVideoOptIn()) setUnlocked(true);
  }, [params]);

  // Sticky mobile CTA · appears after the hero scrolls out, gone once opted in.
  useEffect(() => {
    if (unlocked) { setShowSticky(false); return undefined; }
    const onScroll = () => {
      if (stickyDismissed.current) return;
      setShowSticky(window.scrollY > 640);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [unlocked]);

  const onUnlock = () => {
    setUnlocked(true);
    setShowSticky(false);
    setTimeout(() => {
      document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <div className="bg-white text-black min-h-screen antialiased" data-testid="free-video-series-landing">
      {/* Minimal header · few exits by design */}
      <header className="sticky top-0 z-40 bg-black text-white border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Leader-OS Startseite">
            <WladMark size={30} />
            <span className="font-black tracking-tight text-[19px]" style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.03em' }}>
              Leader<span className="text-brand mx-0.5">·</span>OS
            </span>
          </Link>
          <a
            href={`${SIGNUP_URL}`}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60 hover:text-white transition-colors"
            data-testid="lp-nav-login"
          >
            Anmelden
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-[#0A0A0A] text-white overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(at 85% 0%, rgba(191,255,0,0.12) 0px, transparent 50%), radial-gradient(at 10% 100%, rgba(191,255,0,0.07) 0px, transparent 55%)',
          }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-16 md:py-24">
          <div className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-brand mb-5">
            ▸ GRATIS VIDEO-SERIE · 4 TEILE · MIT WLAD JACHTCHENKO
          </div>
          <h1
            className="text-[42px] sm:text-[64px] md:text-[84px] leading-[0.9] tracking-[-0.04em] max-w-4xl"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Führe
            <br />
            KI-nativ<span className="text-brand not-italic">.</span>
            <br />
            <span className="text-white/55">In 4 Videos.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] md:text-[18px] leading-[1.55] text-white/75">
            Die meisten Führungskräfte behandeln KI als Werkzeug. Die besten machen sie zum
            Betriebssystem ihrer Führung. Diese kostenlose 4-teilige Serie zeigt dir, wie —
            <span className="text-white"> ein Prinzip pro Video, sofort anwendbar.</span>
          </p>

          {/* Fascination bullets · what's inside, concretely */}
          <ul className="mt-7 max-w-2xl space-y-2.5">
            {[
              'Der 5-Minuten-Audit: wo dein Führungsalltag heute Zeit verbrennt',
              'Die 3-Züge-Methode: entscheiden, bevor das Problem auf dem Tisch liegt',
              'Der 15-Minuten-Wochen-Rhythmus, der KI fest in deine Führung einbaut',
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-[14.5px] md:text-[15px] leading-[1.5] text-white/80">
                <span className="mt-[3px] shrink-0 w-4 h-4 bg-brand text-[#0A0A0A] flex items-center justify-center">
                  <Check size={11} strokeWidth={3.5} />
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-9" id="optin-hero">
            {unlocked ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href="#videos"
                  className="inline-flex items-center gap-3 px-7 h-14 bg-brand text-[#0A0A0A] border-2 border-brand text-[12.5px] font-black uppercase tracking-[0.08em] hover:brightness-105 transition-all"
                  data-testid="lp-hero-watch"
                >
                  <PlayCircle size={20} /> Videos jetzt ansehen
                </a>
                <span className="inline-flex items-center gap-2 text-[13px] font-bold text-brand">
                  <Check size={16} /> Zugang freigeschaltet
                </span>
              </div>
            ) : (
              <OptInForm source="free-video-lp-hero" onUnlock={onUnlock} />
            )}
          </div>

          {/* Social proof · verified numbers only */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
            {PROOF.map(([big, small]) => (
              <div key={small}>
                <div className="font-mono text-[22px] md:text-[26px] font-black text-brand tabular-nums leading-none">{big}</div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 mt-1.5">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO PLAYER (revealed after opt-in) */}
      {unlocked && (
        <section id="videos" className="bg-[#0A0A0A] text-white border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16 md:py-20">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand mb-3">
              ▸ DEIN ZUGANG · ALLE 4 VIDEOS
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8">
              Leg los — Video <span className="text-brand">1</span> wartet.
            </h2>
            <VideoPlayer />
          </div>
        </section>
      )}

      {/* PAIN · the Monday you recognize */}
      <section className="bg-white text-black border-b-2 border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/50 mb-3">
            ▸ KENNST DU DIESE WOCHE?
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-[1.02]">
            Ein ganz normaler Montag<span className="text-brand-strong">.</span>
          </h2>

          <div className="mt-12 grid md:grid-cols-2 gap-3">
            {PAIN_VIGNETTES.map((v) => (
              <div key={v.time} className="border-2 border-black/12 p-6 flex gap-5">
                <div className="font-mono text-[15px] font-black text-black/30 tabular-nums shrink-0 pt-0.5">{v.time}</div>
                <p className="text-[15px] leading-[1.55] text-black/75">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl">
            <p className="text-[16px] md:text-[17px] leading-[1.6] text-black/70">
              Das Problem ist nicht, dass du zu wenig arbeitest. Das Problem ist, dass dein Tag
              dich führt — statt umgekehrt. Und jedes „später beschäftige ich mich mit KI" macht
              den Abstand größer zu denen, die es längst tun.
            </p>
            <p className="mt-4 text-[16px] md:text-[17px] leading-[1.6] text-black font-bold">
              Die gute Nachricht: Es braucht kein Sabbatical. Es braucht 4 Prinzipien — eins pro Tag.
            </p>
            <div className="mt-8">
              <MidCta unlocked={unlocked} dark={false} label="Mit Video 1 anfangen" />
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STACK · 4 videos with fascination bullets */}
      <section className="bg-white text-black">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/50 mb-3">
            ▸ DAS BEKOMMST DU
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-[1.02]">
            4 Videos. 4 Prinzipien. <span className="text-black/40">0 €.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] md:text-[16px] leading-[1.6] text-black/60">
            Kein Tool-Tutorial, kein Prompt-Katalog. Vier Führungs-Prinzipien, die auch dann noch
            stimmen, wenn das nächste Modell erscheint — Material aus Trainings, für die
            Unternehmen Tagessätze zahlen.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-3">
            {FREE_VIDEOS.map((video) => (
              <div key={video.id} className="border-2 border-black/12 p-6 hover:border-black transition-colors flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-brand-strong">▸ TAG {video.day}</span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">{video.tag}</span>
                </div>
                <h3 className="text-[19px] font-black tracking-tight leading-tight">{video.title}</h3>
                <p className="text-[13px] text-black/55 mt-1 leading-snug">{video.subtitle}</p>
                <p className="text-[13.5px] text-black/70 mt-3 leading-relaxed">{video.blurb}</p>
                {video.bullets?.length ? (
                  <ul className="mt-4 pt-4 border-t border-black/10 space-y-2">
                    <li className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">Du lernst</li>
                    {video.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-[13px] leading-[1.45] text-black/75">
                        <span className="mt-[3px] shrink-0 w-3.5 h-3.5 bg-black text-brand flex items-center justify-center">
                          <Check size={9} strokeWidth={4} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REASON WHY · the honest "why free?" */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand mb-3">
                ▸ DIE EHRLICHE ANTWORT
              </div>
              <h2
                className="text-[36px] md:text-[52px] leading-[0.95] tracking-[-0.035em]"
                style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Warum
                <br />
                kostenlos<span className="text-brand not-italic">?</span>
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-[15.5px] md:text-[16.5px] leading-[1.65] text-white/78">
              <p>
                Weil das die beste Werbung ist, die wir machen können. Statt dir zu <em>erzählen</em>,
                dass Wlads Methodik funktioniert, zeigen wir sie dir — an vier Prinzipien, die du
                sofort in deinem Alltag testen kannst.
              </p>
              <p>
                Unser Kalkül, offen ausgesprochen: Ein Teil der Zuschauer will danach mehr und
                testet <span className="text-white font-bold">Leader-OS 14 Tage kostenlos</span> —
                die Plattform, auf der genau diese Methodik als tägliches System läuft. Die meisten
                nehmen einfach die 4 Prinzipien mit und setzen sie um.
              </p>
              <p className="text-white font-bold">
                Beides ist für uns ein Gewinn. Und für dich ist es in jedem Fall einer.
              </p>
              <div className="pt-2">
                <MidCta unlocked={unlocked} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F5F5F5] text-black">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/50 mb-3">▸ SO FUNKTIONIERT'S</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12">In 3 Schritten zum ersten Video.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.nr} className="bg-white border-2 border-black/10 p-6">
                <div className="font-mono text-[26px] font-black text-brand-strong leading-none">{s.nr}</div>
                <h3 className="text-lg font-black tracking-tight mt-4">{s.title}</h3>
                <p className="text-[14px] text-black/60 mt-2 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORITY · verified numbers, no invented quotes */}
      <section className="bg-black text-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand mb-3">▸ DEIN TRAINER</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-[1.03]">
            Wlad Jachtchenko<span className="text-brand">.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.6] text-white/75">
            Europas führender Argumentations-Coach. Seit 2007 trainiert er Führungskräfte aus
            DAX-Konzernen, Mittelstand und Startups — in Boardroom-Rhetorik, Verhandlung und
            inzwischen KI-nativer Führung. In dieser Serie bringt er beides zusammen:
            15 Jahre Führungs-Methodik, übersetzt ins KI-Zeitalter.
          </p>

          {/* Verified credential grid */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border-2 border-white/10">
            {[
              ['12', 'BÜCHER · 3× SPIEGEL-BESTSELLER'],
              ['420K+', 'KLIENTEN WELTWEIT SEIT 2007'],
              ['3×', 'TEDX-SPEAKER'],
              ['250K+', 'TEILNEHMER · LINKEDIN LEARNING'],
            ].map(([big, small]) => (
              <div key={small} className="bg-black p-6">
                <div className="font-mono text-[26px] md:text-[32px] font-black text-brand tabular-nums leading-none">{big}</div>
                <div className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/45 mt-2 leading-relaxed">{small}</div>
              </div>
            ))}
          </div>

          {/* Bestseller titles · concrete, checkable */}
          <p className="mt-8 max-w-2xl text-[13.5px] leading-[1.6] text-white/55">
            Seine SPIEGEL-Bestseller — <span className="text-white/80 font-bold">„Weiße Rhetorik"</span>,{' '}
            <span className="text-white/80 font-bold">„Dunkle Rhetorik"</span> und{' '}
            <span className="text-white/80 font-bold">„Die 5 Rollen einer Führungskraft"</span> — haben
            über 250.000 Käufer. Die Argumentorik-Akademie hält 4.9 von 5 Sternen auf Trustpilot.
          </p>

          {/* Client namestrip · typographic wordmarks, per DESIGN.md no logo-soup */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/40 mb-5">
              ▸ FÜHRUNGSKRÄFTE TRAINIERT BEI
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {CLIENT_NAMES.map((name) => (
                <span key={name} className="font-mono text-[12px] md:text-[13px] font-bold tracking-[0.18em] text-white/50">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUALIFIER · self-selection raises intent */}
      <section className="bg-white text-black">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/50 mb-3">▸ EHRLICHE EINORDNUNG</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12 max-w-3xl">
            Für wen die Serie gebaut ist — und für wen nicht<span className="text-brand-strong">.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="border-2 border-black p-7">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-strong mb-5">▸ FÜR DICH, WENN</div>
              <ul className="space-y-3.5">
                {FOR_YOU.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[14.5px] leading-[1.5] text-black/80">
                    <span className="mt-[3px] shrink-0 w-4 h-4 bg-black text-brand flex items-center justify-center">
                      <Check size={10} strokeWidth={4} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-black/15 p-7">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-5">▸ NICHT FÜR DICH, WENN</div>
              <ul className="space-y-3.5">
                {NOT_FOR_YOU.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[14.5px] leading-[1.5] text-black/55">
                    <span className="mt-[3px] shrink-0 w-4 h-4 border-2 border-black/25 text-black/40 flex items-center justify-center">
                      <X size={10} strokeWidth={3.5} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-6 pt-5 border-t border-black/10 text-[13px] leading-[1.55] text-black/50">
                Das ist keine Pose — es spart uns beiden Zeit. Wenn du dich links wiederfindest,
                sind die nächsten 4 Tage gut investiert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ · objection handling */}
      <section className="bg-white text-black border-t-2 border-black/[0.06]">
        <div className="max-w-[820px] mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/50 mb-3">▸ HÄUFIGE FRAGEN</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">Kurz &amp; ehrlich.</h2>
          <div className="divide-y-2 divide-black/10 border-y-2 border-black/10">
            {FAQ.map(([q, a]) => (
              <div key={q} className="py-6">
                <h3 className="text-[17px] font-black tracking-tight">{q}</h3>
                <p className="text-[14.5px] text-black/60 mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA · stack recap + ask */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <h2
            className="text-[40px] sm:text-[60px] md:text-[76px] leading-[0.9] tracking-[-0.04em] max-w-3xl"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Starte jetzt<span className="text-brand not-italic">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.55] text-white/75">
            Trag deine E-Mail ein und schau in 30 Sekunden das erste Video. Zur Erinnerung, was
            auf dich wartet:
          </p>

          {/* Stack recap */}
          <ul className="mt-7 max-w-xl space-y-2.5">
            {STACK_RECAP.map((line) => (
              <li key={line} className="flex items-start gap-3 text-[14.5px] leading-[1.5] text-white/80">
                <span className="mt-[3px] shrink-0 w-4 h-4 bg-brand text-[#0A0A0A] flex items-center justify-center">
                  <Check size={11} strokeWidth={3.5} />
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-9">
            {unlocked ? (
              <a
                href="#videos"
                className="inline-flex items-center gap-3 px-7 h-14 bg-brand text-[#0A0A0A] border-2 border-brand text-[12.5px] font-black uppercase tracking-[0.08em] hover:brightness-105 transition-all"
              >
                <PlayCircle size={20} /> Zu deinen Videos
              </a>
            ) : (
              <OptInForm source="free-video-lp-final" onUnlock={onUnlock} cta="Jetzt gratis starten" />
            )}
          </div>
          <div className="mt-12 pt-6 border-t border-white/10">
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-white/60 hover:text-white transition-colors group"
              data-testid="lp-trial-upsell"
            >
              Danach: Leader-OS 14 Tage kostenlos testen
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Slim footer with legal (German landing requirement) */}
      <footer className="bg-black text-white/50">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em]">
            ▸ LEADER · OS · {new Date().getFullYear()} · WLAD JACHTCHENKO
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.12em]">
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/agb" className="hover:text-white transition-colors">AGB</Link>
            <Link to="/widerruf" className="hover:text-white transition-colors">Widerruf</Link>
          </nav>
        </div>
      </footer>

      {/* Sticky mobile CTA · appears after hero scrolls out, hidden once opted in.
          lg:hidden — desktop always has a form in view, the bar would be noise. */}
      {showSticky && !unlocked && (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-black border-t-2 border-brand px-4 py-3 flex items-center gap-3" data-testid="lp-sticky-cta">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] text-brand">▸ 4 VIDEOS · 0 €</div>
            <div className="text-[12px] font-bold text-white truncate">Sofort-Zugang · keine Karte</div>
          </div>
          <a
            href="#optin-hero"
            className="shrink-0 inline-flex items-center gap-2 px-5 h-11 bg-brand text-[#0A0A0A] text-[11px] font-black uppercase tracking-[0.06em]"
          >
            Freischalten <ArrowRight size={14} />
          </a>
          <button
            type="button"
            aria-label="Leiste schließen"
            onClick={() => { stickyDismissed.current = true; setShowSticky(false); }}
            className="shrink-0 w-9 h-9 flex items-center justify-center text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
