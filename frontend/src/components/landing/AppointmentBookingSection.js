/**
 * AppointmentBookingSection — direct-conversation conversion surface.
 *
 * Why it lives here: most visitors who don't convert on the Sprint CTA
 * or the free Diagnose still have one of two latent intents:
 *
 *   "I want to see the product before I buy."     -> 20-min Demo
 *   "I want to talk to a human before I decide."  -> 30-min Beratung
 *
 * The Hero and FinalCTA already link out to Cal.com, but those links
 * are buried inside CTA clusters. This section gives both bookings
 * dedicated real estate with concrete expectations so the visitor
 * knows what they're signing up for.
 *
 * Editorial layout: section header (eyebrow + headline + subline)
 * over a 2-column card grid. Distinct layout family from BenefitSection
 * (zigzag), PricingLadder (tier grid), and CoachingWaitlist (dark editorial
 * with form), so it doesn't repeat any other section's structure.
 */

import { motion } from 'framer-motion';

const SLOTS = [
  {
    id: 'demo',
    eyebrow: '▸ DEMO · 20 MIN',
    title: 'Sieh dir die App live an.',
    body:
      'Wir zeigen dir das Dashboard, den WladBot in Aktion, die Sprint-' +
      'Mechanik und das Drill-Channel. Du stellst deine Fragen direkt am ' +
      'lebenden Produkt, nicht an einer Slide.',
    bullets: [
      'Dashboard + Sprint-Plan live',
      'WladBot beantwortet eine deiner echten Fragen',
      'Q&A zu Tooling und Integration',
    ],
    cta: 'Demo buchen · 20 Min',
    href: 'https://cal.com/leaderos/demo',
    accent: true,
  },
  {
    id: 'beratung',
    eyebrow: '▸ BERATUNG · 30 MIN',
    title: 'Was passt zu dir?',
    body:
      'Du beschreibst dein Setup. Wir hören zu, fragen drei kurze Sachen ' +
      'und sagen dir ehrlich, ob Sprint, Plus-Plus oder ein anderer Weg ' +
      'zu deinem aktuellen Punkt passt. Keine Pitch-Folie.',
    bullets: [
      'Deine konkrete Situation + Ziel',
      'Tier-Empfehlung mit Begründung',
      'Kein Verkaufs-Druck, kein Follow-up-Spam',
    ],
    cta: 'Beratung buchen · 30 Min',
    href: 'https://cal.com/leaderos/beratung',
    accent: false,
  },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

const SlotCard = ({ slot, index }) => (
  <motion.article
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.25 }}
    variants={FADE_UP}
    custom={index + 1}
    data-testid={`appointment-${slot.id}`}
    className={`relative flex flex-col h-full p-7 md:p-8 border-2 ${
      slot.accent
        ? 'border-foreground bg-foreground text-background'
        : 'border-foreground/15 bg-background text-foreground hover:border-foreground/40'
    } transition-colors`}
  >
    {slot.accent && (
      <span
        aria-hidden
        className="absolute -top-3 right-5 px-2.5 py-1 bg-brand text-foreground text-[9.5px] font-black font-mono uppercase tracking-[0.22em]"
      >
        BELIEBT
      </span>
    )}

    <p
      className={`text-[10.5px] font-bold uppercase tracking-[0.28em] font-mono mb-5 ${
        slot.accent ? 'text-brand' : 'text-brand-strong'
      }`}
    >
      {slot.eyebrow}
    </p>

    <h3
      className="leading-[0.95] tracking-[-0.03em] mb-5"
      style={{
        fontFamily: 'Outfit, Inter, sans-serif',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: 'clamp(28px, 3.2vw, 40px)',
      }}
    >
      {slot.title.replace(/\.$/, '')}
      <span className="text-brand not-italic">.</span>
    </h3>

    <p
      className={`text-[15px] leading-[1.55] mb-6 ${
        slot.accent ? 'text-background/80' : 'text-foreground/70'
      }`}
    >
      {slot.body}
    </p>

    <ul className="space-y-2.5 mb-7 flex-1">
      {slot.bullets.map((b) => (
        <li key={b} className={`flex items-start gap-3 text-[13.5px] leading-[1.5]`}>
          <span
            className={`mt-1.5 w-1.5 h-1.5 shrink-0 ${
              slot.accent ? 'bg-brand' : 'bg-foreground'
            }`}
          />
          <span className={slot.accent ? 'text-background/90' : 'text-foreground/85'}>{b}</span>
        </li>
      ))}
    </ul>

    <a
      href={slot.href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`appointment-${slot.id}-cta`}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] transition-all border-2 ${
        slot.accent
          ? 'bg-brand text-foreground border-brand hover:brightness-105 active:translate-y-px'
          : 'bg-foreground text-background border-foreground hover:bg-background hover:text-foreground'
      }`}
    >
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full font-black leading-none text-[13px] ${
          slot.accent ? 'bg-foreground text-brand' : 'bg-background text-foreground'
        }`}
        aria-hidden
      >
        +
      </span>
      <span>{slot.cta}</span>
    </a>
  </motion.article>
);

export const AppointmentBookingSection = () => (
  <section
    id="termin"
    aria-label="Termin buchen. Demo oder Beratung."
    data-testid="appointment-booking"
    className="relative w-full bg-background border-y border-foreground/15"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={FADE_UP}
        custom={0}
        className="max-w-2xl mb-12 md:mb-16"
      >
        <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-5 font-mono">
          ▸ SPRICH MIT JEMANDEM · BEIDE KOSTENLOS
        </p>
        <h2
          className="leading-[0.92] tracking-[-0.04em] text-foreground"
          style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 'clamp(40px, 5.5vw, 80px)',
          }}
        >
          Lieber direkt fragen<span className="text-brand not-italic">.</span>
        </h2>
        <p className="mt-6 max-w-xl text-[16px] md:text-[18px] leading-[1.55] text-foreground/70">
          Zwei Termine, beide kostenlos. Demo wenn du die App sehen willst.
          Beratung wenn du erst mit jemandem reden willst, bevor du
          entscheidest.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        {SLOTS.map((slot, i) => (
          <SlotCard key={slot.id} slot={slot} index={i} />
        ))}
      </div>

      <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono text-center">
        ▸ ANTWORT INNERHALB VON 24 H · MO BIS FR · EUROPA / BERLIN
      </p>
    </div>
  </section>
);
