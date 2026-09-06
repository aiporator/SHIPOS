import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WladMark } from '../brand/WladMark';

/**
 * CinematicHero · der Hero der Webinar-Seite (/webinar).
 *
 * Nach Vorlage: zwei App-Screens in realistischen iPhone-Rahmen (370×790,
 * Radius 48, Dynamic Island, Home-Indicator, Statusleiste) nebeneinander
 * auf einem kinematischen Farbverlauf, Auto-Scaling auf den Viewport,
 * gestaffelte zeRise/zeFadeUp/zeBloom-Choreografie. Alle Maße, Farben,
 * Filter, Blur-Schichten und Delays sind 1:1 übernommen.
 *
 * Die eine bewusste Abweichung, und sie ist der Grund, warum diese Seite
 * auf dem Handy Leads bringt: **unter 900 px gibt es keine Rahmen.** Zwei
 * 370-px-Geräte samt 70-px-Lücke sind 810 px breit; auf einem 390-px-
 * Display würde die Bühne auf 0,43 skaliert — aus 13,5-px-Fließtext werden
 * 6 px, aus dem CTA ein Fingernagel. Ein Handy im Handy ist auf dem Handy
 * kein Design, sondern ein Hindernis. Deshalb lösen sich beide Screens
 * mobil in native, volle Panels auf, und der Formular-Slot rückt zwischen
 * Screen 1 und Screen 2 — eine Wischbewegung vom Hook zum Formular.
 *
 * Inhalte statt Platzhalter: kein „Bali Exclusive", kein „Zenith Escapes".
 * Logo ist die WladMark, jede Zahl aus docs/gtm/WLAD_CANON.md.
 *
 * Videos liegen auf demselben CloudFront-Konto wie die übrigen Assets;
 * bei Ladefehler fällt jede Fläche auf das Wlad-Porträt zurück, damit der
 * Hero nie leer wirkt. Animationen respektieren prefers-reduced-motion
 * über die .ze-Regel in index.css.
 *
 * Kein Tailwind in dieser Datei — die Vorlage ist inline-styled, und so
 * bleiben ihre Werte nachprüfbar. Keine neue Abhängigkeit.
 */

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const HELV = 'Helvetica, "Helvetica Neue", Arial, sans-serif';
const ANTON = "'Anton', Impact, sans-serif";
const SYS = '-apple-system, "SF Pro", system-ui, sans-serif';

const V_OFFER = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260707_004919_5e1b7e08-d723-4ecb-8afe-d613d730984c.mp4';
const V_DETAIL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260707_004833_4cc93fa3-27f5-4cec-b1b2-0b4fb073c13a.mp4';
const POSTER = '/wlad/wlad-portrait.jpg';

const BG =
  'radial-gradient(120% 90% at 18% 8%, #FBEFDD 0%, #F3D9BE 22%, #E1A98C 42%, #9C6E8F 62%, #4B4470 80%, #23274A 100%)';

const DEVICE_W = 370;
const DEVICE_H = 790;
const STAGE_GAP = 70;
const STAGE_W = DEVICE_W * 2 + STAGE_GAP;

/** Inline-Kurzschreibweise für die Vorlage-Keyframes (Name, Dauer, Delay). */
const ze = (name, dur, delay) => ({ animation: `${name} ${dur}s ${EASE} ${delay}s both` });

const useMedia = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

/** <video> mit Porträt-Fallback: Ladefehler → Bild, nie eine leere Fläche. */
const SafeVideo = ({ src, style, filterId, ariaHidden = false }) => {
  const [failed, setFailed] = useState(false);
  const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
  if (failed) {
    return <img src={POSTER} alt="" aria-hidden style={{ ...base, ...style, filter: undefined }} />;
  }
  return (
    <video
      src={src}
      poster={POSTER}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden={ariaHidden || undefined}
      onError={() => setFailed(true)}
      style={{ ...base, ...style, ...(filterId ? { filter: `url(#${filterId})` } : {}) }}
    />
  );
};

/* ── iOS-Rahmen ───────────────────────────────────────────────────────── */

