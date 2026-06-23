/**
 * TrialSpecimenStrip · single-line specimen plate that surfaces the
 * 14-day-trial entry directly beneath the Hero.
 *
 * The Hero sells the moment ("Vierzehn Tage kostenlos."). This strip
 * sells the no-friction entry in the same scroll position: trial
 * length, what's included, no card needed, single CTA. Sprint pricing
 * lives further down in PricingLadder, not here.
 *
 * Layout family: editorial specimen table. Distinct from BenefitSection
 * (§-numbered chapters) and PricingLadder (tier-card grid), so it
 * doesn't repeat any other section's layout family.
 */
export const SprintSpecimenStrip = () => (
  <section
    id="trial-specimen"
    aria-label="14 Tage kostenlos testen. Ohne Karte."
    data-testid="sprint-specimen-strip"
    className="relative w-full bg-background border-y border-foreground/12"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-5 md:py-6 flex flex-col md:flex-row md:flex-nowrap items-center md:items-center gap-y-4 md:gap-y-0 md:gap-x-8 text-center md:text-left">
      {/* Plain badge · anchors the trial entry without arcane symbols */}
      <div className="flex items-center justify-center gap-3 shrink-0">
        <span aria-hidden className="inline-flex items-center justify-center w-9 h-9 border-2 border-foreground font-mono text-[11px] font-black tracking-[0.06em] text-foreground">
          00
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/55 font-mono">
          TRIAL
        </span>
      </div>

      {/* Hairline separator, repeated visually as a column rule */}
      <span aria-hidden className="hidden md:inline-block w-px h-8 bg-foreground/15" />

      {/* Specs as a 4-column micro-table · tag above, value below */}
      <dl className="w-full md:flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 min-w-0">
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Einstieg</dt>
          <dd className="text-[15px] md:text-[17px] font-black tracking-tight tabular-nums text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            0 €
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Dauer</dt>
          <dd className="text-[15px] md:text-[17px] font-black tracking-tight tabular-nums text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            14 Tage
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Inhalt</dt>
          <dd className="text-[13px] md:text-[14px] font-bold tracking-tight text-foreground/85">
            Volle Plattform · WladBot 24/7
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mb-0.5">Karte</dt>
          <dd className="text-[13px] md:text-[14px] font-bold tracking-tight text-foreground/85">
            Nicht nötig · jederzeit kündbar
          </dd>
        </div>
      </dl>

      {/* CTA · minimal but visible. Different from the Hero's outlined
          diagnose CTA so the two don't feel like the same button printed
          twice. */}
      <a
        href="https://leaderos.de/signup?trial=14"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="sprint-specimen-cta"
        className="shrink-0 inline-flex items-center gap-2 bg-brand text-foreground hover:brightness-105 active:translate-y-px transition-all px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em]"
      >
        Jetzt starten <span aria-hidden>→</span>
      </a>
    </div>
  </section>
);
