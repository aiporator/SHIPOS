/**
 * FreeVideoSeriesLanding · /gratis-videos — standalone lead-gen squeeze page.
 *
 * A self-contained landing page for the free 4-part video series, built to run
 * as its own destination (paid traffic, link-in-bio, email blasts). Godmode
 * funnel DNA (Hormozi / Sabri Suby / Russell Brunson):
 *
 *   HOOK (hero + email)  →  instant opt-in reveals all 4 videos inline
 *   (no account required — max opt-in rate)  →  daily reminder + trial upsell.
 *
 * Leads are persisted server-side via /api/leader-check/intent (the same
 * incomplete_attempts pipeline the whole product dedups on via email_lower),
 * so every opt-in here is a real, tracked lead — even before registration.
 *
 * NOTE: this path is added to LANDING_ALLOWED_ROUTES so it renders on the
 * marketing host (leader-os.de) instead of being redirected to the app tier.
 *
 * Design: Athletic-Editorial DNA (DESIGN.md) — black canvas, lime accent,
 * mono BIB-codes, massive Outfit-Black italic display, sharp corners.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlayCircle, Lock, Check, ArrowRight } from 'lucide-react';
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

const PROOF = [
  ['400K+', 'KLIENTEN'],
  ['3×', 'SPIEGEL-BESTSELLER'],
  ['20', 'LÄNDER'],
  ['4', 'GRATIS-VIDEOS'],
];

const STEPS = [
  { nr: '01', title: 'E-Mail eintragen', body: 'Einmal registrieren — kostenlos, keine Karte, kein Abo.' },
  { nr: '02', title: 'Sofort alle 4 Videos', body: 'Alle vier Videos sind direkt freigeschaltet. Schau sie in deinem Tempo.' },
  { nr: '03', title: 'Täglich ein Impuls', body: 'Wlad schickt dir jeden Tag ein Video — ein Prinzip pro Tag, direkt anwendbar.' },
];

const FAQ = [
  ['Was kostet die Video-Serie?', 'Nichts. Die 4 Videos sind komplett kostenlos — keine Kreditkarte, kein Abo, kein Kleingedrucktes.'],
  ['Muss ich etwas installieren?', 'Nein. Du gibst deine E-Mail ein und schaust die Videos direkt im Browser.'],
  ['Was passiert nach den 4 Videos?', 'Du kannst — wenn du willst — Leader-OS 14 Tage kostenlos testen: WladBot 24/7, 11 Frameworks und deinen persönlichen Lernpfad. Völlig freiwillig.'],
  ['Wer ist Wlad Jachtchenko?', 'Argumentations- und Rhetorik-Experte, 3× SPIEGEL-Bestseller-Autor, über 400.000 Teilnehmer in 20 Ländern.'],
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

  const onUnlock = () => {
    setUnlocked(true);
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

          <div className="mt-9">
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

          {/* Social proof */}
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

      {/* VALUE STACK */}
      <section className="bg-white text-black">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/50 mb-3">
            ▸ DAS BEKOMMST DU
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-[1.02]">
            4 Videos. 4 Prinzipien. <span className="text-black/40">0 €.</span>
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FREE_VIDEOS.map((video) => (
              <div key={video.id} className="border-2 border-black/12 p-5 hover:border-black transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/50">TAG {video.day}</span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">{video.tag}</span>
                </div>
                <div className="aspect-video w-full bg-black/[0.04] border border-black/10 flex items-center justify-center mb-4">
                  <PlayCircle size={28} className="text-black/25" />
                </div>
                <h3 className="text-[15px] font-black tracking-tight leading-tight">{video.title}</h3>
                <p className="text-[12.5px] text-black/55 mt-1.5 leading-snug">{video.blurb}</p>
              </div>
            ))}
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

      {/* AUTHORITY */}
      <section className="bg-black text-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand mb-3">▸ DEIN TRAINER</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-[1.03]">
            Wlad Jachtchenko<span className="text-brand">.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.6] text-white/75">
            3× SPIEGEL-Bestseller-Autor, Argumentations- und Rhetorik-Experte. Über 400.000
            Teilnehmer in 20 Ländern haben mit seiner Methodik gelernt, klarer zu führen und
            überzeugender zu kommunizieren. In dieser Serie bringt er sie mit KI zusammen.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white text-black">
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

      {/* FINAL CTA */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <h2
            className="text-[40px] sm:text-[60px] md:text-[76px] leading-[0.9] tracking-[-0.04em] max-w-3xl"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Starte jetzt<span className="text-brand not-italic">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.55] text-white/75">
            Trag deine E-Mail ein und schau in 30 Sekunden das erste Video. Kostenlos.
          </p>
          <div className="mt-8">
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
    </div>
  );
}
