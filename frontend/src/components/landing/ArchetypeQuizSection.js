import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';

/**
 * ArchetypeQuizSection — der "Funnel-Magnet" der Landing.
 *
 * Typeform-style. 5 schnelle Fragen, ein Klick = eine Antwort, autoadvance.
 * Am Ende ein KI-Leadership-Archetyp + CTA in die tiefe Diagnose auf
 * leadercheck.de. Sektion ist absichtlich groß (min-h-screen) damit Besucher
 * beim Scrollen hineinrutschen und nicht raus können bevor sie ihren
 * Archetyp gesehen haben.
 *
 * Funnel-Strategie:
 *   leader-os.de Quiz (60s, Archetyp)
 *      → leadercheck.de Diagnose (5min, 30 Fragen)
 *      → leaderos.de Plattform (Sprint + Coaching)
 */

// ───────────────────────────────────────────────────────────────────
// Archetype map — 4 KI-Leadership-Profile.
// Jede Antwort verteilt 1 Punkt auf einen Archetyp. Höchster Score gewinnt.
// ───────────────────────────────────────────────────────────────────
const ARCHETYPES = {
  operator: {
    code: 'OP',
    title: 'Der Operator.',
    essence: 'Du nutzt KI bereits täglich. Was dir fehlt ist das System, das den Hebel multipliziert.',
    next: 'Dein nächster Schritt ist Methodik — nicht noch ein Tool.',
  },
  kreator: {
    code: 'KR',
    title: 'Der Kreator.',
    essence: 'Du kommunizierst klar und ziehst Aufmerksamkeit. Jetzt brauchst du Skill-Tiefe in KI um Wirkung zu skalieren.',
    next: 'Dein nächster Schritt ist KI-Drill, der zu deiner Stimme passt.',
  },
  visionaer: {
    code: 'VI',
    title: 'Der Visionär.',
    essence: 'Du denkst groß. Dir fehlt das Execution-System, das deine Vision durchs Team zieht.',
    next: 'Dein nächster Schritt ist die Architektur — vom Konzept zur Umsetzung.',
  },
  leader: {
    code: 'LD',
    title: 'Die Leaderin / Der Leader.',
    essence: 'Du führst schon vorausschauend. Was dich auf die nächste Stufe bringt ist ein Netzwerk Gleichgesinnter.',
    next: 'Dein nächster Schritt ist Multiplikation — andere Leader mit deinem System.',
  },
};

// ───────────────────────────────────────────────────────────────────
// Questions — jede Antwort hat einen Archetype-Tag.
// Reihenfolge bewusst: leicht → tief, damit Momentum hält.
// ───────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    bib: '01',
    q: 'Wie oft nutzt du KI für echte Entscheidungen?',
    sub: 'Nicht für Memes. Für Strategie, Kommunikation, Planung.',
    options: [
      { label: 'Täglich, ich denke mit KI', tag: 'operator' },
      { label: 'Wöchentlich, an Schlüsselstellen', tag: 'leader' },
      { label: 'Selten, eher zum Testen', tag: 'visionaer' },
      { label: 'Fast nie, ich kommuniziere lieber direkt', tag: 'kreator' },
    ],
  },
  {
    bib: '02',
    q: 'Was beschreibt deine Rolle am besten?',
    sub: 'Egal welcher Titel — was tust du wirklich am Tag.',
    options: [
      { label: 'Founder oder CEO — ich setze die Richtung', tag: 'visionaer' },
      { label: 'Manager oder Team-Lead — ich führe Menschen', tag: 'leader' },
      { label: 'Senior IC — ich liefere Substanz', tag: 'operator' },
      { label: 'Creator oder Solo — ich baue meine Audience', tag: 'kreator' },
    ],
  },
  {
    bib: '03',
    q: 'Wo liegt dein größter Hebel-Bereich?',
    sub: 'Wenn das eine Sache besser würde, hätte alles andere mehr Effekt.',
    options: [
      { label: 'Strategie und Klarheit', tag: 'visionaer' },
      { label: 'Skill-Tiefe in KI', tag: 'operator' },
      { label: 'Kommunikation und Wirkung', tag: 'kreator' },
      { label: 'Netzwerk und Sparring', tag: 'leader' },
    ],
  },
  {
    bib: '04',
    q: 'Was hält dich am meisten zurück?',
    sub: 'Sei ehrlich. Nur die ehrliche Antwort zählt.',
    options: [
      { label: 'Zeit — alles bleibt liegen', tag: 'operator' },
      { label: 'Methodik — ich weiß nicht wo anfangen', tag: 'kreator' },
      { label: 'Team — alleine geht es nicht weiter', tag: 'leader' },
      { label: 'Klarheit — zu viele Optionen', tag: 'visionaer' },
    ],
  },
  {
    bib: '05',
    q: 'Was würde dich in den nächsten 90 Tagen am meisten weiterbringen?',
    sub: 'Das wonach du heute hungrig bist.',
    options: [
      { label: 'Ein System das jeden Tag liefert', tag: 'operator' },
      { label: 'Drill und Methodik die hängen bleibt', tag: 'kreator' },
      { label: 'Architektur die mein Team trägt', tag: 'visionaer' },
      { label: 'Eine Community die mich pusht', tag: 'leader' },
    ],
  },
];

