import { motion } from 'framer-motion';
import { LANDING_META } from '../../data/landingAssets';
import { PlusCircleCTA } from './PlusCircleCTA';
import { useGsapScrollIn } from './motion/useGsapScrollIn';

// The closing headline as data so the word-reveal motion can target
// individual word spans without breaking the existing typographic tone.
const CLOSING_LINES = [
  { text: 'Wer heute zögert,', tone: 'fg' },
  { text: 'führt morgen unter jemandem,', tone: 'muted' },
  { text: 'der nicht gezögert hat.', tone: 'fg' },
];

/**
 * FinalCTA · closing black wall, "BIB 0001 STARTEN" hero.
 *
 * Inspired by the Nike "TIME FOR WORK" poster + Electric Hydrogen's
 * final mission section. Massive Outfit Black headline, lime hairline
 * accent, single lime plus-CTA. Two scroll-snap anchors so this is the
 * cleanest exit ramp on the page.
 */
export const FinalCTA = () => {
  // Word-by-word opacity scrub on the closing headline. The line is
  // long and rhetorical; scrubbing forces the eye to read it as a
  // sentence rather than as a typographic block.
  const headlineRef = useGsapScrollIn('word-reveal', { selector: '[data-word]' });

  return (
  <section
    id="final-cta"
    className="relative w-full bg-[#0A0A0A] text-white overflow-hidden"
    aria-label="Starte deine Leader-OS Reise"
    data-testid="landing-final-cta"
  >
    {/* Atmospheric lime mesh · subtle, no distraction */}
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
        <h2
          ref={headlineRef}
          className="text-[44px] sm:text-[64px] md:text-[88px] lg:text-[112px] leading-[0.92] tracking-[-0.04em] text-white"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          {CLOSING_LINES.map((line, lineIdx) => (
            <span key={lineIdx} className={lineIdx > 0 ? 'block' : 'inline-block'}>
              {line.text.split(/(\s+)/).map((token, tokenIdx) => {
                if (/^\s+$/.test(token)) return <span key={tokenIdx}>{token}</span>;
                const isLast = lineIdx === CLOSING_LINES.length - 1 && token.endsWith('.');
                const display = isLast ? token.replace(/\.$/, '') : token;
                return (
                  <span
                    key={tokenIdx}
                    data-word
                    className={`inline-block ${line.tone === 'muted' ? 'text-white/55' : 'text-white'}`}
                  >
                    {display}
                    {isLast && <span className="text-brand not-italic">.</span>}
                  </span>
                );
              })}
            </span>
          ))}
        </h2>

        <p className="mt-10 max-w-2xl text-center md:text-left mx-auto md:mx-0 text-[15px] md:text-[17px] leading-[1.55] text-white/75">
          Mach den kostenlosen Leader-Check · zehn Minuten, dein Score
          sofort. Dann vierzehn Tage Leader-OS testen, ohne Karte, ohne
          Risiko. Erst wenn es für dich passt, sicherst du deinen Platz
          in Charter 0001.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row flex-wrap items-center sm:items-center justify-center md:justify-start gap-y-4 sm:gap-x-8">
          {/* Primary · der einzige mit Halo-Pulse damit die Hierarchie klar ist */}
          <PlusCircleCTA
            href={LANDING_META.cta.primary.href}
            testId="final-cta-primary"
            className="text-white"
          >
            {LANDING_META.cta.primary.label}
          </PlusCircleCTA>
          <PlusCircleCTA
            href={LANDING_META.cta.diagnose.href}
            testId="final-cta-diagnose"
            halo={false}
            className="text-white/85 hover:text-white"
          >
            Diagnose · 10 Min · kostenlos
          </PlusCircleCTA>
          <PlusCircleCTA
            href={LANDING_META.cta.secondary.href}
            testId="final-cta-secondary"
            halo={false}
            className="text-white/55 hover:text-white"
          >
            Bereits Mitglied? Anmelden
          </PlusCircleCTA>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/45 max-w-3xl text-center md:text-left mx-auto md:mx-0">
          <span>▸ 14 Tage Trial</span>
          <span>▸ 11 Frameworks</span>
          <span>▸ 24/7 Coach</span>
          <span>▸ Zertifikat 0001</span>
        </div>

        {/* Specimen-tape unter den Pills · ohne Preis. Wer Preise sehen
            will, scrollt hoch zu PricingLadder. Hier zählt der Einstieg. */}
        <div className="mt-10 pt-5 border-t border-white/10 max-w-3xl mx-auto md:mx-0 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.22em] font-mono text-white/40">
          <span className="text-brand">▸ EINSTIEG</span>
          <span>14 TAGE · KOSTENLOS</span>
          <span className="text-white/20">/</span>
          <span>OHNE KARTE</span>
          <span className="text-white/20">/</span>
          <span>JEDERZEIT KÜNDBAR</span>
        </div>
      </motion.div>
    </div>
  </section>
  );
};
