// Leader-OS Landing-Page content — Direction A LOCKED.
//
// Athletic Editorial × Heron-Preston specimen-sheet aesthetic.
// PURE TYPOGRAPHY — no external image dependencies. Every visual is
// rendered with type, BIB-codes, hairline borders, and the lime
// plus-circle CTA signature. Bulletproof loading, infinite scaling.

export const LANDING_META = {
  title: 'Leader-OS — Werde KI-nativ. Das OS für Führungskräfte.',
  description:
    'Elf Frameworks. Ein OS. WladBot-Coach 24/7. 30-Tage-Sprint. ' +
    'Wlad Jachtchenkos Methodik live in deiner Tasche. Starte mit ' +
    'der kostenlosen Diagnose auf leader-check.de.',
  url: 'https://leader-os.de',
  slogan: 'Werde KI-nativ.',
  cohort: '0001',
  bib: 'BIB · 0001',
  cta: {
    primary: { label: 'Diagnose starten', href: 'https://leader-check.de' },
    secondary: { label: 'Login', href: '/login' },
  },
};

// 3-step flow — the explicit user journey from leader-check.de → OS
export const HOW_IT_WORKS = [
  {
    nr: '01',
    code: 'DIAGNOSE',
    duration: '5 MIN · KOSTENLOS',
    title: 'Wo stehst du?',
    body:
      'Starte auf leader-check.de mit der kostenlosen KI-Diagnose. ' +
      'Drei Dimensionen: KI-Readiness · Rhetorik · Emotionale Intelligenz. ' +
      'Du bekommst sofort deinen Score plus konkrete Empfehlung.',
    cta: 'Jetzt diagnostizieren',
    href: 'https://leader-check.de',
    external: true,
  },
  {
    nr: '02',
    code: 'SPRINT',
    duration: '30 TAGE · GEFÜHRT',
    title: 'Dein personalisierter Plan.',
    body:
      'Basierend auf deiner Diagnose: jeden Tag eine Aufgabe, ' +
      'ein Framework, ein Drill. WladBot begleitet dich mit Wlads ' +
      'Methodik. Am Ende: dein Zertifikat.',
    cta: 'Sprint kennenlernen',
    href: 'https://leader-check.de',
    external: true,
  },
  {
    nr: '03',
    code: 'OS',
    duration: 'LEBENSLANG · OFFEN',
    title: 'Dein Operating System.',
    body:
      'Nach dem Sprint: voller Zugriff auf alle elf Frameworks, ' +
      'WladBot 24/7, monatliche Live-Sessions mit Wlad und das ' +
      'Leader-OS-Netzwerk.',
    cta: 'OS erkunden',
    href: '/login',
    external: false,
  },
];

