import { ArrowRight, Lock, Sparkles } from 'lucide-react';

/**
 * ClassesRoadmapSection — Identity-Shift-Narrativ + Klassen-Roadmap.
 *
 * Strategie: zwei Botschaften in einer Section.
 *
 *   1. POSITIONING:  Mit KI starten, als Leader rauskommen. Eine
 *      Identität, ein Pfad. Du musst nicht schon "Führungskraft sein"
 *      um hier reinzukommen — du musst nur ernst meinen dass du mit
 *      KI dein Berufsleben verändern willst.
 *
 *   2. ROADMAP:      Klasse 0001 ist jetzt offen. Charter-Preis,
 *      30 Plätze hand-picked. 0002 (AI Agents), 0003 (Custom Setup),
 *      0004 (Revenue Skills) sind die nächsten Klassen — wer 0001
 *      mitmacht hat Vorzugs-Zugang.
 *
 * Position auf der Landing: nach FreeToolsSection / vor TrackField —
 * der User hat den Quiz gemacht, die Tools gesehen, jetzt zeigen wir
 * ihm den ganzen Pfad und die Charter-Offerte.
 */

const CLASSES = [
  {
    code: '0001',
    name: 'Foundation',
    status: 'open',
    subtitle: 'KI-Routine + KI-natives Führen.',
    promise:
      'Wir bauen dir dein persönliches KI-Setup für deinen Job — und ' +
      'machen aus Reflex-Nutzern Routinen-Operator. 30 Tage Sprint, ' +
      'tägliches Coaching, Klasse 0001 als geschlossener Peer-Kreis.',
    outcome: 'Messbare Zeit-Ersparnis + Output-Qualität in 30 Tagen.',
    pillars: ['Daily Check-in', 'WladBot Sparring', 'Klasse 0001 Peer-Kreis', 'Sprint 0001'],
    seats: '12 / 30 CHARTER-PLÄTZE',
  },
  {
    code: '0002',
    name: 'AI Agents Builder',
    status: 'comingSoon',
    subtitle: 'Deine eigenen KI-Agenten bauen.',
    promise:
      'Schritt-für-Schritt: vom ersten Custom-GPT bis zu Multi-Agent-' +
      'Workflows die dir Arbeit abnehmen — ohne dass du Developer wirst.',
    outcome: 'Drei eigene Agenten am Ende der Klasse — produktiv im Einsatz.',
    pillars: ['Agent-Patterns', 'Tool-Use', 'Multi-Agent Workflows', 'Production-Ops'],
    seats: 'STARTET Q3 · WARTELISTE OFFEN',
  },
  {
    code: '0003',
    name: 'Custom AI Setup',
    status: 'comingSoon',
    subtitle: 'Dein persönliches KI-Studio.',
    promise:
      'Wir designen dein KI-Setup auf deinen tatsächlichen Job zu — ' +
      'Tools, Prompts, Wissens-Basen, Integrationen. Nicht generisch, ' +
      'nicht für 80 % — für DICH.',
    outcome: 'Dein KI-Studio läuft. Replizierbar. Skalierbar.',
    pillars: ['Tool-Stack-Audit', 'Custom Knowledge Base', 'Workflow-Design', 'Integration'],
    seats: 'STARTET Q4 · WARTELISTE OFFEN',
  },
  {
    code: '0004',
    name: 'Revenue Skills',
    status: 'planned',
    subtitle: 'KI für mehr Umsatz.',
    promise:
      'Konkrete KI-Skills für die Revenue-Side: Pricing, Verhandlung, ' +
      'Vertriebs-Sequenzen, Pitch-Generation, Closing-Drills mit KI als Sparring.',
    outcome: 'Mess­barer Umsatz-Impact auf deine Pipeline.',
    pillars: ['KI-Pricing', 'KI-Verhandlung', 'Pipeline-Sequences', 'Closing-Drills'],
    seats: '2027 · INTERESSE BEKUNDBAR',
  },
];

const StatusBadge = ({ status }) => {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand text-black font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /> LIVE · 30 PLÄTZE
      </span>
    );
  }
  if (status === 'comingSoon') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/40 text-white/75 font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
        COMING SOON
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/20 text-white/45 font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
      <Lock size={9} /> 2027
    </span>
  );
};

