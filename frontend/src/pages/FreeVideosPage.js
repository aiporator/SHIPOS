import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Lock } from 'lucide-react';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import { DottedGlowBackground } from '../components/shared/DottedGlowBackground';
import { applyPageMeta } from '../lib/pageMeta';
import { useTheme } from '../contexts/ThemeContext';
import { isValidEmail } from '../features/newsletter/lib/newsletterClient';
import { captureFreeVideoLead } from '../lib/leadCapture';
import { setFreeVideoOptIn } from '../data/freeVideos';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';
import { FREE_VIDEOS, embedSrc } from '../data/freeVideos';

/**
 * FreeVideosPage · /gratis · the free-video lead-magnet funnel.
 *
 * Direct-response DNA (Hormozi value-stack · Sabri Suby "godfather offer" ·
 * Brunson soap-opera drip): a big value promise, a single email opt-in, then
 * the 4 videos UNLOCK inline (instant gratification) while the visitor is
 * also enrolled into the daily email series (campaign 'free-video-series' —
 * one video per day). One goal on the page: get the email.
 *
 * Unlock is remembered in localStorage so returning visitors keep access.
 * Always-dark VSL canvas (forces the dark theme on mount, restores on leave).
 */

const UNLOCK_KEY = 'lo_free_videos_unlocked';

const BENEFITS = [
  'Die 5 Rollen einer Führungskraft · sofort anwendbar',
  'Natürliche Autorität ohne Druck oder Manipulation',
  'Weniger arbeiten, mehr bewirken · dein Team zieht mit',
  'Dein 30-Tage-Fahrplan zur KI-nativen Führungskraft',
];

// „Bekannt aus" · real press/TV (same set as the Wlad page).
const MEDIA = ['DER SPIEGEL', 'BUSINESS INSIDER', 'SÜDDEUTSCHE ZEITUNG', 'RTL', 'ARD', 'PROSIEBEN', 'TEDX'];

// Real, verifiable proof — no invented testimonials or prices.
const PROOF = [
  ['400 000+', 'trainierte Führungskräfte'],
  ['3×', 'SPIEGEL-Bestseller'],
  ['4,9 / 5', 'Trustpilot · 388 Bewertungen'],
  ['14 Mio', 'Views auf Podcast & YouTube'],
];

const STEPS = [
  ['01', 'E-Mail eintragen', 'Ein Feld, ein Klick — keine Kreditkarte, kein Konto nötig.'],
  ['02', 'Sofort freischalten', 'Alle 4 Videos öffnen sich direkt hier auf der Seite.'],
  ['03', 'Täglich 1 Video', 'Ab morgen bekommst du jeden Tag eins ins Postfach — dranbleiben zahlt sich aus.'],
];

const FAQ = [
  ['Kostet das wirklich nichts?', 'Ja, komplett kostenlos. Keine Kreditkarte, kein Abo, keine versteckten Kosten. Wlad wird sonst für 10.000 € Tagessatz gebucht — diese 4 Videos sind ein echtes Geschenk, damit du siehst, wie er arbeitet.'],
  ['Für wen sind die Videos?', 'Für alle, die fachlich stark sind, aber als Führungspersönlichkeit endlich gesehen werden wollen — Teamleads, Projektmanager, Senior-Experten und alle, die es werden wollen. Auch für introvertierte, authentische Menschen, die ohne Manipulation führen.'],
  ['Bekomme ich jetzt Spam?', 'Nein. Du bekommst die 4 Videos plus gelegentlich echte Impulse. Ein Klick, und du bist wieder raus — jederzeit, in jeder Mail.'],
  ['Was passiert nach den 4 Videos?', 'Du kennst dann das Fundament von Wlads Methodik. Wenn du sie täglich mit WladBot drillen willst, kannst du Leader-OS 14 Tage kostenlos testen — musst du aber nicht.'],
];

const track = (event, props = {}) => {
  if (typeof window !== 'undefined' && window.posthog?.capture) {
    try { window.posthog.capture(event, { surface: 'leader-os', funnel: 'free-videos', ...props }); } catch {}
  }
};

const readUnlocked = () => {
  try { return localStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; }
};

