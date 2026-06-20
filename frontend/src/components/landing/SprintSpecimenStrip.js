/**
 * SprintSpecimenStrip — single-line specimen plate that surfaces the
 * Sprint product directly beneath the Hero so it sits inside the
 * first viewport on desktop.
 *
 * The Hero sells the brand and the moment ("Sprint mit Wlad."). This
 * strip sells the offer in the same scroll position: BIB-code, price,
 * duration, what's included, guarantee, single CTA. No fluff, no
 * gradients, no decorative dots — just typography on a hairline.
 *
 * Layout family: editorial specimen table. Distinct from BenefitSection
 * (§-numbered chapters) and PricingLadder (tier-card grid), so it
 * doesn't repeat any other section's layout family.
 */
export const SprintSpecimenStrip = () => (
  <section
    id="sprint-specimen"
    aria-label="Sprint. 30 Tage. 997 €."
    data-testid="sprint-specimen-strip"
    className="relative w-full bg-background border-y border-foreground/12"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-5 md:py-6 flex flex-wrap md:flex-nowrap items-center gap-y-3 gap-x-6 md:gap-x-8">
      {/* Plain badge — anchors every Sprint mention without arcane symbols */}
      <div className="flex items-center gap-3 shrink-0">
        <span aria-hidden className="inline-flex items-center justify-center w-9 h-9 border-2 border-foreground font-mono text-[11px] font-black tracking-[0.06em] text-foreground">
          03
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/55 font-mono">
          SPRINT
        </span>
      </div>

      {/* Hairline separator, repeated visually as a column rule */}
      <span aria-hidden className="hidden md:inline-block w-px h-8 bg-foreground/15" />

      {/* Specs as a 4-column micro-table — tag above, value below */}
      <dl className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 min-w-0">
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Invest</dt>
          <dd className="text-[15px] md:text-[17px] font-black tracking-tight tabular-nums text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            997 €
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Dauer</dt>
          <dd className="text-[15px] md:text-[17px] font-black tracking-tight tabular-nums text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            30 Tage
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Inhalt</dt>
          <dd className="text-[13px] md:text-[14px] font-bold tracking-tight text-foreground/85">
            11 Frameworks · WladBot 24/7
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Garantie</dt>
          <dd className="text-[13px] md:text-[14px] font-bold tracking-tight text-foreground/85">
            14 Tage Geld zurück
          </dd>
        </div>
      </dl>

      {/* CTA — minimal but visible. Different from the Hero's outlined
          Sprint CTA so the two don't feel like the same button printed
          twice. */}
      <a
        href="https://leaderos.de/checkout?tier=sprint"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="sprint-specimen-cta"
        className="shrink-0 inline-flex items-center gap-2 bg-brand text-foreground hover:brightness-105 active:translate-y-px transition-all px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em]"
      >
        Sprint kaufen <span aria-hidden>→</span>
      </a>
    </div>
  </section>
);
