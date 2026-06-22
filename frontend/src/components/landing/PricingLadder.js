import { useGsapScrollIn } from './motion/useGsapScrollIn';

/**
 * PricingLadder · Sprint → Plus-Plus → Mentoring → AI Ownership.
 *
 * Nike+xAI+Tesla+Cactus-Jack DNA: sharp 2px borders, Outfit Italic
 * Black für Tier-Namen, SF Mono für Metadata, lime accent für Preise.
 *
 * Fünf Stufen vertikal als spec-sheet. Mobile: kollabiert zu single-column.
 * Desktop: 5-spaltig oder horizontal scroll.
 *
 * Funnel-Logik: Sprint ist Eingang, Plus-Plus ist der Marathon, Mentoring
 * 6/12 sind on-top, AI Ownership ist Enterprise. Niemand kauft direkt
 * Mentoring · Sprint zuerst, immer.
 */

const TIERS = [
  {
    id: 'diagnose',
    eyebrow: '▸ KOSTENLOS · 10 MIN',
    name: 'Diagnose',
    duration: '10 Min',
    price: '0 €',
    outcome: 'Score · Empfehlung',
    bullets: [
      'KI-Diagnose in drei Dimensionen',
      '30 Fragen · 10 Minuten · ehrlich beantwortet',
      'Sofort dein Score plus Empfehlung für Sprint-Start',
    ],
    cta: 'Diagnose starten',
    href: 'https://leadercheck.de',
    accent: false,
  },
  {
    id: 'sprint',
    eyebrow: '▸ 30-TAGE-SPRINT + 12-MONATE-MITGLIEDSCHAFT',
    name: 'Sprint',
    duration: '30 Tage Sprint · 12 Monate Mitgliedschaft',
    price: '997 €',
    outcome: '11 Frameworks · Zertifikat · 12 Monate Plattform-Zugang',
    scarcity: 'Klasse 0001 · 12 von 30 Plätzen frei',
    bullets: [
      'Alle elf Wlad-Frameworks gedrillt',
      'WladBot 24/7 in deiner Tasche',
      '12 Monate Mitgliedschaft inkludiert · voller Plattform-Zugang',
      'Tägliche Lernvideos · Wöchen-Drills',
      'Zertifikat für dein LinkedIn',
    ],
    cta: 'Sprint kaufen · 30 Tage + 12 Monate',
    href: 'https://leaderos.de/checkout?tier=sprint',
    accent: true,
    badge: '★ BELIEBT',
  },
  {
    id: 'plusplus',
    eyebrow: '▸ DAS OS-JAHR',
    name: 'Plus-Plus',
    duration: '12 Monate Enablement',
    price: '4 797 €',
    priceSub: 'oder 3 × 1 599 €',
    outcome: 'Sprint + Drill-Channel + Live mit Wlad',
    bullets: [
      'Alles aus dem Sprint',
      'Monatliche Live-Sessions mit Wlad persönlich',
      'Drill-Channel: Theorie sofort am echten Fall',
      'Sprint-Historie als Kontext für WladBot',
      'Vorrang für 1:1-Mentoring Warteliste',
    ],
    cta: 'Plus-Plus starten',
    href: 'https://leaderos.de/checkout?tier=plusplus',
    accent: false,
    badge: 'EMPFOHLEN',
    dark: true,
  },
  {
    id: 'mentoring6',
    eyebrow: '▸ 1:1 MIT WLAD · 6 MONATE',
    name: 'Mentoring 6',
    duration: '6 Monate',
    price: '14 800 €',
    outcome: 'Plus-Plus + 6 × 90 Min mit Wlad direkt',
    bullets: [
      'Alles aus Plus-Plus',
      '6 × 90 Min 1:1 mit Wlad · 14-tägig',
      'Quartalsweise Strategie-Review',
      'Direkt-Zugriff auf Wlad via Voice-Memo',
    ],
    cta: 'Auf Warteliste',
    href: '#coaching-waitlist',
    accent: false,
    waitlist: true,
  },
  {
    id: 'mentoring12',
    eyebrow: '▸ 1:1 MIT WLAD · 12 MONATE',
    name: 'Mentoring 12',
    duration: '12 Monate',
    price: '24 600 €',
    outcome: 'Plus-Plus + 12 × 90 Min · Quarterly Review',
    bullets: [
      'Alles aus Plus-Plus + Mentoring 6',
      '12 × 90 Min 1:1 mit Wlad',
      'Quartalsweise Karriere-Review',
      'Persönliches Jahresziel mit Quartals-OKRs',
    ],
    cta: 'Auf Warteliste',
    href: '#coaching-waitlist',
    accent: false,
    waitlist: true,
  },
  {
    id: 'enterprise',
    eyebrow: '▸ ENTERPRISE · TEAM-LIZENZ',
    name: 'Enterprise',
    duration: 'Custom Track',
    price: 'ab 44 000 €',
    priceSub: 'individuell skaliert',
    outcome: 'Inhouse-WladBot · Team-Lizenz · Custom-Curriculum',
    bullets: [
      'Custom-WladBot auf eurer Infrastruktur',
      'Bis 200+ User-Lizenzen',
      '12-Monate Sprint-Curriculum auf eure Industry',
      '6 × Quarterly Reviews direkt mit Wlad',
      'Mitarbeiter-Onboarding-Material',
      'SSO + Audit-Logs + Compliance-Reports',
    ],
    cta: 'Erstgespräch buchen',
    href: 'https://cal.com/leaderos/beratung',
    accent: false,
    dark: true,
    badge: 'AI OWNERSHIP',
  },
];

