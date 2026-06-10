import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandingFooter } from '../components/landing/LandingFooter';

/**
 * LeaderCheckLanding — die Diagnostic-First-Variante.
 *
 * Wird ausgeliefert wenn der Hostname leader-check.de ist (siehe
 * Router-Branch in LandingPage.js). Bewusst MAGER: ein einziger
 * Funnel-Zweck — kostenlose 5-Minuten-Diagnose starten — plus die
 * kritische Bridge-Message: "Nutze die gleiche Email wie auf
 * leader-os.de damit dein WladBot deinen Score kennt".
 *
 * Kein langer Pitch, keine Frameworks, keine Preise. Wer hier
 * landet soll genau eine Sache tun: die Diagnose starten. Alles
 * andere kommt nach der Diagnose über die Result-Page → Sprint-Sell.
 *
 * Design-System (siehe frontend/DESIGN.md, x.ai-inspired):
 *   - canvas: #0A0A0A
 *   - hairline: rgba(255,255,255,0.08)
 *   - display: Outfit 900 italic, lime-Punkt-Punktuation
 *   - eyebrow: mono uppercase tracked 0.28em
 */

const DIMENSIONS = [
  {
    code: '§01',
    name: 'KI-Readiness',
    body:
      'Wo stehst du in der Nutzung von KI als Führungskraft — vom ' +
      'bewussten Einsatz bis zum kritischen Hinterfragen?',
  },
  {
    code: '§02',
    name: 'Rhetorik',
    body:
      'Wie klar argumentierst du? Wie sicher trägst du eine Position ' +
      'im Townhall, im 1:1, in der schwierigen Verhandlung?',
  },
  {
    code: '§03',
    name: 'Emotionale Intelligenz',
    body:
      'Wie liest du Stimmungen in einem Raum? Wie gibst du Feedback, ' +
      'das ankommt — ohne das Gegenüber zu verlieren?',
  },
];

const PHASES = [
  ['01', '5 MIN', '21 Fragen · multiple choice'],
  ['02', 'SOFORT', 'Drei Scores · Gesamt-BIB · Empfehlung'],
  ['03', 'OPTIONAL', 'Wenn du willst: 30-Tage-Sprint starten'],
];