const VideoTile = ({ video, unlocked, onUnlockClick }) => {
  const [playing, setPlaying] = useState(false);
  const src = embedSrc(video);
  const canPlay = unlocked && src;

  return (
    <article className="relative border-2 border-white/12 bg-white/[0.02] overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-black overflow-hidden">
        {canPlay && playing ? (
          <iframe
            title={video.title}
            src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1`}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={unlocked ? (src ? () => { setPlaying(true); track('free_video_play', { day: video.day }); } : undefined) : onUnlockClick}
            className="group absolute inset-0 h-full w-full"
            aria-label={unlocked ? (src ? `Video ${video.day} abspielen` : 'Video folgt in Kürze') : 'Videos freischalten'}
          >
            {/* Branded poster thumbnail */}
            <img
              src={video.thumb}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${canPlay ? 'group-hover:scale-[1.03]' : ''}`}
            />
            {/* Locked / not-yet-available overlays · unlocked+playable shows the clean poster */}
            {!unlocked && (
              <>
                <span aria-hidden className="absolute inset-0 bg-[#0A0A0A]/60" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white border-2 border-white/40 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Lock size={22} />
                </span>
                <span className="absolute bottom-4 left-4 right-4 text-center font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/90">
                  Mit E-Mail freischalten
                </span>
              </>
            )}
            {unlocked && !src && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-[#BFFF00] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">
                Bald verfügbar
              </span>
            )}
          </button>
        )}
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3
          className="text-[18px] md:text-[20px] leading-[1.15] tracking-[-0.02em] text-white"
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          {video.title}
        </h3>
        <p className="mt-2.5 text-[13.5px] leading-[1.55] text-white/60 flex-1">{video.hook}</p>
      </div>
    </article>
  );
};

const OptInForm = ({ onUnlocked, idSuffix = '' }) => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const valid = isValidEmail(email);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || state === 'loading') return;
    setState('loading');
    track('free_videos_optin_submit');
    // Optimistic unlock · give the value immediately, enrol into the drip in
    // the background (double-opt-in email still goes out for the daily series).
    try { localStorage.setItem(UNLOCK_KEY, '1'); } catch { /* ignore */ }
    onUnlocked();
    // Durable capture: Mongo lead store + attribution + instant Video-1 email
    // + Day 2-4 drip (backend/routes/free_videos.py) — not just a newsletter tag.
    const res = await captureFreeVideoLead({ email, source: 'free-video-funnel' });
    setState(res.ok ? 'done' : 'error');
    track('free_videos_optin_result', { ok: res.ok });
  };

  return (
    <form onSubmit={submit} noValidate data-testid={`free-optin${idSuffix}`} className="w-full">
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
          {state === 'loading' ? 'Wird freigeschaltet…' : 'Jetzt 4 Videos gratis'}
          {state !== 'loading' && <ArrowUpRight size={16} />}
        </button>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
        100 % kostenlos · sofort freigeschaltet · 1 Video pro Tag per Mail · jederzeit abbestellbar
      </p>
    </form>
  );
};

