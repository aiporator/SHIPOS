import { useState } from 'react';
import { motion } from 'framer-motion';

const FAQS = [
  {
    q: 'Was kostet Leader-OS?',
    a:
      'Die Diagnose auf leader-check.de ist kostenlos. Danach gibt es drei Pakete — Sprint, OS und OS Plus. Konkrete Preise siehst du nach der Diagnose, weil wir dir das passende Paket empfehlen. Faustregel: deutlich günstiger als ein einziges 1-zu-1-Coaching beim Top-Coach. Bezahlung einmalig oder in Raten, keine Abo-Falle.',
  },
  {
    q: 'Wie unterscheidet sich WladBot von ChatGPT?',
    a:
      'ChatGPT kennt das halbe Internet, aber nicht Wlads Methodik. WladBot antwortet ausschließlich auf Basis von 2 212 authentischen Wlad-Chunks aus seinen Büchern, Kursen und Vorträgen. Du bekommst SEXIER mit allen sechs Schritten, die 5 Rollen exakt wie sie Wlad lehrt — kein generic Tipp-Salat. Plus: WladBot kennt deinen Kontext und deine Sprint-Historie.',
  },
  {
    q: 'Wer ist Wlad Jachtchenko?',
    a:
      'Wlad ist Europas bekanntester Argumentations-Coach. 400 000 Kunden in 20+ Ländern. Drei SPIEGEL-Bestseller (Weiße Rhetorik, Dunkle Rhetorik, 5 Rollen). Vierzehn Millionen Views auf seinem Podcast „Menschen überzeugen" und YouTube. Staatlich zertifizierte Argumentorik-Ausbildung. Seine Methodik ist die DNA von Leader-OS.',
  },
  {
    q: 'Was passiert nach dem 30-Tage-Sprint?',
    a:
      'Du behältst lebenslang Zugriff auf alle 11 Frameworks, WladBot 24/7 und das Leader-OS-Netzwerk. Plus monatliche Live-Sessions mit Wlad. Dein Sprint ist der Onboarding — das OS bleibt dein Werkzeug für die nächsten Jahre.',
  },
  {
    q: 'Wie sicher sind meine Daten?',
    a:
      'DSGVO-konform. Server in der EU (Frankfurt). Deine Chats sind Ende-zu-Ende verschlüsselt und gehören dir — kein Training auf deinen Daten, kein Verkauf an Dritte. Du kannst alles jederzeit löschen.',
  },
  {
    q: 'Was ist wenn es mir nichts bringt?',
    a:
      '14 Tage Geld-zurück-Garantie auf den Sprint, ohne Wenn und Aber. Du sagst Bescheid, wir erstatten. Bisher noch keine Rückforderung — aber die Garantie steht.',
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