// Launch-Focus: Sprint + Plus-Plus + Diagnose nur. Mentoring + Enterprise
// existieren weiter im Code für später (sales-anchor + B2B-pipeline), aber
// auf der Landing erstmal versteckt · klares Funnel ohne Premium-Distraction.
const VISIBLE_IDS = new Set(['diagnose', 'sprint', 'plusplus']);
const VISIBLE_TIERS = TIERS.filter((t) => VISIBLE_IDS.has(t.id));

const TierCard = ({ tier }) => {
  const bgClass = tier.dark
    ? 'bg-[#0A0A0A] text-white border-2 border-black rounded-3xl'
    : 'bg-white text-black border-2 border-black rounded-3xl';
  const accentLine = tier.accent
    ? 'before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-brand before:content-[\'\'] before:rounded-t-3xl'
    : '';

  // Sprint = primary conversion target: starts already lifted with a soft
  // lime shadow + scale, hover boosts both. Other cards lift on hover only.
  const sprintLift = tier.accent
    ? 'shadow-[0_20px_50px_-20px_rgba(191,255,0,0.4)] md:scale-[1.02]'
    : 'shadow-[0_4px_12px_-6px_rgba(0,0,0,0.08)]';
  const hoverLift = tier.accent
    ? 'hover:-translate-y-2 hover:shadow-[0_28px_60px_-20px_rgba(191,255,0,0.55)] hover:md:scale-[1.04]'
    : 'hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.15)]';

  return (
    <article
      data-testid={`tier-${tier.id}`}
      className={`relative ${bgClass} ${accentLine} ${sprintLift} ${hoverLift} flex flex-col h-full transition-all duration-300 ease-out`}
    >
      {tier.badge && (
        <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full font-mono text-[9px] font-bold tracking-[0.22em] uppercase shadow-md ${tier.accent || tier.id === 'plusplus' ? 'bg-brand text-black' : 'bg-black text-brand'}`}>
          {tier.badge}
        </div>
      )}

      {/* Header */}
      <div className={`p-6 md:p-7 border-b-2 ${tier.dark ? 'border-white/15' : 'border-black/15'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.28em] font-mono mb-3 ${tier.dark ? 'text-brand' : 'text-brand-strong'}`}>
          {tier.eyebrow}
        </p>
        <h3
          className="leading-[0.9] tracking-[-0.04em]"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 3vw, 40px)',
          }}
        >
          {tier.name}<span className="text-brand">.</span>
        </h3>
        <p className={`mt-1 text-[11px] font-mono uppercase tracking-[0.18em] ${tier.dark ? 'text-white/55' : 'text-black/55'}`}>
          {tier.duration}
        </p>

        <div className="mt-5 flex items-baseline gap-2">
          <div
            className="text-brand-strong leading-none"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              fontStyle: 'italic',
            }}
          >
            {tier.price}
          </div>
          {tier.priceSub && (
            <span className={`text-[11px] font-mono uppercase tracking-[0.14em] ${tier.dark ? 'text-white/55' : 'text-black/55'}`}>
              · {tier.priceSub}
            </span>
          )}
        </div>
        <p className={`mt-1 text-[13px] leading-[1.45] ${tier.dark ? 'text-white/75' : 'text-black/75'}`}>
          {tier.outcome}
        </p>
      </div>

      {/* Scarcity-Strip · nur Sprint zeigt Klasse-0001-Plätze, sonst die echte Knappheit */}
      {tier.scarcity && (
        <div
          className={`mx-6 md:mx-7 mb-2 flex items-center gap-2 px-3 py-2 border ${tier.dark ? 'border-brand/40 bg-brand/[0.08]' : 'border-black bg-black/[0.04]'}`}
          data-testid={`tier-scarcity-${tier.id}`}
        >
          <span className="relative inline-flex w-1.5 h-1.5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-brand" />
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.18em] font-mono ${tier.dark ? 'text-brand' : 'text-black'}`}>
            {tier.scarcity}
          </span>
        </div>
      )}

      {/* Bullets */}
      <ul className={`p-6 md:p-7 space-y-2.5 flex-1`}>
        {tier.bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[13px] leading-[1.45]">
            <span className={`mt-1 inline-block w-1.5 h-1.5 shrink-0 ${tier.dark ? 'bg-brand' : 'bg-black'}`} />
            <span className={tier.dark ? 'text-white/85' : 'text-black/85'}>{b}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className={`p-6 md:p-7 pt-0`}>
        <a
          href={tier.href}
          className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-[12px] font-black uppercase tracking-[0.18em] rounded-full transition-all border-2 ${
            tier.waitlist
              ? `${tier.dark ? 'bg-transparent text-white border-white/30 hover:bg-white/10' : 'bg-transparent text-black border-black/30 hover:bg-black/5'}`
              : `bg-brand text-black border-brand hover:brightness-105 active:scale-[0.98] shadow-[0_14px_36px_-14px_rgba(191,255,0,0.5)]`
          }`}
          data-testid={`tier-cta-${tier.id}`}
        >
          {tier.waitlist ? '↓' : '+'}  {tier.cta}
        </a>
      </div>
    </article>
  );
};

export const PricingLadder = () => {
  // Tier-cards rise into place on entry with a short stagger. The motion
  // is motivated: the reader sees the three tiers as one ladder, not as
  // three independent cards that happen to share a row.
  const gridRef = useGsapScrollIn('card-stack', { selector: '[data-tier-card]' });

  return (
  <section
    id="pricing"
    aria-label="Preise: Sprint bis AI Ownership"
    className="relative w-full bg-[#F4F4F2] border-y-2 border-black"
    data-testid="pricing-ladder"
  >
    <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-16 md:py-24">

      {/* Header */}
      <div className="mb-12 md:mb-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        <div className="md:col-span-7">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-4 font-mono">
            ▸ DIE LEITER · DIAGNOSE · SPRINT · PLUS-PLUS
          </p>
          <h2
            className="leading-[0.9] tracking-[-0.04em] text-black"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 'clamp(40px, 5.5vw, 88px)',
            }}
          >
            Dein Pfad.<br />
            <span className="text-black/55">In 30 Tagen</span>
            <span className="text-brand">.</span>
          </h2>
        </div>
        <div className="md:col-span-5 md:pt-6">
          <p className="text-[15px] md:text-[17px] leading-[1.55] text-black/70">
            Diagnose zeigt dir wo du stehst. Sprint ist deine 30-Tage-Challenge plus
            12 Monate Mitgliedschaft: elf Frameworks, tägliche Drills, WladBot 24/7,
            voller Plattform-Zugang ein ganzes Jahr. Plus-Plus legt monatliche
            Live-Sessions mit Wlad obendrauf. <span className="text-black font-bold">Sprint zuerst, immer.</span>
          </p>
        </div>
      </div>

      {/* Drei-Tier-Fokus: Diagnose · Sprint · Plus-Plus. Mentoring + Enterprise
          existieren weiter im Code (TIERS array), sind aber für den Launch
          versteckt. Re-aktivierbar via VISIBLE_IDS oben. */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {VISIBLE_TIERS.map((tier) => (
          // h-full on the wrapper so the inner TierCard's own h-full
          // resolves against the grid-track height; without this anchor,
          // the wrapper collapses to content-height and cards stop
          // matching each other across the row.
          <div key={tier.id} data-tier-card className="h-full">
            <TierCard tier={tier} />
          </div>
        ))}
      </div>

      {/* Footnote */}
      <p className="mt-10 text-center text-[12px] font-mono uppercase tracking-[0.22em] text-black/45">
        ▸ ALLE PREISE EINMALIG · OHNE ABO · 14 TAGE GELD-ZURÜCK AUF SPRINT
      </p>
    </div>
  </section>
  );
};