export default function LeaderCheckLanding() {
  useEffect(() => {
    document.title = 'Leader-Check — Wo stehst du als Führungskraft?';
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      'Kostenlose 5-Minuten-Diagnose: KI-Readiness · Rhetorik · ' +
      'Emotionale Intelligenz. Sofortiges Ergebnis. Keine ' +
      'Kreditkarte. Powered by Wlad Jachtchenkos Methodik.';
    if (meta) {
      meta.setAttribute('content', desc);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div
      className="bg-[#0A0A0A] text-white min-h-screen antialiased"
      data-testid="leader-check-landing"
    >
      {/* ───────── Top-Strip / Brand ───────── */}
      <header className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand text-black font-black"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              W
            </span>
            <div>
              <div
                className="text-[16px] font-black tracking-tight text-white"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}
              >
                Leader<span className="text-brand mx-0.5">·</span>Check
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono leading-none mt-0.5">
                Diagnose · 5 Min · Kostenlos
              </div>
            </div>
          </div>
          <a
            href="https://leader-os.de"
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 hover:text-white font-mono transition-colors"
          >
            leader-os.de ↗
          </a>
        </div>
      </header>

      <main>
        {/* ───────── Hero ───────── */}
        <section
          className="relative overflow-hidden"
          aria-label="Wo stehst du als Führungskraft?"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                'radial-gradient(at 85% 15%, rgba(191,255,0,0.10) 0px, transparent 50%), ' +
                'radial-gradient(at 10% 90%, rgba(191,255,0,0.06) 0px, transparent 55%)',
            }}
          />

          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-20 md:pb-28">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-6 font-mono"
            >
              ▸ BIB · 0001 · DIAGNOSE OFFEN
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-[56px] sm:text-[88px] md:text-[120px] lg:text-[156px] leading-[0.88] tracking-[-0.045em] text-white max-w-5xl"
              style={{
                fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
              }}
            >
              Wo stehst du<span className="text-brand not-italic">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 md:mt-12 max-w-3xl text-[20px] sm:text-[26px] md:text-[32px] leading-[1.15] tracking-[-0.02em] text-white"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 800 }}
            >
              KI bestimmt das Tempo.{' '}
              <span className="text-white/55">
                Du bestimmst den Kurs<span className="text-brand">.</span>
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 max-w-2xl text-[15px] md:text-[17px] leading-[1.55] text-white/70"
            >
              5 Minuten. 21 Fragen. Drei Dimensionen: KI-Readiness,
              Rhetorik, Emotionale Intelligenz. Du bekommst sofort
              deinen Score plus eine konkrete Empfehlung — ohne
              Kreditkarte, ohne Anmeldung.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 md:mt-14 flex flex-wrap items-center gap-x-8 gap-y-5"
            >
              <a
                href="#start"
                data-testid="check-cta-primary"
                className="group inline-flex items-center gap-4"
              >
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand text-black text-2xl font-black group-hover:scale-105 transition-transform">
                  +
                </span>
                <span className="text-[15px] font-bold uppercase tracking-[0.18em] text-white border-b border-brand pb-1">
                  Diagnose starten
                </span>
              </a>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45 font-mono">
                ▸ Kein Abo · keine Kreditkarte · DSGVO-konform
              </span>
            </motion.div>
          </div>

          {/* Hairline strip — phase metadata */}
          <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-10">
            <div className="border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-3">
              {PHASES.map(([nr, dur, body]) => (
                <div
                  key={nr}
                  className="py-6 md:py-8 px-1 md:px-6 border-b md:border-b-0 md:border-r border-white/[0.08] last:border-r-0"
                >
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand font-mono">
                      §{nr}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono">
                      {dur}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[1.4] text-white/85">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── E-Mail-Bridge ───────── */}
        <section
          className="border-t border-white/[0.08]"
          aria-label="Nutze die gleiche E-Mail wie auf leader-os.de"
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28 grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div className="md:col-span-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-5 font-mono">
                ▸ WICHTIG · NUTZUNG DERSELBEN E-MAIL
              </p>
              <h2
                className="text-[36px] sm:text-[52px] md:text-[68px] leading-[0.95] tracking-[-0.035em] text-white"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Eine E-Mail.<br />
                <span className="text-white/55">Ein Profil.</span>
                <span className="text-brand not-italic">.</span>
              </h2>
              <p className="mt-8 max-w-xl text-[15px] md:text-[17px] leading-[1.6] text-white/75">
                Wenn du später auf <a className="underline decoration-brand decoration-2 underline-offset-4" href="https://leader-os.de">leader-os.de</a> in den
                Sprint einsteigst, sollte dort dieselbe E-Mail liegen, mit
                der du hier deine Diagnose machst. Sonst sieht WladBot dich
                als zwei verschiedene Menschen — und deine Personalisierung
                fängt bei Null an.
              </p>
              <p className="mt-5 max-w-xl text-[15px] leading-[1.6] text-white/65">
                Gleiche E-Mail = WladBot kennt deine Scores ab Tag 1,
                weiß wo deine Schwächen liegen, schlägt dir die richtigen
                Frameworks vor. Andere E-Mail = zwei getrennte Welten.
              </p>
            </div>
            <ul className="md:col-span-5 border border-white/[0.10] p-6 md:p-7 space-y-4">
              <li className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono pb-3 border-b border-white/[0.06]">
                ▸ WAS BLEIBT VERBUNDEN
              </li>
              {[
                ['SCORE',    'Deine drei Diagnose-Scores'],
                ['CONTEXT',  'Rolle · Team-Größe · Branche'],
                ['HISTORIE', 'Welche Drills du gemacht hast'],
                ['TON',      'Wie der Bot mit dir spricht'],
                ['FOLDER',   'Notizen die du speicherst'],
              ].map(([tag, value]) => (
                <li key={tag} className="grid grid-cols-12 gap-3 items-baseline">
                  <span className="col-span-3 text-[10px] font-bold uppercase tracking-[0.16em] text-brand font-mono">
                    {tag}
                  </span>
                  <span className="col-span-9 text-[13.5px] leading-[1.4] text-white/80">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── 3 Dimensionen ───────── */}
        <section
          className="border-t border-white/[0.08]"
          aria-label="Drei Dimensionen der Diagnose"
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-5 font-mono">
              ▸ DREI DIMENSIONEN · 21 FRAGEN
            </p>
            <h2
              className="text-[36px] sm:text-[52px] md:text-[68px] leading-[0.95] tracking-[-0.035em] text-white max-w-3xl"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Was wir messen<span className="text-brand not-italic">.</span>
            </h2>

            <div className="mt-14 grid md:grid-cols-3 gap-8 md:gap-12">
              {DIMENSIONS.map((d, i) => (
                <motion.div
                  key={d.code}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="border border-white/[0.10] p-7"
                >
                  <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand font-mono">
                      {d.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono">
                      7 FRAGEN
                    </span>
                  </div>
                  <h3
                    className="text-[24px] md:text-[28px] leading-[1.05] tracking-[-0.02em] text-white mb-4"
                    style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontStyle: 'italic' }}
                  >
                    {d.name}<span className="text-brand">.</span>
                  </h3>
                  <p className="text-[14.5px] leading-[1.55] text-white/70">
                    {d.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Final CTA ───────── */}
        <section
          id="start"
          className="border-t border-white/[0.08]"
          aria-label="Diagnose starten"
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-24 md:py-36 text-center">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-6 font-mono">
              ▸ DIAGNOSE STARTEN
            </p>
            <h2
              className="text-[52px] sm:text-[80px] md:text-[112px] leading-[0.92] tracking-[-0.04em] text-white max-w-5xl mx-auto"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              5 Minuten.<br />
              <span className="text-white/55">Ein Score.</span>
              <span className="text-brand not-italic">.</span>
            </h2>
            <p className="mt-10 max-w-xl mx-auto text-[15px] md:text-[17px] leading-[1.55] text-white/70">
              Keine Kreditkarte. Keine Anmeldung. Du beantwortest 21
              Fragen — wir geben dir sofort deinen BIB-Score und eine
              ehrliche Empfehlung, was dein nächster Schritt ist.
            </p>
            <div className="mt-14 inline-flex items-center gap-5">
              <a
                href="/leader-diagnose"
                data-testid="check-cta-final"
                className="group inline-flex items-center gap-4"
              >
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand text-black text-3xl font-black group-hover:scale-105 transition-transform">
                  +
                </span>
                <span className="text-[16px] font-bold uppercase tracking-[0.18em] text-white border-b-2 border-brand pb-1">
                  Jetzt starten · 5 Min
                </span>
              </a>
            </div>
            <p className="mt-8 text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/40 font-mono">
              ▸ TIPP · NUTZE DIESELBE E-MAIL, MIT DER DU LATER LEADER-OS.DE
              VERWENDEN WILLST
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
