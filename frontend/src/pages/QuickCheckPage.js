/**
 * QuickCheckPage — `/quick-check` public mini-app, leadflow funnel.
 *
 * Ziel · Visitor in 60 Sek durch 5 Fragen führen → Score + Archetyp reveal →
 * zwei klare CTAs:
 *
 *   1. PRIMARY  · Volle 10-Min-Diagnose auf leadercheck.de
 *   2. SECONDARY · Account anlegen + Score speichern auf leaderos.de/signup
 *
 * Kein Login. Kein Backend-Call. PostHog tracking auf jeden Step damit wir
 * Drop-offs sehen. Antworten landen in localStorage zwischen den Steps;
 * bei Result wird ein PostHog `quick_check_completed` Event mit Score +
 * Archetyp + Recommendation gefeuert.
 *
 * Brand-DNA: massive italic display headlines, BIB-codes (Q·01..Q·05),
 * lime period dots, monospace eyebrows. Matches Leader-OS landing.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Compass, Sparkles } from 'lucide-react';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';

// ─────────────────────────────────────────────────────────────────────────
// Fragebogen — 5 Fragen, je Antwort ein Score (0-3) + Archetyp-Hint
// ─────────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    code: 'Q·01',
    label: 'Verantwortung',
    title: 'Wie viele Menschen führst du aktuell direkt?',
    sub: 'Direct Reports — die deine Performance-Reviews lesen, nicht Matrix.',
    options: [
      { value: 'a', label: 'Aktuell niemanden', score: 0 },
      { value: 'b', label: '1-3 (Team-Lead)', score: 1 },
      { value: 'c', label: '4-10 (Manager)', score: 2 },
      { value: 'd', label: '11+ (Director / VP)', score: 3 },
    ],
  },
  {
    code: 'Q·02',
    label: 'Zeitfresser',
    title: 'Was nimmt dir gerade die meiste Zeit?',
    sub: 'Wähle wo es ehrlich am meisten brennt diese Woche.',
    options: [
      { value: 'people', label: 'Mitarbeitergespräche · Feedback · Konflikte', score: 3, archetype: 'Verstärker' },
      { value: 'strategy', label: 'Strategie · Planung · Entscheidungen', score: 2, archetype: 'Vorausschauer' },
      { value: 'ops', label: 'Operatives · Email · Meetings', score: 1, archetype: 'Entscheider' },
      { value: 'politics', label: 'Politik · Stakeholder · Senior-Alignment', score: 2, archetype: 'Verteidiger' },
    ],
  },
  {
    code: 'Q·03',
    label: 'Sparring',
    title: 'Wie oft sprichst du mit externem Sparring-Partner über deinen Stand?',
    sub: 'Mit jemandem der DICH versteht, nicht mit Kollegen aus dem gleichen Boot.',
    options: [
      { value: 'weekly', label: 'Wöchentlich', score: 3 },
      { value: 'monthly', label: 'Monatlich', score: 2 },
      { value: 'quarterly', label: 'Quartalsweise', score: 1 },
      { value: 'never', label: 'Eigentlich nie', score: 0, gap: 'sparring' },
    ],
  },
  {
    code: 'Q·04',
    label: 'KI-Reflex',
    title: 'Wie nutzt du KI im Job-Alltag?',
    sub: 'Ehrlich. "Ich habe ChatGPT offen" ≠ "ich nutze KI strukturiert".',
    options: [
      { value: 'daily', label: 'Täglich, mehrere Tools, klarer Workflow', score: 3 },
      { value: 'weekly', label: 'Wöchentlich, vor allem ChatGPT', score: 2 },
      { value: 'rarely', label: 'Selten, nur wenn ich denke daran', score: 1, gap: 'ki' },
      { value: 'never', label: 'Garnicht / nur Spielerei', score: 0, gap: 'ki' },
    ],
  },
  {
    code: 'Q·05',
    label: 'Hebel',
    title: 'Was wäre der GRÖSSTE Hebel für dich in 30 Tagen?',
    sub: 'Was würde — wenn es sich bewegen würde — den größten Unterschied machen?',
    options: [
      { value: 'method', label: 'Methodik · klare Frameworks · Drill-Routine', score: 2, gap: 'methodik' },
      { value: 'sparring', label: 'Sparring · regelmäßige externe Reflexion', score: 3, gap: 'sparring' },
      { value: 'skill', label: 'Skill · Schlagfertigkeit / Verhandlung / Rhetorik', score: 2, gap: 'skill' },
      { value: 'clarity', label: 'Klarheit · Identität · Karriere-Richtung', score: 3, gap: 'clarity' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Auswertung
// ─────────────────────────────────────────────────────────────────────────
const computeResult = (answers) => {
  let score = 0;
  let archetype = 'Vorausschauer';
  const gaps = [];

  answers.forEach((a, idx) => {
    const q = QUESTIONS[idx];
    const opt = q.options.find((o) => o.value === a);
    if (opt) {
      score += opt.score;
      if (opt.archetype) archetype = opt.archetype;
      if (opt.gap) gaps.push(opt.gap);
    }
  });

  const maxScore = QUESTIONS.reduce((m, q) => m + Math.max(...q.options.map((o) => o.score)), 0);
  const percent = Math.round((score / maxScore) * 100);

  // Recommendation engine
  let recommendation = '';
  if (gaps.includes('sparring') && gaps.includes('ki')) {
    recommendation = 'Du brauchst beides: KI-Methodik UND externes Sparring. Sprint 0001 ist genau das.';
  } else if (gaps.includes('sparring')) {
    recommendation = 'Sparring ist dein größter Hebel. Plus-Plus mit monatlichen Wlad-Live-Sessions.';
  } else if (gaps.includes('ki')) {
    recommendation = 'KI-Methodik ist dein Hebel. Sprint 0001 mit WladBot als 24/7-Sparring.';
  } else if (gaps.includes('clarity')) {
    recommendation = 'Du brauchst Klarheit über Identität, nicht mehr Tools. 1:1-Mentoring mit Wlad.';
  } else if (gaps.includes('skill')) {
    recommendation = 'Skill-Vertiefung: Rhetorik · Schlagfertigkeit · Verhandlung. Sprint 0001.';
  } else {
    recommendation = 'Du bist gut aufgestellt — die volle Diagnose zeigt wo der nächste 10% Hebel sitzt.';
  }

  return { score, maxScore, percent, archetype, recommendation, gaps };
};

// ─────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }) => {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="mb-10 md:mb-14">
      <div className="flex items-center justify-between mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-foreground/55">
        <span>FRAGE {String(current + 1).padStart(2, '0')} VON {String(total).padStart(2, '0')}</span>
        <span className="text-brand-strong">{Math.round(pct)}%</span>
      </div>
      <div className="h-1 bg-foreground/10 overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const QuestionScreen = ({ question, index, total, onAnswer, onBack, canBack }) => (
  <div className="max-w-3xl mx-auto" data-testid={`question-${index + 1}`}>
    <ProgressBar current={index} total={total} />

    <div className="flex items-center gap-3 mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand-strong">
      <span>▸ {question.code}</span>
      <span className="text-foreground/30">·</span>
      <span className="text-foreground/55">{question.label}</span>
    </div>

    <h1
      className="text-[36px] sm:text-[48px] md:text-[64px] leading-[0.96] tracking-[-0.035em] text-foreground mb-4"
      style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
    >
      {question.title.replace(/\?$/, '')}<span className="text-brand-strong not-italic">?</span>
    </h1>
    <p className="text-[15px] md:text-[17px] leading-[1.55] text-foreground/65 mb-10 max-w-2xl">
      {question.sub}
    </p>

    <div className="space-y-3">
      {question.options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onAnswer(opt.value)}
          className="group w-full text-left bg-white hover:bg-brand/10 border-2 border-foreground/15 hover:border-foreground transition-colors py-5 px-6 flex items-center justify-between gap-4"
          data-testid={`answer-${question.code}-${opt.value}`}
        >
          <span className="text-[15px] md:text-[17px] font-bold text-foreground">{opt.label}</span>
          <ArrowRight size={18} className="text-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>
      ))}
    </div>

    {canBack && (
      <button
        type="button"
        onClick={onBack}
        className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/55 hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} /> ZURÜCK
      </button>
    )}
  </div>
);

const ResultScreen = ({ result, onRestart }) => {
  const { percent, archetype, recommendation } = result;

  return (
    <div className="max-w-4xl mx-auto" data-testid="quick-check-result">
      <div className="flex items-center gap-3 mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand-strong">
        <Sparkles size={14} />
        <span>▸ DEIN QUICK-CHECK · ERGEBNIS</span>
      </div>

      <h1
        className="text-[44px] sm:text-[64px] md:text-[88px] leading-[0.92] tracking-[-0.04em] text-foreground mb-5"
        style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
      >
        Du bist primär ein<br />
        <span className="text-foreground/55">{archetype}</span>
        <span className="text-brand-strong not-italic">.</span>
      </h1>

      <div className="grid md:grid-cols-12 gap-8 md:gap-12 mt-10 md:mt-14 mb-12 md:mb-16">
        <div className="md:col-span-5">
          <div className="border-2 border-foreground bg-white p-8 md:p-10">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-foreground/55 mb-3">
              QUICK-SCORE · VORLÄUFIG
            </div>
            <div
              className="text-foreground leading-none flex items-baseline gap-2 mb-3"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(72px, 10vw, 128px)', letterSpacing: '-0.045em' }}
            >
              {percent}
              <span className="text-foreground/40 text-[40%]">/100</span>
            </div>
            <div className="h-1.5 bg-foreground/10 overflow-hidden">
              <div className="h-full bg-brand" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/55">
              ▸ Vorläufig — die volle Diagnose ist viel genauer.
            </p>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand-strong mb-3">
            ▸ DEINE EMPFEHLUNG
          </div>
          <p className="text-[18px] md:text-[22px] leading-[1.45] text-foreground font-semibold mb-6">
            {recommendation}
          </p>
          <p className="text-[14.5px] md:text-[16px] leading-[1.6] text-foreground/70">
            Dieser Quick-Check ist nur ein Teaser. Die volle 10-Minuten-Diagnose
            misst dein KI · Rhetorik · EQ-Profil in 30 Fragen — und gibt einen
            konkreten 30-Tage-Lernpfad. Plus: wenn du dir einen Account auf
            leaderos.de anlegst, kannst du den Score speichern und alle 3 Monate
            wiederholen — du siehst deinen Progress in Zahlen.
          </p>
        </div>
      </div>

      {/* Two CTAs · primary diagnostic + secondary account */}
      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        <a
          href="https://leadercheck.de"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="quick-check-cta-diagnose"
          className="group block bg-foreground text-background hover:bg-brand hover:text-foreground border-2 border-foreground p-7 md:p-8 transition-colors"
          onClick={() => {
            if (typeof window !== 'undefined' && window.posthog) {
              window.posthog.capture('quick_check_cta_diagnose', { score: percent, archetype });
            }
          }}
        >
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand group-hover:text-foreground mb-4">
            ▸ NÄCHSTER SCHRITT · PRIMÄR
          </div>
          <h3
            className="text-[24px] md:text-[32px] leading-[1.02] mb-3"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Volle 10-Min-Diagnose<span className="text-brand not-italic">.</span>
          </h3>
          <p className="text-[14px] md:text-[15px] leading-[1.5] text-background/70 group-hover:text-foreground/70 mb-5">
            30 Fragen · KI · Rhetorik · EQ. Detaillierter Score + Lernpfad.
            Auf leadercheck.de. Kostenlos. Kein Login. 10 Minuten.
          </p>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em]">
            DIAGNOSE STARTEN <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        <a
          href="https://leaderos.de/signup"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="quick-check-cta-signup"
          className="group block bg-background text-foreground hover:bg-foreground/5 border-2 border-foreground p-7 md:p-8 transition-colors"
          onClick={() => {
            if (typeof window !== 'undefined' && window.posthog) {
              window.posthog.capture('quick_check_cta_signup', { score: percent, archetype });
            }
          }}
        >
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand-strong mb-4">
            ▸ ODER · SCORE SPEICHERN
          </div>
          <h3
            className="text-[24px] md:text-[32px] leading-[1.02] mb-3"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Account anlegen<span className="text-brand-strong not-italic">.</span>
          </h3>
          <p className="text-[14px] md:text-[15px] leading-[1.5] text-foreground/70 mb-5">
            30 Sekunden Anmeldung auf leaderos.de. Score gespeichert.
            Quartals-Tracking. Plus WladBot-Demo direkt nach Login.
          </p>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground">
            ACCOUNT ANLEGEN <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      </div>

      {/* Restart small link */}
      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={onRestart}
          className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/45 hover:text-foreground transition-colors"
        >
          ↻ QUICK-CHECK NOCHMAL
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Hero / Start Screen
// ─────────────────────────────────────────────────────────────────────────
const StartScreen = ({ onStart }) => (
  <div className="max-w-3xl mx-auto" data-testid="quick-check-start">
    <div className="flex items-center gap-3 mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand-strong">
      <Compass size={14} />
      <span>▸ QUICK-CHECK · 60 SEKUNDEN · KOSTENLOS</span>
    </div>

    <h1
      className="text-[48px] sm:text-[72px] md:text-[96px] leading-[0.9] tracking-[-0.045em] text-foreground mb-6"
      style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
    >
      Welcher Leader<br />
      <span className="text-foreground/55">bist du wirklich</span>
      <span className="text-brand-strong not-italic">?</span>
    </h1>

    <p className="text-[16px] md:text-[19px] leading-[1.55] text-foreground/70 max-w-2xl mb-10">
      Fünf Fragen, kein Login, kein Spam. Du bekommst sofort einen ersten
      Score plus deinen primären Archetyp. Wenn du tiefer willst — die
      volle 10-Min-Diagnose und Account-Anlage sind einen Klick weg.
    </p>

    <button
      type="button"
      onClick={onStart}
      className="group inline-flex items-center gap-3 bg-foreground text-background hover:bg-brand hover:text-foreground border-2 border-foreground px-8 h-14 font-bold uppercase tracking-[0.12em] transition-colors"
      data-testid="quick-check-start-btn"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand text-foreground group-hover:bg-foreground group-hover:text-brand font-black text-[14px] leading-none transition-colors">+</span>
      <span className="text-[13px]">QUICK-CHECK STARTEN · 60 SEK</span>
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </button>

    {/* Trust strip */}
    <div className="mt-12 pt-7 border-t border-foreground/15 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[
        ['5', 'FRAGEN'],
        ['60s', 'DAUER'],
        ['0€', 'KOSTEN'],
        ['—', 'LOGIN NÖTIG'],
      ].map(([big, label]) => (
        <div key={label} className="leading-tight">
          <div
            className="text-foreground"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(24px, 3vw, 36px)' }}
          >
            {big}
          </div>
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-foreground/55 mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function QuickCheckPage() {
  const [step, setStep] = useState(-1); // -1 = start, 0..4 = questions, 5 = result
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Quick-Check · Welcher Leader bist du? · Leader-OS';
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('quick_check_view');
    }
  }, []);

  const handleStart = () => {
    setStep(0);
    setAnswers([]);
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('quick_check_started');
    }
  };

  const handleAnswer = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('quick_check_answered', {
        question: QUESTIONS[step].code,
        answer: value,
        step: step + 1,
      });
    }

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length); // result
      const result = computeResult(newAnswers);
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('quick_check_completed', {
          score: result.percent,
          archetype: result.archetype,
          gaps: result.gaps.join(','),
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleRestart = () => {
    setStep(-1);
    setAnswers([]);
  };

  const renderContent = () => {
    if (step === -1) return <StartScreen onStart={handleStart} />;
    if (step === QUESTIONS.length) return <ResultScreen result={computeResult(answers)} onRestart={handleRestart} />;
    return (
      <QuestionScreen
        question={QUESTIONS[step]}
        index={step}
        total={QUESTIONS.length}
        onAnswer={handleAnswer}
        onBack={handleBack}
        canBack={step > 0}
      />
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="quick-check-page">
      <LandingNav />
      <main className="px-5 md:px-10 lg:px-14 py-16 md:py-24 min-h-[72vh]">
        {renderContent()}
      </main>
      <LandingFooter />
    </div>
  );
}
