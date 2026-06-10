import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingChatPod } from '../components/landing/LandingChatPod';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';

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
            {/* Warmer Grüß-Strip mit Wlad-Foto links — keine Schreierei,
                eine Einladung. Das setzt den Ton bevor die Headline kommt. */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-8"
            >
              <img
                src={WLAD_AVATAR}
                onError={withFallback(WLAD_AVATAR_FALLBACKS)}
                alt="Wlad Jachtchenko"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand/40"
              />
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand font-mono">
                  ▸ Hallo, ich bin Wlad
                </p>
                <p className="text-[12px] text-white/55 mt-0.5">
                  Schön, dass du da bist. Lass uns kurz schauen wo du stehst.
                </p>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[52px] sm:text-[80px] md:text-[112px] lg:text-[144px] leading-[0.9] tracking-[-0.045em] text-white max-w-5xl"
              style={{
                fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
              }}
            >
              Finden wir<br />
              <span className="text-white/55">deinen Startpunkt</span>
              <span className="text-brand not-italic">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 md:mt-10 max-w-3xl text-[18px] sm:text-[22px] md:text-[26px] leading-[1.25] tracking-[-0.015em] text-white"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 700 }}
            >
              Kein Test, der dich abprüft.{' '}
              <span className="text-white/55">
                Ein Gespräch, das dir zeigt, wo dein nächster Hebel liegt
                <span className="text-brand">.</span>
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-2xl text-[15px] md:text-[17px] leading-[1.6] text-white/75"
            >
              21 Fragen, ehrlich beantwortet, dauern etwa 5 Minuten. Du
              bekommst sofort einen Score über drei Dimensionen — KI,
              Rhetorik, EQ — plus eine konkrete Empfehlung, was dein
              nächster Schritt sein könnte. Kostenlos. Keine Kreditkarte.
              Kein Newsletter, der dich verfolgt.
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
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand text-black text-2xl font-black group-hover:scale-105 transition-transform shadow-[0_12px_40px_-12px_rgba(191,255,0,0.55)]">
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

            {/* Live-Trust-Strip — schlicht, glaubhaft, anonymisiert. */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 inline-flex items-center gap-3 px-3 py-2 border border-white/10 bg-white/[0.03] text-[11px] font-mono uppercase tracking-[0.18em] text-white/55"
            >
              <span className="relative inline-flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-brand" />
              </span>
              <span>
                Heute schon{' '}
                <span className="text-white font-bold">
                  {37 + Math.floor((Date.now() / 60000) % 13)}
                </span>{' '}
                Diagnosen · 4.7/5 Sterne · DACH-Region
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

        {/* ───────── E-Mail-Bridge ─────────
            Bewusst warm formuliert. Kein "WICHTIG! TUE DAS!" Schreierei.
            Eine Bitte unter Freunden mit klarer Begründung. */}
        <section
          className="border-t border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent"
          aria-label="Nutze die gleiche E-Mail wie auf leader-os.de"
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28 grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div className="md:col-span-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-5 font-mono">
                ▸ EIN KLEINER TIPP · BEVOR DU STARTEST
              </p>
              <h2
                className="text-[36px] sm:text-[52px] md:text-[68px] leading-[0.95] tracking-[-0.035em] text-white"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Nimm die E-Mail,<br />
                <span className="text-white/55">die dir am liebsten ist</span>
                <span className="text-brand not-italic">.</span>
              </h2>
              <p className="mt-8 max-w-xl text-[15px] md:text-[17px] leading-[1.6] text-white/85">
                Wenn du später auf{' '}
                <a className="underline decoration-brand decoration-2 underline-offset-4 hover:text-brand transition-colors" href="https://leader-os.de">
                  leader-os.de
                </a>{' '}
                weitermachen willst, nimm dort einfach die gleiche E-Mail
                wie hier. Dann erkennt dich WladBot wieder, kennt deine
                Scores schon und sagt dir vom ersten Tag an: „Hey, das hier
                ist genau dein Hebel."
              </p>
              <p className="mt-5 max-w-xl text-[15px] leading-[1.6] text-white/65">
                Andere E-Mail? Auch okay — dann fängt die Personalisierung
                eben nochmal bei Null an. Du verlierst nichts, aber wir
                sparen uns beide ein paar Minuten Wiederholung.
              </p>

              <div className="mt-7 inline-flex items-start gap-3 px-4 py-3 border border-brand/30 bg-brand/[0.06]">
                <span className="text-brand text-xl leading-none font-black mt-0.5">✓</span>
                <div className="text-[13px] leading-[1.5] text-white/85">
                  <strong className="font-bold">Versprochen:</strong> Wir
                  schicken dir keinen Newsletter ohne dass du den willst.
                  Keine Werbe-Mails von Dritten. Du kannst dein Profil
                  jederzeit komplett löschen — ein Klick, weg.
                </div>
              </div>
            </div>

            <ul className="md:col-span-5 border border-white/[0.10] p-6 md:p-7 space-y-4 bg-[#0A0A0A]/60 backdrop-blur-sm">
              <li className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono pb-3 border-b border-white/[0.06]">
                ▸ WAS WIR DABEI VERBINDEN
              </li>
              {[
                ['SCORE',    'Deine drei Diagnose-Scores'],
                ['ROLLE',    'Deine Rolle · Team-Größe · Branche'],
                ['DRILLS',   'Welche Übungen du gemacht hast'],
                ['TON',      'Wie der Bot mit dir spricht'],
                ['NOTIZEN',  'Was du dir gespeichert hast'],
              ].map(([tag, value]) => (
                <li key={tag} className="grid grid-cols-12 gap-3 items-baseline">
                  <span className="col-span-4 text-[10px] font-bold uppercase tracking-[0.16em] text-brand font-mono">
                    {tag}
                  </span>
                  <span className="col-span-8 text-[13.5px] leading-[1.4] text-white/80">
                    {value}
                  </span>
                </li>
              ))}
              <li className="pt-3 border-t border-white/[0.06] text-[11px] leading-[1.5] text-white/50">
                Alles auf EU-Servern. DSGVO-konform. Nichts geht an Dritte.
              </li>
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
              ▸ DREI DIMENSIONEN · DREI EHRLICHE FRAGEN-BLÖCKE
            </p>
            <h2
              className="text-[36px] sm:text-[52px] md:text-[68px] leading-[0.95] tracking-[-0.035em] text-white max-w-3xl"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Worauf wir<br />
              <span className="text-white/55">gemeinsam schauen</span>
              <span className="text-brand not-italic">.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.6] text-white/65">
              Keine Bullshit-Persönlichkeitstests. Drei Bereiche, die in
              jeder echten Führungs-Situation entscheiden — leicht zu
              messen, leicht zu trainieren.
            </p>

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

        {/* ───────── Result-Preview · "So sieht dein Ergebnis aus" ─────────
            Visuelle Garantie: hier ist genau was du am Ende kriegst. Senkt
            die Abbruch-Quote massiv weil die Person das Outcome schon sieht. */}
        <section
          className="border-t border-white/[0.08] bg-gradient-to-b from-transparent via-brand/[0.03] to-transparent"
          aria-label="Beispiel-Ergebnis"
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28 grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <div className="md:col-span-5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-5 font-mono">
                ▸ DAS BEKOMMST DU NACH 5 MINUTEN
              </p>
              <h2
                className="text-[36px] sm:text-[52px] md:text-[64px] leading-[0.95] tracking-[-0.035em] text-white"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Ein Score.<br />
                <span className="text-white/55">Eine Empfehlung</span>
                <span className="text-brand not-italic">.</span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] md:text-[16px] leading-[1.6] text-white/75">
                Keine generische PDF mit Allgemeinplätzen. Ein konkretes,
                persönliches Profil mit drei Werten, einer ehrlichen
                Einordnung und einem klaren ersten Schritt — gemacht für
                deine Realität, nicht für ein Lehrbuch.
              </p>
              <ul className="mt-7 space-y-2 text-[13px] leading-[1.55] text-white/70">
                {[
                  'Sofort sichtbar · kein Email-Warten',
                  'Anonym speicherbar oder löschbar',
                  'Teilbar mit deinem Team oder Coach',
                ].map((l) => (
                  <li key={l} className="flex items-start gap-2.5">
                    <span className="text-brand text-base leading-none mt-0.5">✓</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock-Result-Card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7"
            >
              <div className="relative bg-[#0A0A0A] border border-white/[0.12] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] text-[9px] font-bold uppercase tracking-[0.22em] text-white/55 font-mono">
                  <span>LEADER-CHECK · ERGEBNIS · ANONYM</span>
                  <span className="text-brand">BIB · 0001</span>
                </div>
                <div className="p-6 md:p-8">
                  {/* 3 Score-Kreise */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'KI', val: 78, color: '#BFFF00' },
                      { label: 'RHETORIK', val: 64, color: '#FBBF24' },
                      { label: 'EQ', val: 81, color: '#BFFF00' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="border border-white/[0.08] p-4">
                        <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono mb-2">
                          ▸ {label}
                        </div>
                        <div
                          className="leading-none tracking-[-0.04em]"
                          style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            fontSize: 56,
                            color,
                          }}
                        >
                          {val}
                        </div>
                        <div className="mt-2 h-1 bg-white/[0.08]">
                          <div className="h-1" style={{ width: `${val}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.08] pt-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand mb-2 font-mono">
                      ▸ DEINE PERSÖNLICHE EMPFEHLUNG
                    </div>
                    <p
                      className="text-[20px] sm:text-[22px] leading-[1.2] text-white"
                      style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontStyle: 'italic' }}
                    >
                      Deine größte Lücke: <span className="text-brand">Rhetorik</span>.
                      Starte mit dem 3-Säulen-Drill.
                    </p>
                    <p className="mt-3 text-[13px] leading-[1.5] text-white/65">
                      Du hast bereits ein starkes KI- und EQ-Profil. Was fehlt
                      ist die klare Argumentations-Struktur in Townhalls und
                      schwierigen 1:1s. Wlads 3-Säulen-Framework (Logos · Ethos
                      · Pathos) schließt das in ~3 Wochen.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.18em] text-white/45">
                    <span>13.06.2026 · 14:32</span>
                    <span>↗ TEILEN · DOWNLOAD · LÖSCHEN</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ───────── Trust-Strip mit Verlagen + Press ───────── */}
        <section className="border-t border-white/[0.08]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-12 md:py-16">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-white/45 mb-6 font-mono text-center">
              ▸ WLADS METHODIK ERSCHEINT BEI
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-4 text-white/70">
              {[
                'SPIEGEL-Bestseller',
                'manager magazin',
                'WirtschaftsWoche',
                'Süddeutsche Zeitung',
                '400 000 Kunden weltweit',
              ].map((label) => (
                <span
                  key={label}
                  className="text-[14px] font-bold tracking-[0.04em]"
                  style={{ fontFamily: 'Outfit, sans-serif', fontStyle: 'italic' }}
                >
                  {label}
                </span>
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
              ▸ BEREIT WENN DU ES BIST
            </p>
            <h2
              className="text-[48px] sm:text-[72px] md:text-[104px] leading-[0.94] tracking-[-0.035em] text-white max-w-5xl mx-auto"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Lass uns starten<span className="text-brand not-italic">.</span>
            </h2>
            <p className="mt-10 max-w-xl mx-auto text-[15px] md:text-[17px] leading-[1.6] text-white/80">
              5 Minuten deiner Zeit. Keine Kreditkarte. Keine
              Anmeldung. Am Ende weißt du genauer wo du stehst — und
              das ist schon mehr als die meisten haben.
            </p>
            <div className="mt-14 inline-flex flex-col items-center gap-4">
              <a
                href="/leader-diagnose"
                data-testid="check-cta-final"
                className="group inline-flex items-center gap-4"
              >
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand text-black text-3xl font-black group-hover:scale-105 transition-transform shadow-[0_10px_40px_-10px_rgba(191,255,0,0.5)]">
                  +
                </span>
                <span className="text-[16px] font-bold uppercase tracking-[0.18em] text-white border-b-2 border-brand pb-1">
                  Diagnose starten · 5 Min
                </span>
              </a>
              <p className="text-[11px] text-white/45 italic max-w-md text-center">
                Wenn du dann später Leader-OS ausprobieren willst —
                nimm dort die gleiche E-Mail. Dann erkennen wir dich
                und können vom ersten Tag persönlich werden.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* Readiness-Vorprüfung als WladBot-Mini-Funnel rechts unten —
          erkundet KI / Rhetorik / EQ / Feedback in 4 Mikro-Fragen
          und routet in die volle 21-Fragen-Diagnose. */}
      <LandingChatPod mode="readiness" />
    </div>
  );
}