export default function FreeVideosPage() {
  useTheme();
  const [unlocked, setUnlocked] = useState(false);
  const videosRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');
    // ?unlock=1 lets drip emails deep-link straight into the unlocked state
    // (the lead already opted in — don't make them re-enter their email).
    const fromEmail = new URLSearchParams(window.location.search).get('unlock') === '1';
    if (fromEmail) setFreeVideoOptIn('1');
    setUnlocked(fromEmail || readUnlocked());
    track('free_videos_view');

    const restoreMeta = applyPageMeta({
      title: 'Führung beginnt hier · 4 kostenlose Videos · Wlad Jachtchenko',
      description:
        'Führung beginnt hier: 4 kostenlose Videos von Europas führendem Leadership-Coach Wlad ' +
        'Jachtchenko · natürliche Autorität, weniger arbeiten, mehr bewirken. Ein Video pro Tag, direkt in dein Postfach.',
      url: 'https://leader-os.de/fuehrung-beginnt-hier',
      image: 'https://leader-os.de/og-wlad.jpg',
    });
    return () => { restoreMeta(); if (!wasDark) root.classList.remove('dark'); };
  }, []);

  const unlock = () => {
    setUnlocked(true);
    requestAnimationFrame(() => videosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const scrollToOptIn = () => {
    document.getElementById('optin')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const stats = useMemo(() => [['400K+', 'Kunden'], ['3×', 'SPIEGEL'], ['14 Mio', 'Views'], ['4', 'Gratis-Videos']], []);

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="free-videos-page">
      <LandingNav />

      <main id="main-content">
        {/* Hero · the opt-in */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <DottedGlowBackground gap={16} radius={1.8} color="rgba(255,255,255,0.18)" glowColor="rgba(191,255,0,0.6)" opacity={0.5} />
          </div>
          <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-14 md:pt-20 pb-16 md:pb-20">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-6">
              ▸ Führung beginnt hier · 4 Videos · kostenlos
            </p>
            <h1
              className="text-[40px] sm:text-[64px] md:text-[88px] leading-[0.92] tracking-[-0.04em] text-foreground max-w-4xl"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Führung beginnt<br />hier<span className="text-brand not-italic">.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] sm:text-[19px] leading-[1.55] text-foreground/70">
              Kostenlos von <span className="text-foreground font-semibold">Wlad Jachtchenko</span> · Europas führendem
              Leadership-Coach (3× SPIEGEL-Bestseller). Trag deine E-Mail ein, schalte alle 4 Videos sofort frei — und
              bekomm danach jeden Tag eins direkt in dein Postfach.
            </p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14.5px] leading-[1.4] text-foreground/85">
                  <span className="mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center bg-[#BFFF00] text-[#0A0A0A]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div id="optin" className="mt-10 max-w-2xl scroll-mt-24">
              <OptInForm onUnlocked={unlock} idSuffix="-hero" />
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
              {stats.map(([big, cap]) => (
                <div key={cap}>
                  <div className="text-[22px] md:text-[26px] leading-none text-foreground tabular-nums" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>{big}</div>
                  <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/45">{cap}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bekannt aus · press credibility bar */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[1180px] mx-auto px-5 md:px-10 py-6 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8">
            <p className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand">▸ Bekannt aus</p>
            <ul className="flex flex-wrap items-center gap-x-6 md:gap-x-8 gap-y-2.5">
              {MEDIA.map((m) => (
                <li key={m} className="font-mono text-[11.5px] md:text-[12.5px] font-bold uppercase tracking-[0.13em] text-foreground/60">{m}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* So funktioniert's · 3 steps (removes friction before the gate) */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[1180px] mx-auto px-5 md:px-10 py-16 md:py-20">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-8">▸ So einfach geht's</p>
            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {STEPS.map(([n, t, d]) => (
                <div key={n} className="border-2 border-foreground/15 p-6 md:p-7">
                  <div className="text-[34px] leading-none text-brand tabular-nums" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>{n}</div>
                  <h3 className="mt-4 text-[18px] md:text-[20px] leading-[1.15] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>{t}<span className="text-brand not-italic">.</span></h3>
                  <p className="mt-2.5 text-[14px] leading-[1.55] text-foreground/65">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The 4 videos · locked → unlocked */}
        <section ref={videosRef} id="videos" className="border-t-2 border-foreground/12 scroll-mt-20">
          <div className="max-w-[1180px] mx-auto px-5 md:px-10 py-16 md:py-24">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10 md:mb-12">
              <div>
                <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-4">
                  ▸ Deine 4 Videos
                </p>
                <h2 className="text-[28px] sm:text-[40px] md:text-[52px] leading-[1.0] tracking-[-0.03em] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                  {unlocked ? 'Freigeschaltet · viel Erfolg' : 'Ein Klick · alle vier offen'}<span className="text-brand not-italic">.</span>
                </h2>
              </div>
              {unlocked && (
                <div className="inline-flex items-center gap-2 border-2 border-brand/50 bg-brand/[0.06] px-4 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brand">
                  <Check size={14} strokeWidth={3} /> Zugang aktiv
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
              {FREE_VIDEOS.map((v) => (
                <VideoTile key={v.day} video={v} unlocked={unlocked} onUnlockClick={scrollToOptIn} />
              ))}
            </div>

            {!unlocked && (
              <div className="mt-10 text-center">
                <button
                  onClick={scrollToOptIn}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#BFFF00] hover:bg-white text-[#0A0A0A] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors"
                >
                  Alle 4 Videos freischalten <ArrowUpRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Authority · Wlad */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[1180px] mx-auto px-5 md:px-10 py-16 md:py-20 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-3">
              <div className="relative aspect-square w-full max-w-[220px] mx-auto md:mx-0 rounded-full overflow-hidden border-2 border-foreground/30">
                <img src={WLAD_AVATAR} onError={withFallback(WLAD_AVATAR_FALLBACKS)} alt="Wlad Jachtchenko" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-[50%_20%]" />
              </div>
            </div>
            <div className="md:col-span-9">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-4">▸ Von wem</p>
              <h2 className="text-[24px] sm:text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
                Wlad Jachtchenko<span className="text-brand not-italic">.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-foreground/72 max-w-2xl">
                3× SPIEGEL-Bestseller-Autor, Europas führender Leadership-Coach. Von Allianz, BMW, ProSieben & Co.
                für 10.000 € Tagessatz gebucht, über 10.000 Manager ausgebildet. In diesen 4 Videos bekommst du das
                Fundament seiner Methodik — kostenlos.
              </p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
                {PROOF.map(([big, cap]) => (
                  <div key={cap} className="border-t-2 border-foreground/20 pt-3">
                    <div className="text-[22px] md:text-[26px] leading-none text-foreground tabular-nums" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>{big}</div>
                    <div className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-foreground/50 leading-[1.4]">{cap}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ · objection handling */}
        <section className="border-t-2 border-foreground/12">
          <div className="max-w-[860px] mx-auto px-5 md:px-10 py-16 md:py-24">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-4">▸ Kurz geklärt</p>
            <h2 className="text-[26px] sm:text-[36px] md:text-[44px] leading-[1.02] tracking-[-0.03em] text-foreground mb-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
              Bevor du startest<span className="text-brand not-italic">.</span>
            </h2>
            <dl className="border-t-2 border-foreground/15">
              {FAQ.map(([q, a]) => (
                <div key={q} className="py-5 border-b border-foreground/15">
                  <dt className="text-[16px] md:text-[18px] leading-[1.3] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{q}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.6] text-foreground/68">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative isolate overflow-hidden border-t-2 border-foreground/12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <DottedGlowBackground gap={16} radius={1.8} color="rgba(255,255,255,0.2)" glowColor="rgba(191,255,0,0.65)" opacity={0.55} />
          </div>
          <div className="max-w-[820px] mx-auto px-5 md:px-10 py-20 md:py-24 text-center">
            <h2 className="text-[30px] sm:text-[44px] md:text-[56px] leading-[1.0] tracking-[-0.035em] text-foreground" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}>
              {unlocked ? 'Bereit für den nächsten Schritt?' : 'Deine ersten 4 Videos warten.'}<span className="text-brand not-italic">.</span>
            </h2>
            {unlocked ? (
              <>
                <p className="mt-5 text-[15px] sm:text-[17px] leading-[1.55] text-foreground/70 max-w-xl mx-auto">
                  Willst du die komplette Methodik täglich mit WladBot drillen? Teste Leader-OS 14 Tage kostenlos.
                </p>
                <a
                  href="https://leaderos.de/signup?trial=14"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#BFFF00] hover:bg-white text-[#0A0A0A] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors"
                >
                  Leader-OS 14 Tage kostenlos <ArrowUpRight size={16} />
                </a>
              </>
            ) : (
              <div className="mt-8 max-w-xl mx-auto text-left">
                <OptInForm onUnlocked={unlock} idSuffix="-final" />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA · persistent opt-in until unlocked */}
      {!unlocked && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur border-t-2 border-brand/40 px-4 py-3">
          <button
            onClick={scrollToOptIn}
            className="w-full inline-flex items-center justify-center gap-2 h-12 bg-[#BFFF00] text-[#0A0A0A] font-bold text-[12.5px] uppercase tracking-[0.14em]"
          >
            4 Videos gratis freischalten <ArrowUpRight size={15} />
          </button>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}