const TOTAL = QUESTIONS.length;

function scoreToArchetype(answers) {
  const counts = { operator: 0, kreator: 0, visionaer: 0, leader: 0 };
  for (const a of answers) counts[a] = (counts[a] || 0) + 1;
  let best = 'operator';
  let max = -1;
  for (const k of Object.keys(counts)) {
    if (counts[k] > max) {
      max = counts[k];
      best = k;
    }
  }
  return ARCHETYPES[best];
}

const FADE = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: 'easeIn' } },
};

export const ArchetypeQuizSection = () => {
  const [step, setStep] = useState(0); // 0..TOTAL-1, then TOTAL = result
  const [answers, setAnswers] = useState([]);

  const isResult = step >= TOTAL;
  const archetype = useMemo(() => (isResult ? scoreToArchetype(answers) : null), [isResult, answers]);
  const progress = Math.min(step / TOTAL, 1);

  const pickAnswer = (tag) => {
    const nextAnswers = [...answers, tag];
    setAnswers(nextAnswers);
    setStep(step + 1);
  };

  const restart = () => {
    setAnswers([]);
    setStep(0);
  };

  return (
    <section
      id="archetyp"
      data-testid="archetype-quiz-section"
      aria-label="KI-Leadership Archetyp Quiz"
      className="relative border-y-2 border-black/[0.06] bg-background"
    >
      {/* Scarcity-strip + Eyebrow */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-6">
        <div className="flex items-center gap-3 mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55">
          <span className="text-brand-strong">▸ SCHRITT 01 · ARCHETYP-TEASER</span>
          <span className="opacity-30">·</span>
          <span>60 SEKUNDEN · 5 FRAGEN</span>
          <span className="opacity-30 hidden md:inline">·</span>
          <span className="hidden md:inline text-foreground/40">FÜHRT ZUM ECHTEN CHECK AUF LEADERCHECK.DE</span>
        </div>
        <h2
          className="text-[40px] sm:text-[64px] md:text-[88px] leading-[0.92] tracking-[-0.04em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Welche Art von KI-Leader<br />
          <span className="text-foreground/55">bist du wirklich</span>
          <span className="text-brand not-italic">?</span>
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-foreground/70">
          Das ist der <strong className="text-foreground">60-Sekunden-Schnelltest</strong>.
          Fünf Fragen, ein Archetyp, ein konkreter Hinweis worauf du als nächstes
          schaust. Der vollständige Check — deine Opportunities, dein Lernpfad
          in KI, dein 30-Tage-Plan — wartet danach auf{' '}
          <span className="font-mono text-[15px] text-brand-strong font-bold">leadercheck.de</span>.
        </p>
      </div>

      {/* Quiz-Card */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 pb-24 md:pb-32">
        <div className="relative border-2 border-black bg-background overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-black/[0.06]">
            <motion.div
              className="h-full bg-brand"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress * 100, isResult ? 100 : 4)}%` }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="p-8 md:p-14 min-h-[480px] md:min-h-[560px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {!isResult ? (
                <motion.div
                  key={`q-${step}`}
                  variants={FADE}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-7 font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/45">
                    <span>FRAGE {QUESTIONS[step].bib} · {step + 1} / {TOTAL}</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>

                  <h3
                    className="text-[28px] sm:text-[36px] md:text-[44px] leading-[1.05] tracking-[-0.03em] text-foreground"
                    style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
                  >
                    {QUESTIONS[step].q.replace(/\?$/, '')}<span className="text-brand not-italic">?</span>
                  </h3>
                  <p className="mt-3 text-[14px] md:text-[15px] text-foreground/55 leading-relaxed max-w-xl">
                    {QUESTIONS[step].sub}
                  </p>

                  <div className="mt-8 grid sm:grid-cols-2 gap-3 md:gap-4">
                    {QUESTIONS[step].options.map((opt, i) => (
                      <motion.button
                        key={opt.label}
                        type="button"
                        onClick={() => pickAnswer(opt.tag)}
                        data-testid={`archetype-answer-${step}-${i}`}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        className="group relative text-left p-5 md:p-6 border-2 border-black bg-background hover:bg-brand/15 transition-colors"
                      >
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/40 group-hover:text-foreground/60">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="block mt-2 text-[15px] md:text-[16.5px] font-semibold leading-[1.35] text-foreground">
                          {opt.label}
                        </span>
                        <ArrowRight
                          size={16}
                          className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-brand-strong"
                        />
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                    <span>Wlad · 400 000 Coachings</span>
                    <span className="opacity-30">·</span>
                    <span className="hidden md:inline">Keine Email · Kein Login</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  variants={FADE}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-7 font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/45">
                    <span className="text-brand-strong">▸ DEIN ARCHETYP · {archetype.code}</span>
                    <button
                      type="button"
                      onClick={restart}
                      className="flex items-center gap-1.5 text-foreground/45 hover:text-foreground transition-colors"
                      data-testid="archetype-restart"
                    >
                      <RotateCcw size={11} /> NEU STARTEN
                    </button>
                  </div>

                  <h3
                    className="text-[40px] sm:text-[64px] md:text-[84px] leading-[0.92] tracking-[-0.04em] text-foreground"
                    style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
                  >
                    {archetype.title.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
                  </h3>

                  <p className="mt-7 max-w-2xl text-[18px] md:text-[22px] leading-[1.45] text-foreground/85">
                    {archetype.essence}
                  </p>

                  <div className="mt-6 max-w-2xl border-l-2 border-brand pl-5 py-1">
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-brand-strong">
                      ▸ ERSTE INDIKATION
                    </span>
                    <p className="mt-1.5 text-[15px] md:text-[16.5px] text-foreground/75 leading-[1.5]">
                      {archetype.next}
                    </p>
                  </div>

                  {/* ── Übergang zum vollständigen Check ── */}
                  <div className="mt-10 max-w-3xl border-2 border-black bg-black text-white p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand">
                      <span>▸ SCHRITT 02</span>
                      <span className="opacity-40">·</span>
                      <span className="text-white/60">DER VOLLSTÄNDIGE CHECK</span>
                    </div>
                    <h4
                      className="text-[24px] md:text-[32px] leading-[1.05] tracking-[-0.03em]"
                      style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
                    >
                      Das war der Teaser. Jetzt der Check<span className="text-brand not-italic">.</span>
                    </h4>
                    <p className="mt-3 text-[14px] md:text-[15.5px] leading-[1.55] text-white/75 max-w-xl">
                      Auf <span className="font-mono text-brand font-bold">leadercheck.de</span> bekommst
                      du in 5 Minuten die volle Standortbestimmung — kostenlos, ohne
                      Abo, ohne Spam:
                    </p>
                    <ul className="mt-5 grid sm:grid-cols-3 gap-3 md:gap-5">
                      {[
                        { bib: '01', title: 'Deine KI-Opportunities', body: 'Wo dein größter Hebel liegt — in Strategie, Skill, Kommunikation oder Team.' },
                        { bib: '02', title: 'Dein KI-Lernpfad', body: 'Wo du anfängst, welche Tools, welche Drills — Schritt für Schritt.' },
                        { bib: '03', title: 'Dein 30-Tage-Plan', body: 'Konkreter Fahrplan plus Match mit dem Sprint 0001 falls du tiefer willst.' },
                      ].map((it) => (
                        <li key={it.bib} className="border-l border-brand/60 pl-3">
                          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
                            {it.bib} · {it.title}
                          </div>
                          <p className="mt-1.5 text-[13px] leading-[1.45] text-white/70">
                            {it.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <a
                      href="https://leadercheck.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="archetype-cta-diagnose"
                      className="group inline-flex items-center gap-3 px-7 md:px-9 h-16 bg-brand hover:bg-brand-strong text-black font-bold text-[15px] md:text-[16px] tracking-[0.02em] transition-colors shadow-[6px_6px_0_0_#000]"
                    >
                      Vollständigen Check starten
                      <span className="font-mono text-[11px] font-bold opacity-70">→ LEADERCHECK.DE</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                      5 MIN · 30 FRAGEN · KOSTENLOS · KEIN ABO
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Coda — micro social-proof */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/45">
          <span>▸ 3× SPIEGEL-BESTSELLER</span>
          <span>▸ 400 000 KUNDEN</span>
          <span>▸ KLASSE 0001 · 38 / 50 PLÄTZE WEG</span>
        </div>
      </div>
    </section>
  );
};
