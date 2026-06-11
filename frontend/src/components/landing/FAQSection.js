import { useState } from 'react';
import { motion } from 'framer-motion';

const FAQS = [
  {
    q: 'Was bekomme ich am Ende von 30 Tagen — konkret?',
    a:
      'Ein klareres Bild davon, wie du führst — geprüft an dreißig realen Drills aus deinem Alltag. Eine Bibliothek von elf Frameworks, die du in jeder Verhandlung, jedem 1:1 und jedem Townhall sofort abrufen kannst. Ein WladBot, der deine Sprint-Historie kennt und in deiner Sprache antwortet. Und ein Zertifikat mit deiner BIB · 0001, das du auf LinkedIn teilen kannst, weil es zeigt, was du wirklich gelernt hast — nicht nur was du abgehakt hast.',
  },
  {
    q: 'Wie hilft mir der WladBot in einer realen Situation?',
    a:
      'Beispiel Dienstag 22:47 Uhr: morgen früh musst du einem Senior-Mitarbeiter zum dritten Mal das gleiche Feedback geben. Du tippst die Situation in den Bot. Er gibt dir nicht "10 Tipps", sondern den nächsten Satz — aus der Feedback-Formel (Beobachtung · Wirkung · Wunsch), abgestimmt auf das, was er über deinen Stil aus deinem Sprint weiß. Du gehst mit einem Skript ins Gespräch, nicht mit Bauchschmerzen.',
  },
  {
    q: 'Was passiert nach den 30 Tagen — bleibt das System?',
    a:
      'Ja. Du behältst lebenslangen Zugriff auf alle elf Frameworks, WladBot 24/7 in deiner Tasche und die Lernvideo-Bibliothek. Plus monatliche Live-Sessions mit Wlad und einen kleinen Strategie-Call. Der Sprint ist das Onboarding — das OS bleibt dein Werkzeug für die nächsten Jahre. Kein Abo-Lock-in: einmal gezahlt, dauerhaft drin.',
  },
  {
    q: 'Was kostet das genau?',
    a:
      'Die Diagnose auf leader-check.de ist und bleibt kostenlos. Der 30-Tage-Sprint kostet 997 € einmalig. Das OS-Jahr (Sprint + 12 Monate Komplettbegleitung mit Live-Sessions und Strategie-Call) kostet 4 797 € einmalig oder in drei Raten. Beides ohne Abo, ohne automatische Verlängerung. 14 Tage Geld-zurück-Garantie auf den Sprint, ohne Wenn und Aber.',
  },
  {
    q: 'Warum sollte ich für leader-check.de dieselbe Email nutzen?',
    a:
      'Weil leader-check.de und leader-os.de dieselbe Identität sehen, sobald du die gleiche Email-Adresse benutzt. Deine Diagnose-Scores aus dem Check fließen in deinen Sprint-Plan ein. Der WladBot weiß ab Tag 1, wo deine Schwächen liegen. Du musst nichts nochmal angeben. Andere Email = zwei getrennte Profile = keine Personalisierung.',
  },
  {
    q: 'Wie unterscheidet sich das von ChatGPT oder einem normalen Coaching?',
    a:
      'ChatGPT kennt das halbe Internet, aber nicht dich und nicht die Methodik. Ein 1-zu-1-Coach kennt dich, ist aber nicht um 22:47 Uhr verfügbar und kostet pro Stunde, was bei Leader-OS einen ganzen Sprint kostet. WladBot ist beides zusammen: trainiert auf 2 212 authentische Wlad-Chunks und einer Context-Schicht, die deinen Sprint, deine Frameworks-Historie und deine letzten Drills kennt.',
  },
  {
    q: 'Wie sicher sind meine Daten?',
    a:
      'DSGVO-konform, Server in der EU (Frankfurt). Deine Chats sind verschlüsselt und gehören dir — kein Training auf deinen Daten, kein Verkauf an Dritte. Du kannst dein Konto und alle Daten jederzeit mit einem Klick löschen.',
  },
  {
    q: 'Was, wenn ich merke, das ist nichts für mich?',
    a:
      '14 Tage Geld-zurück-Garantie auf den Sprint, ohne Begründungspflicht. Du schreibst kurz, wir erstatten. Bisher hat noch niemand zurückgefordert — aber die Garantie steht, damit du angstfrei starten kannst.',
  },
];

const Item = ({ faq, isOpen, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, delay: 0.04 * index, ease: [0.16, 1, 0.3, 1] }}
    className="border-b border-foreground/15"
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start gap-5 py-6 md:py-7 text-left group"
      aria-expanded={isOpen}
      data-testid={`faq-q-${index + 1}`}
    >
      <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono pt-1 shrink-0 w-10">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className="flex-1 text-[18px] md:text-[22px] leading-[1.25] tracking-[-0.015em] text-foreground"
        style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 700 }}
      >
        {faq.q}
      </span>
      <span
        className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full border transition-all ${
          isOpen
            ? 'bg-brand border-brand text-[#0A0A0A] rotate-45'
            : 'border-foreground/25 text-foreground group-hover:border-foreground/50'
        }`}
        aria-hidden
      >
        <span className="text-xl leading-none font-black">+</span>
      </span>
    </button>

    {isOpen && (
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="pl-15 ml-10 pr-12 md:pr-14 pb-6 md:pb-7 text-[14.5px] md:text-[15.5px] leading-[1.6] text-foreground/70"
      >
        {faq.a}
      </motion.p>
    )}
  </motion.div>
);

/**
 * FAQSection — objection-handling block. Six common questions answered
 * crisply in Wlad's direct German voice (du-form, concrete examples,
 * no corporate fluff). Accordion behaviour, first item open by default
 * to invite scrolling, others click-to-expand.
 */
export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section
      id="faq"
      className="relative w-full bg-background overflow-hidden border-t border-foreground/10"
      aria-label="Häufige Fragen"
      data-testid="faq-section"
    >
      <div className="max-w-[1080px] mx-auto px-5 md:px-10 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-12 md:mb-16"
        >
          <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-5 font-mono">
            ▸ HÄUFIGE FRAGEN · WAS DU WISSEN MUSST
          </p>
          <h2
            className="text-[40px] sm:text-[56px] md:text-[72px] leading-[0.92] tracking-[-0.04em] text-foreground"
            style={{
              fontFamily: 'Outfit, Inter, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
            }}
          >
            Antworten<span className="text-brand not-italic">.</span>
          </h2>
        </motion.div>

        <div role="list">
          {FAQS.map((faq, i) => (
            <Item
              key={faq.q}
              faq={faq}
              index={i}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