const IOSStatusBar = ({ dark }) => {
  const c = dark ? '#fff' : '#000';
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '15px 30px 0 32px', color: c, fontFamily: SYS, fontWeight: 590, fontSize: 17,
      }}
    >
      <span>11:11</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}>
          <rect x="0" y="8" width="3" height="4" rx=".8" opacity=".45" />
          <rect x="5" y="5.5" width="3" height="6.5" rx=".8" opacity=".7" />
          <rect x="10" y="3" width="3" height="9" rx=".8" />
          <rect x="15" y="0" width="3" height="12" rx=".8" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 4.2a10 10 0 0 1 14 0" /><path d="M3.6 6.9a6.4 6.4 0 0 1 8.8 0" /><path d="M6.2 9.6a2.8 2.8 0 0 1 3.6 0" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x=".6" y=".6" width="22.8" height="11.8" rx="3.4" stroke={c} strokeOpacity=".4" strokeWidth="1.2" />
          <rect x="2.4" y="2.4" width="19.2" height="8.2" rx="1.8" fill={c} />
          <rect x="24.6" y="4.4" width="2" height="4.2" rx="1" fill={c} opacity=".4" />
        </svg>
      </span>
    </div>
  );
};

const IOSDevice = ({ dark = false, children }) => (
  <div
    style={{
      position: 'relative', width: DEVICE_W, height: DEVICE_H, borderRadius: 48, overflow: 'hidden',
      background: dark ? '#000' : '#F2F2F7', flexShrink: 0,
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
    }}
  >
    <div
      aria-hidden
      style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
        width: 126, height: 37, borderRadius: 24, background: '#000',
      }}
    />
    <IOSStatusBar dark={dark} />
    {children}
    <div
      aria-hidden
      style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
        width: 139, height: 5, borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
      }}
    />
  </div>
);

/* ── Screen 1 · Teaser (hell) ─────────────────────────────────────────── */

const HEADLINE = ['Führe', 'besser.', 'Jeden Tag.'];

const OfferScreen = ({ framed, onCta }) => (
  <div
    style={{
      display: 'flex', flexDirection: 'column', background: '#f4f4f4',
      height: framed ? '100%' : undefined, minHeight: framed ? undefined : '100svh',
      padding: framed ? '66px 14px 14px' : '36px 14px 20px',
    }}
  >
    <h1
      style={{
        margin: 0, textAlign: 'center', textTransform: 'uppercase', color: '#2c2c2c',
        fontFamily: ANTON, fontWeight: 900, letterSpacing: 0.5, lineHeight: 0.94,
        fontSize: framed ? 69 : 'clamp(52px, 16vw, 69px)',
      }}
    >
      {HEADLINE.map((line, i) => (
        <span key={line} style={{ display: 'block', overflow: 'clip', overflowClipMargin: '0.14em' }}>
          <span className="ze" style={{ display: 'block', ...ze('zeRise', 0.9, 0.10 + i * 0.12) }}>
            {line}
          </span>
        </span>
      ))}
    </h1>

    <div
      className="ze"
      style={{
        position: 'relative', flex: 1, borderRadius: 26, overflow: 'hidden', margin: '14px 8px 0',
        minHeight: framed ? 0 : 420, background: '#2b3a2a',
        ...ze('zeCardReveal', 1.1, 0.45),
      }}
    >
      <SafeVideo src={V_OFFER} style={{ filter: 'saturate(0.84) contrast(1.05)' }} />
      <SafeVideo
        src={V_OFFER}
        ariaHidden
        style={{
          filter: 'blur(16px) saturate(1.15)', transform: 'scale(1.08)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, transparent 48%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.85) 78%, #000 92%)',
          maskImage: 'linear-gradient(180deg, transparent 0%, transparent 48%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.85) 78%, #000 92%)',
        }}
      />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(122,107,82,0.21)' }} />
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(40,70,35,0) 0%, rgba(40,70,35,0) 42%, rgba(45,80,40,0.18) 60%, rgba(35,65,32,0.4) 78%, rgba(28,52,26,0.55) 100%)',
        }}
      />
      <div className="ze" style={{ position: 'absolute', top: 20, left: 20, ...ze('zeBloom', 0.9, 1.05) }}>
        <WladMark size={22} />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p
          className="ze"
          style={{
            margin: 0, color: '#fff', fontFamily: HELV, fontSize: 34, fontWeight: 500, lineHeight: 1.12,
            letterSpacing: -0.2, whiteSpace: 'pre-line', ...ze('zeFadeUp', 0.85, 0.80),
          }}
        >
          {'Live-Webinar mit\nWlad Jachtchenko'}
        </p>
        <p
          className="ze"
          style={{
            margin: 0, color: 'rgba(255,255,255,0.88)', fontFamily: HELV, fontSize: 13.5, lineHeight: 1.45,
            maxWidth: 250, ...ze('zeFadeUp', 0.85, 0.92),
          }}
        >
          90 Minuten, ein echter Live-Case, deine Fragen. Kostenlos und ohne Aufzeichnung.
        </p>
        <button
          type="button"
          onClick={onCta}
          className="ze"
          data-testid="webinar-hero-cta"
          style={{
            alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            border: 0, borderRadius: 999, padding: '7px 7px 7px 14px',
            background: 'linear-gradient(90deg, #FAD5D7 0%, #FAD5D7 38%, #FFFFFF 50%, #9CE2F9 62%, #9CE2F9 100%)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)', ...ze('zePillPop', 0.75, 1.10),
          }}
        >
          <span style={{ fontFamily: HELV, fontSize: 10, fontWeight: 750, letterSpacing: 0.6, color: '#1a1a2e' }}>
            PLATZ SICHERN
          </span>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: 'rgba(26,26,46,0.08)', display: 'grid', placeItems: 'center' }}>
            <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
);

