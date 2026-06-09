// Leader-OS Landing-Page content — Direction A LOCKED.
// Athletic Editorial × Heron-Preston specimen-sheet aesthetic.
//
// PHOTOS: served from picsum.photos with stable per-section seeds.
// They always load (no auth, no rate-limit, served via Fastly CDN)
// and arrive grayscale so the editorial B&W is enforced at the
// source, not via CSS. Each photo is content-agnostic — the meaning
// comes from the SPECIMEN frame around it (BIB code, eyebrow,
// metadata table). Trade: not topical photos, won topical reliability.

const photo = (seed, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${encodeURIComponent('leader-os-' + seed)}/${w}/${h}?grayscale`;

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

// 3-step path — Diagnose → Sprint → OS. Stays as-is, it's a clear flow.
export const HOW_IT_WORKS = [
  {
    nr: '01',
    code: 'DIAGNOSE',
    duration: '5 MIN · KOSTENLOS',
    title: 'Wo stehst du?',
    body:
      'Starte auf leader-check.de mit der kostenlosen KI-Diagnose. ' +
      'Drei Dimensionen: KI-Readiness, Rhetorik, Emotionale Intelligenz. ' +
      'Du bekommst sofort deinen Score plus konkrete Empfehlung.',
    cta: 'Jetzt diagnostizieren',
    href: 'https://leader-check.de',
    external: true,
  },
  {
    nr: '02',
    code: 'SPRINT',
    duration: '30 TAGE · BEGLEITET',
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

// 5 benefits (was 7) — sprint+wlad+trust merged into a single Wlad-block
// to eliminate overlap with HowItWorks Step 02. Cleaner narrative, each
// section answers one distinct question.
export const LANDING_BENEFITS = [
  {
    nr: '01',
    code: 'INHALT',
    eyebrow: 'BENEFIT 01 · WAS DU LERNST',
    headline: 'Elf Frameworks.',
    headlineAccent: 'Ein OS.',
    body:
      'SEXIER. Fünf Rollen. Feedbackformel. Drei Säulen. Zehn Stufen. ' +
      'Kommunikationsquadrant. Dunkle Rhetorik. Vier-Farben-Modell. ' +
      'Schlagfertigkeit. ALPEN. Verhandlung. Alle in einem System.',
    detail: [
      ['01', 'SEXIER',           'Argumentations-Modell'],
      ['02', '5 ROLLEN',         'Identität'],
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
    photo: photo('01-frameworks'),
  },
  {
    nr: '02',
    code: 'COACH',
    eyebrow: 'BENEFIT 02 · WANN ER DA IST',
    headline: '24 Stunden.',
    headlineAccent: '7 Tage.',
    body:
      'WladBot kennt Wlads Methodik in- und auswendig. ' +
      'Für jede Leadership-Situation. Jederzeit. ' +
      'Mit deinem Kontext, in deinem Ton.',
    detail: [
      ['HRS', 'VERFÜGBARKEIT',  '24 / 7 / 365'],
      ['LNG', 'SPRACHE',        'Deutsch · English'],
      ['LAG', 'ANTWORTZEIT',    '< 3 Sekunden'],
      ['VOI', 'VOICE-CHAT',     'Live-Telefonat mit WladBot'],
    ],
    cta: 'WladBot starten',
    href: 'https://leader-check.de',
    photo: photo('02-coach'),
  },
  {
    nr: '03',
    code: 'WLAD',
    eyebrow: 'BENEFIT 03 · WER DAHINTER STECKT',
    headline: 'Wlads Methodik.',
    headlineAccent: 'Live.',
    body:
      'Wlad Jachtchenko. Vierhunderttausend Kunden weltweit. ' +
      'Drei SPIEGEL-Bestseller. Vierzehn Millionen Views auf ' +
      'Podcast und YouTube. Staatlich zertifizierte Argumentorik-Ausbildung.',
    detail: [
      ['400K', 'KUNDEN',          'In 20+ Ländern'],
      ['14M',  'VIEWS',           'Podcast + YouTube'],
      ['3×',   'SPIEGEL-BESTS.',  'Weiße Rhetorik · Dunkle Rhetorik · 5 Rollen'],
      ['12',   'BÜCHER GESAMT',   '250 000+ Verkäufe'],
      ['ZERT', 'AUSBILDUNG',      'Staatlich · sechs Monate'],
    ],
    cta: 'Mehr über Wlad',
    href: 'https://leader-check.de',
    photo: photo('03-wlad'),
  },
  {
    nr: '04',
    code: 'CERT',
    eyebrow: 'BENEFIT 04 · WAS DU ERHÄLTST',
    headline: 'Zertifikat',
    headlineAccent: '0001.',
    body:
      'Jeder abgeschlossene Sprint endet mit einem persönlichen Zertifikat. ' +
      'Auf LinkedIn teilen oder dem nächsten Arbeitgeber zeigen. ' +
      'Circle-Nummer als BIB-Code lebenslang.',
    detail: [
      ['ID',    'STARTNUMMER',    'BIB · 0001 · CIRCLE 01'],
      ['FRAME', 'INHALT',         '11 Frameworks gemeistert'],
      ['SIGN',  'UNTERSCHRIFT',   'Wlad Jachtchenko persönlich'],
      ['LNKD',  'TEILBAR',        'Sofort auf LinkedIn'],
    ],
    cta: 'Erstes Zertifikat freischalten',
    href: 'https://leader-check.de',
    photo: photo('04-zertifikat'),
  },
  {
    nr: '05',
    code: 'TECH',
    eyebrow: 'BENEFIT 05 · DER MASCHINENRAUM',
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
    photo: photo('05-tech'),
    dark: true,
  },
];

// Hero photo — large editorial backdrop. Same picsum seed approach.
export const HERO_PHOTO = photo('hero', 1600, 2000);
