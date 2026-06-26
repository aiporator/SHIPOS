const WLAD_QUOTES = [
  { q: "Wer klar kommuniziert, wird gehört. Wer gehört wird, führt.", t: "Kommunikation" },
  { q: "Leadership ist keine Position. Es ist eine tägliche Entscheidung.", t: "Mindset" },
  { q: "Die besten Leader hören doppelt so viel zu, wie sie reden.", t: "EQ" },
  { q: "Mut ist keine Abwesenheit von Angst · es ist die Entscheidung, trotzdem zu handeln.", t: "Mut" },
  { q: "Deine Mitarbeiter verlassen nicht Unternehmen. Sie verlassen schlechte Kommunikation.", t: "Kommunikation" },
  { q: "Ein guter Leader macht andere besser · nicht sich selbst wichtiger.", t: "Servant Leadership" },
  { q: "Feedback ist ein Geschenk. Wer es nicht annimmt, verpackt sein eigenes Wachstum.", t: "Feedback" },
  { q: "Strategie ohne Execution ist eine Halluzination.", t: "Execution" },
  { q: "Jeder Tag ohne Übung ist ein verlorener Tag. Dein Leadership-Muskel braucht Training.", t: "Disziplin" },
  { q: "Die Zukunft gehört den Führungskräften, die KI strategisch einsetzen · nicht denen, die sie ignorieren.", t: "KI & Leadership" },
  { q: "Emotionale Intelligenz ist kein Soft Skill. Es ist der härteste Skill, den du lernen kannst.", t: "EQ" },
  { q: "Delegieren heißt nicht loslassen · es heißt vertrauen und befähigen.", t: "Delegation" },
  { q: "In Krisen zeigt sich, wer wirklich führt. Und wer nur verwaltet.", t: "Krisenmanagement" },
  { q: "Dein Team spiegelt deine Energie. Willst du Exzellenz? Lebe sie vor.", t: "Vorbild" },
  { q: "Verhandeln lernt man nicht in Büchern. Man lernt es, indem man es tut · wieder und wieder.", t: "Verhandlung" },
  { q: "Die besten Entscheidungen trifft man nicht allein. Aber die Verantwortung trägst du allein.", t: "Entscheidungen" },
  { q: "Schwarze Rhetorik erkennen heißt, sich nicht mehr manipulieren zu lassen.", t: "Rhetorik" },
  { q: "Ein klares Nein ist mehr wert als ein halbherziges Ja.", t: "Klarheit" },
  { q: "Konsistenz schlägt Talent. Jeden Tag 1% besser · das ist die Formel.", t: "Wachstum" },
  { q: "Wer aufhört besser zu werden, hat aufgehört gut zu sein.", t: "Mindset" },
];

export const getWladQuote = (seed) => {
  const idx = seed !== undefined ? seed % WLAD_QUOTES.length : Math.floor(Math.random() * WLAD_QUOTES.length);
  return WLAD_QUOTES[idx];
};

export const getDailyQuote = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return WLAD_QUOTES[dayOfYear % WLAD_QUOTES.length];
};

export default WLAD_QUOTES;