// 7 benefits — pure typography sections, specimen-sheet style.
// Each becomes a Heron-Preston-DNA editorial card.
export const LANDING_BENEFITS = [
  {
    nr: '01',
    code: 'INHALT',
    headline: 'Elf Frameworks.',
    headlineAccent: 'Ein OS.',
    body:
      'SEXIER. Fünf Rollen. Feedbackformel. Drei Säulen. Zehn Stufen. ' +
      'Kommunikationsquadrant. Dunkle Rhetorik. Vier-Farben-Modell. ' +
      'Schlagfertigkeit. ALPEN. Verhandlung.',
    detail: [
      ['01', 'SEXIER',           'Argumentations-Modell'],
      ['02', '5 ROLLEN',         'Führungskraft-Identität'],
      ['03', 'FEEDBACK',         'Beobachtung · Wirkung · Wunsch'],
      ['04', '3 SÄULEN',         'Logos · Ethos · Pathos'],
      ['05', '10 STUFEN',        'Zuhör-Hierarchie'],
      ['06', 'KOMM-QUAD',        'Schulz von Thun'],
      ['07', 'DUNKLE RHETORIK',  'Manipulation erkennen'],
      ['08', '4-FARBEN',         'Persönlichkeits-Typen'],
      ['09', 'SCHLAGFERTIG',     'Verbale Reflexe'],
      ['10', 'ALPEN',            'Zeit-Methodik'],
      ['11', 'VERHANDLUNG',      'Harvard-Methode'],
    ],
    cta: 'Alle Frameworks ansehen',
    href: 'https://leader-check.de',
  },
  {
    nr: '02',
    code: 'IMMER WACH',
    headline: '24 Stunden.',
    headlineAccent: '7 Tage.',
    body:
      'WladBot kennt Wlads Methodik in- und auswendig. ' +
      'Für jede Führungs-Situation. Jederzeit. Mit deinem Kontext, ' +
      'in deinem Ton.',
    detail: [
      ['HRS', 'VERFÜGBARKEIT',  '24 / 7 / 365'],
      ['LNG', 'SPRACHE',        'Deutsch · English'],
      ['LAG', 'ANTWORTZEIT',    '< 3 Sekunden'],
      ['VOI', 'VOICE-CHAT',     'Live-Telefonat mit Wlad'],
    ],
    cta: 'WladBot starten',
    href: 'https://leader-check.de',
  },
  {
    nr: '03',
    code: 'SPRINT',
    headline: 'Dreißig Tage.',
    headlineAccent: 'Ein neues Du.',
    body:
      'Jeden Tag eine Frage. Jeden Tag ein Drill. ' +
      'Jeden Tag etwas näher an der Führungskraft die du werden willst. ' +
      'Personalisiert auf deine Diagnose.',
    detail: [
      ['D01–10', 'BASIS',     'Frameworks lernen'],
      ['D11–20', 'DRILL',     'In Simulationen anwenden'],
      ['D21–30', 'TRANSFER',  'Im echten Alltag testen'],
      ['D30',    'ZERTIFIKAT','Persönlich · LinkedIn-ready'],
    ],
    cta: 'Sprint starten',
    href: 'https://leader-check.de',
  },
  {
    nr: '04',
    code: 'AUTHENTIZITÄT',
    headline: 'Wlads Methodik.',
    headlineAccent: 'Live.',
    body:
      'Wlad Jachtchenko. Vierhunderttausend Kunden weltweit. ' +
      'Drei SPIEGEL-Bestseller. Vierzehn Millionen Views. ' +
      'Staatlich zertifizierte Argumentorik-Ausbildung. Jetzt live.',
    detail: [
      ['BOOKS', 'BESTSELLER',     'Weiße Rhetorik · Dunkle Rhetorik · 5 Rollen'],
      ['CERT',  'AUSBILDUNG',     'Staatlich · sechs Monate'],
      ['REACH', 'PUBLIKUM',       '14 Millionen Views · Podcast & YouTube'],
      ['SCALE', 'KUNDEN',         '400 000 weltweit'],
    ],
    cta: 'Mehr über Wlad',
    href: 'https://leader-check.de',
  },
  {
    nr: '05',
    code: 'TRUST',
    headline: 'Vierhunderttausend.',
    headlineAccent: 'Vierzehn Millionen.',
    body:
      'Kunden weltweit haben Wlads Methode gelernt. ' +
      'Vierzehn Millionen Views auf seinem Podcast und YouTube. ' +
      'Europas führender Argumentations-Coach.',
    detail: [
      ['400K', 'KUNDEN',          'In 20+ Ländern'],
      ['14M',  'VIEWS',           'Podcast „Menschen überzeugen" + YouTube'],
      ['3×',   'SPIEGEL-BESTS.',  'Veröffentlichte Bücher'],
      ['12',   'BÜCHER GESAMT',   '250K+ Verkäufe'],
    ],
    cta: 'Mehr Beweise',
    href: 'https://leader-check.de',
  },
  {
    nr: '06',
    code: 'ZERTIFIKAT',
    headline: 'Zertifikat',
    headlineAccent: '0001.',
    body:
      'Jeder abgeschlossene Sprint endet mit einem persönlichen Zertifikat. ' +
      'Auf LinkedIn teilen oder dem nächsten Arbeitgeber zeigen. ' +
      'Kohorten-Nummer als BIB-Code lebenslang.',
    detail: [
      ['ID',    'STARTNUMMER',    'BIB · 0001 · KOHORTE 01'],
      ['FRAME', 'INHALT',         '11 Frameworks gemeistert'],
      ['SIGN',  'UNTERSCHRIFT',   'Wlad Jachtchenko persönlich'],
      ['LNKD',  'TEILBAR',        'Sofort auf LinkedIn'],
    ],
    cta: 'Erstes Zertifikat freischalten',
    href: 'https://leader-check.de',
  },
  {
    nr: '07',
    code: 'TECH',
    headline: 'Powered by',
    headlineAccent: 'WladBot.',
    body:
      'Voyage-3 Embeddings auf 2212 authentischen Wlad-Chunks. ' +
      'Hybrid Retrieval. GPT-5.2. Antwortet in Wlads Stimme, ' +
      'mit Wlads Frameworks, auf deine konkrete Situation.',
    detail: [
      ['MDL', 'LLM',             'GPT-5.2'],
      ['EMB', 'EMBEDDINGS',      'Voyage-3 · 2212 Chunks'],
      ['RET', 'RETRIEVAL',       'Vector + Lexical · RRF'],
      ['RAG', 'AUTHENTIZITÄT',   'Nur Wlads Originalmaterial'],
    ],
    cta: 'WladBot kennenlernen',
    href: 'https://leader-check.de',
    dark: true,
  },
];
