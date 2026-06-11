import { motion } from 'framer-motion';
import { LANDING_META } from '../../data/landingAssets';
import { PlusCircleCTA } from './PlusCircleCTA';

/**
 * FinalCTA — closing black wall, "BIB 0001 STARTEN" hero.
 *
 * Inspired by the Nike "TIME FOR WORK" poster + Electric Hydrogen's
 * final mission section. Massive Outfit Black headline, lime hairline
 * accent, single lime plus-CTA. Two scroll-snap anchors so this is the
 * cleanest exit ramp on the page.
 */
export const FinalCTA = () => (
  <section
    id="final-cta"
    className="relative w-full bg-[#0A0A0A] text-white overflow-hidden"
    aria-label="Bewerbe dich für Class 0001"
    data-testid="landing-final-cta"
  >
    {/* Atmospheric lime mesh — subtle, no distraction */}
    <div
      aria-hidden
      className="absolute inset-0 opacity-60"
      style={{
        backgroundImage:
          'radial-gradient(at 80% 0%, rgba(191,255,0,0.10) 0px, transparent 50%), radial-gradient(at 15% 90%, rgba(191,255,0,0.06) 0px, transparent 55%)',
      }}
    />

    <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-10 py-28 md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl"
      >
        <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-6 font-mono">
          ▸ BIB 0001 · JETZT OFFEN
        </p>

        <h2
          className="text-[44px] sm:text-[64px] md:text-[88px] lg:text-[112px] leading-[0.92] tracking-[-0.04em] text-white"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Wer heute zögert,<br />
          <span className="text-white/55">führt morgen unter jemandem,</span><br />
          der nicht gezögert hat<span className="text-brand not-italic">.</span>
        </h2>

        <p className="mt-10 max-w-2xl text-[15px] md:text-[17px] leading-[1.55] text-white/75">
          Elf Frameworks. Ein OS. Dreißig Tage. Sichere dir BIB 0001 —
          Wlads Methodik live, jeden Tag, in deiner Tasche.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <PlusCircleCTA
            href={LANDING_META.cta.primary.href}
            testId="final-cta-primary"
            className="text-white"
          >
            {LANDING_META.cta.primary.label}
          </PlusCircleCTA>
          <PlusCircleCTA
            href="https://cal.com/leaderos/demo"
            testId="final-cta-demo"
            className="text-white/85 hover:text-white"
          >
            Demo buchen · 20 Min
          </PlusCircleCTA>
          <PlusCircleCTA
            href="https://cal.com/leaderos/beratung"
            testId="final-cta-beratung"
            className="text-white/85 hover:text-white"
          >
            Beratung · 30 Min
          </PlusCircleCTA>
          <PlusCircleCTA
            to={LANDING_META.cta.secondary.href}
            testId="final-cta-secondary"
            external={false}
            className="text-white/55 hover:text-white"
          >
            Bereits Mitglied? Anmelden
          </PlusCircleCTA>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/45 max-w-3xl">
          <span>▸ 11 Frameworks</span>
          <span>▸ 30 Tage Sprint</span>
          <span>▸ 24/7 Coach</span>
          <span>▸ Zertifikat 0001</span>
        </div>

        {/* Investment-Strip — leise, ein dezenter Specimen-Tape unter
            den Pills. Wer den Preis sucht, findet ihn. Wer nicht, wird
            nicht angeschrien. */}
        <div className="mt-10 pt-5 border-t border-white/10 max-w-3xl flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.22em] font-mono text-white/40">
          <span className="text-brand">▸ INVESTITION</span>
          <span>DIAGNOSE · KOSTENLOS</span>
          <span className="text-white/20">/</span>
          <span>30-TAGE-SPRINT · 997 €</span>
          <span className="text-white/20">/</span>
          <span>OS · JAHR · 4 797 €</span>
        </div>
      </motion.div>
    </div>
  </section>
);