/* ── Screen 2 · Detail (dunkel) ───────────────────────────────────────── */

const BLUR_LAYERS = [
  [1, 480, 545], [1.5, 440, 505], [3, 390, 455], [5, 320, 395], [7, 240, 325], [9, 130, 235],
];

const Stat = ({ label, value, delay, style }) => (
  <div className="ze" style={{ ...ze('zeFadeUp', 0.8, delay), ...style }}>
    <div style={{ fontFamily: HELV, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{label}</div>
    <div style={{ fontFamily: ANTON, fontSize: 33, color: '#fff', lineHeight: 1.05, marginTop: 2, whiteSpace: 'nowrap' }}>{value}</div>
  </div>
);

const DetailScreen = ({ framed }) => (
  <div
    style={{
      position: 'relative', overflow: 'hidden', background: '#000',
      height: framed ? '100%' : undefined, minHeight: framed ? undefined : '100svh',
    }}
  >
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <filter id="ze-grade" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.6666 -0.0742 0.0785 0 0.1499 -0.0627 0.7320 0.0649 0 0.0943 -0.0701 0.1109 0.7276 0 0.0471 0 0 0 1 0"
        />
      </filter>
    </svg>

    <SafeVideo src={V_DETAIL} filterId="ze-grade" style={{ transform: 'translate(0%, -4%) scale(1.07)' }} />

    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(to bottom, rgba(8,12,16,0.30), transparent)' }} />

    {/* Mobil nur jede zweite Schicht: sechs Vollbild-backdrop-filter über
        Video ruckeln auf Mittelklasse-Android. Die Progression bleibt
        erhalten (1.5 → 5 → 9 px), der Look ist praktisch identisch. */}
    {(framed ? BLUR_LAYERS : BLUR_LAYERS.filter((_, i) => i % 2 === 1)).map(([blur, r0, r1]) => (
      <div
        key={blur}
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
          WebkitMaskImage: `radial-gradient(circle at 55% 115%, black ${r0}px, transparent ${r1}px)`,
          maskImage: `radial-gradient(circle at 55% 115%, black ${r0}px, transparent ${r1}px)`,
        }}
      />
    ))}

    <div
      aria-hidden
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'linear-gradient(to top, rgba(110,160,195,0.30) 0%, rgba(110,160,195,0.19) 7%, rgba(112,160,192,0.07) 16%, transparent 34%), ' +
          'linear-gradient(285deg, rgba(240,225,205,0.18) 0%, rgba(240,225,205,0.09) 24%, transparent 48%), ' +
          'radial-gradient(ellipse 60% 30% at 0% 76%, rgba(5,25,75,0.20), transparent 70%)',
      }}
    />

    <div
      style={{
        position: framed ? 'absolute' : 'relative', inset: framed ? 0 : undefined,
        minHeight: framed ? undefined : '100svh',
        display: 'flex', flexDirection: 'column', padding: framed ? '64px 24px 48px' : '40px 24px 44px',
      }}
    >
      {framed && (
        <div className="ze" aria-hidden style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...ze('zeFadeDown', 0.7, 0.25) }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <i style={{ display: 'block', width: 18, height: 2, background: '#fff' }} />
            <i style={{ display: 'block', width: 18, height: 2, background: '#fff' }} />
          </span>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: framed ? 46 : 8 }}>
        <h2
          style={{
            margin: 0, color: '#fff', textTransform: 'uppercase', fontFamily: ANTON, fontWeight: 900,
            fontSize: framed ? 52 : 'clamp(44px, 13.5vw, 52px)', lineHeight: 1.0, letterSpacing: 0.5,
            textShadow: '0 2px 18px rgba(0,0,0,0.35)',
          }}
        >
          {['Führe besser.', 'Jeden Tag.'].map((line, i) => (
            <span key={line} style={{ display: 'block', overflow: 'clip', overflowClipMargin: '0.14em' }}>
              <span className="ze" style={{ display: 'block', ...ze('zeRise', 0.95, 0.35 + i * 0.13) }}>{line}</span>
            </span>
          ))}
        </h2>
        <p className="ze" style={{ margin: '10px 0 0', ...ze('zeFadeUp', 0.8, 0.70) }}>
          <span style={{ fontFamily: HELV, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>mit </span>
          <span style={{ fontFamily: ANTON, fontSize: 22, fontWeight: 900, letterSpacing: 1, color: '#fff' }}>WLAD JACHTCHENKO</span>
        </p>
      </div>

      <div className="ze" style={{ display: 'flex', justifyContent: 'center', paddingTop: 40, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))', ...ze('zeBloom', 1.0, 0.95) }}>
        <WladMark size={30} />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <Stat label="Live" value="90 MIN" delay={0.85} />
          <Stat label="Termin" value="17. SEPT" delay={0.98} style={{ marginLeft: 24 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <p
            className="ze"
            style={{
              margin: 0, fontFamily: HELV, fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.92)',
              maxWidth: 270, ...ze('zeFadeUp', 0.8, 1.12),
            }}
          >
            Der Charisma-Code, das Leadership-Betriebssystem und ein echter Live-Case — mit deinen Fragen im Q&amp;A.
            Kostenlos, live, keine Aufzeichnung.
          </p>
          <svg
            className="ze"
            aria-hidden
            width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginLeft: 22, flexShrink: 0, ...ze('zeArrowDrop', 0.7, 1.35) }}
          >
            <path d="M9 1v12M3 7l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

/* ── Bühne (Desktop) · zwei Geräte, Auto-Scaling, nie hochskaliert ────── */

const Stage = ({ onCta }) => {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => {
      const s = Math.min(1, (window.innerWidth - 40) / STAGE_W, (window.innerHeight - 40) / DEVICE_H);
      setScale(Math.max(0.6, s));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ height: DEVICE_H * scale, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: STAGE_W, height: DEVICE_H, display: 'flex', gap: STAGE_GAP, flexShrink: 0,
          transform: `scale(${scale})`, transformOrigin: 'top center',
        }}
      >
        <IOSDevice><OfferScreen framed onCta={onCta} /></IOSDevice>
        <IOSDevice dark><DetailScreen framed /></IOSDevice>
      </div>
    </div>
  );
};