const ClassCard = ({ klass, isFirst }) => {
  const isOpen = klass.status === 'open';
  return (
    <div
      data-testid={`class-${klass.code}`}
      className={`relative border-2 p-7 md:p-8 transition-colors ${
        isOpen
          ? 'border-brand bg-white text-black shadow-[8px_8px_0_0_#BFFF00]'
          : 'border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className={`font-mono text-[10px] font-bold uppercase tracking-[0.28em] ${isOpen ? 'text-brand-strong' : 'text-brand'}`}>
            ▸ KLASSE · {klass.code}
          </div>
          <h3
            className={`mt-1.5 text-[26px] md:text-[30px] leading-[1.04] tracking-[-0.03em]`}
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            {klass.name}<span className={isOpen ? 'text-brand-strong not-italic' : 'text-brand not-italic'}>.</span>
          </h3>
          <p className={`mt-1 text-[13px] md:text-[14px] font-semibold ${isOpen ? 'text-black/65' : 'text-white/65'}`}>
            {klass.subtitle}
          </p>
        </div>
        <StatusBadge status={klass.status} />
      </div>

      <p className={`text-[14px] md:text-[15px] leading-[1.55] ${isOpen ? 'text-black/75' : 'text-white/70'}`}>
        {klass.promise}
      </p>

      <div className={`mt-5 pt-4 border-t ${isOpen ? 'border-black/12' : 'border-white/10'}`}>
        <div className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] mb-2 ${isOpen ? 'text-brand-strong' : 'text-brand/85'}`}>
          ▸ ERGEBNIS
        </div>
        <p className={`text-[13.5px] font-semibold leading-[1.45] ${isOpen ? 'text-black' : 'text-white/90'}`}>
          {klass.outcome}
        </p>
      </div>

      <ul className={`mt-5 flex flex-wrap gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] ${isOpen ? 'text-black/55' : 'text-white/55'}`}>
        {klass.pillars.map((p) => (
          <li key={p} className={`px-2 py-1 border ${isOpen ? 'border-black/15' : 'border-white/15'}`}>
            {p}
          </li>
        ))}
      </ul>

      <div className={`mt-6 flex items-center justify-between gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${isOpen ? 'text-black/55' : 'text-white/45'}`}>
        <span>{klass.seats}</span>
        {isOpen ? (
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('pricing');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            data-testid="class-0001-cta"
            className="inline-flex items-center gap-2 px-4 h-11 bg-black text-white hover:bg-brand hover:text-black font-bold text-[12px] tracking-[0.05em] transition-colors"
          >
            CHARTER-PREIS SICHERN
            <ArrowRight size={14} />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-white/60">
            <Sparkles size={11} /> Vorzugs-Zugang aus 0001
          </span>
        )}
      </div>
    </div>
  );
};

export const ClassesRoadmapSection = () => (
  <section
    id="klassen"
    data-testid="classes-roadmap-section"
    aria-label="Klassen-Roadmap und Charter-Offer"
    className="border-y-2 border-black/[0.06] bg-[#0A0A0A] text-white relative overflow-hidden"
  >
    {/* Lime ambient glow bottom-left */}
    <div
      aria-hidden
      className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(191,255,0,0.10) 0%, transparent 65%)',
        filter: 'blur(40px)',
      }}
    />

    <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
      {/* Identity-Shift Headline */}
      <div className="max-w-3xl mb-14 md:mb-20">
        <div className="flex items-center gap-3 mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand">
          <span>▸ DER PFAD</span>
          <span className="opacity-30">·</span>
          <span className="text-white/55">IDENTITY SHIFT · 4 KLASSEN</span>
        </div>

        <h2
          className="text-[40px] sm:text-[60px] md:text-[80px] leading-[0.92] tracking-[-0.04em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Mit KI starten<span className="text-brand not-italic">.</span><br />
          <span className="text-white/55">Als Leader rauskommen</span>
          <span className="text-brand not-italic">.</span>
        </h2>

        <p className="mt-7 text-[16px] md:text-[18px] leading-[1.6] text-white/75">
          Du musst nicht schon "Führungskraft sein" um hier reinzukommen.
          Du musst nur ernst meinen, dass du mit KI dein Berufsleben verändern
          willst. Leader-OS macht dich KI-stark — und Führung ist das was
          daraus entsteht. <strong className="text-white">Eine Identität,
          ein Pfad, vier Klassen.</strong>
        </p>
      </div>

      {/* 2x2 Roadmap-Grid */}
      <div className="grid lg:grid-cols-2 gap-6 md:gap-7">
        {CLASSES.map((klass, i) => (
          <ClassCard key={klass.code} klass={klass} isFirst={i === 0} />
        ))}
      </div>

      {/* Charter-Coda: 30 seats, revenue-focused promise */}
      <div className="mt-12 border-2 border-brand bg-brand/[0.05] p-7 md:p-9">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex-1">
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-3">
              ▸ CHARTER-OFFER · KLASSE 0001
            </div>
            <h3
              className="text-[26px] md:text-[36px] leading-[1.05] tracking-[-0.03em] text-white"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              30 Plätze<span className="text-brand not-italic">.</span><br />
              <span className="text-white/55">Hand-picked. Charter-Preis. Lifetime-Zugang</span>
              <span className="text-brand not-italic">.</span>
            </h3>
            <p className="mt-5 text-[14px] md:text-[15.5px] leading-[1.6] text-white/75 max-w-2xl">
              Die ersten 30 bekommen den vollen Sprint <strong className="text-white">
              + Lifetime-Zugang</strong> zu Klasse 0001 als geschlossener Peer-Kreis
              <strong className="text-white"> + Vorzugs-Aufnahme</strong> in Klassen 0002, 0003, 0004
              <strong className="text-white"> + 1:1-Onboarding mit Wlad persönlich</strong>.
              Wir bauen mit dir dein KI-Setup für deinen Job auf — mit messbarem
              Fokus auf Output, Zeit-Ersparnis und Revenue.
            </p>
          </div>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('pricing');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            data-testid="charter-cta"
            className="inline-flex items-center justify-center gap-3 px-6 md:px-8 h-16 bg-brand hover:bg-brand-strong text-black font-bold text-[14px] md:text-[15px] tracking-[0.02em] transition-colors shadow-[6px_6px_0_0_#000] whitespace-nowrap"
          >
            Charter-Platz sichern
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  </section>
);