const Orb = ({ style }) => (
  <div aria-hidden style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(10px)', ...style }} />
);

/* ── Export ────────────────────────────────────────────────────────────── */

export const CinematicHero = ({ onCta, formSlot }) => {
  const desktop = useMedia('(min-width: 900px)');
  const formPanel = (
    <div style={{ padding: desktop ? '40px 20px 56px' : '28px 16px 36px', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%', maxWidth: 720, background: '#fff', borderRadius: 24, padding: desktop ? '28px 32px 30px' : '22px 18px 24px',
          boxShadow: '0 30px 80px rgba(20,25,60,0.28), 0 0 0 1px rgba(255,255,255,0.35)',
        }}
      >
        {formSlot}
      </div>
    </div>
  );

  return (
    <section
      data-testid="webinar-cinematic-hero"
      style={{ position: 'relative', overflow: 'hidden', background: BG }}
    >
      <Orb style={{ width: 900, height: 900, top: -320, left: -220, background: 'radial-gradient(circle, rgba(255,225,180,0.55) 0%, rgba(255,225,180,0) 70%)' }} />
      <Orb style={{ width: 700, height: 700, bottom: -260, right: -180, background: 'radial-gradient(circle, rgba(60,90,150,0.45) 0%, rgba(60,90,150,0) 70%)' }} />

      <div style={{ position: 'relative' }}>
        {desktop ? (
          <>
            <div style={{ padding: '28px 20px 0' }}><Stage onCta={onCta} /></div>
            {formPanel}
          </>
        ) : (
          <>
            <OfferScreen framed={false} onCta={onCta} />
            {formPanel}
            <DetailScreen framed={false} />
          </>
        )}
      </div>
    </section>
  );
};

export default CinematicHero;
