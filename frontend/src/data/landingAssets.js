// Leader-OS Landing-Page content — Mockup-aligned (Direction A v2).
// Athletic Editorial × Heron-Preston specimen-sheet aesthetic.
//
// PHOTO STRATEGY:
//   Editorial photos live in /public/landing/ (hf-01.png … hf-07.png),
//   bundled by CRA and served from leader-os.de's own CDN. picsum.photos
//   is the fallback for sections whose final shoot is still pending.
//   Each photo is content-agnostic — the meaning comes from the
//   SPECIMEN frame around it (BIB code, eyebrow, metadata table).
//
// VISUAL VARIANTS:
//   Each benefit can opt into a distinct visual treatment via `variant`:
//     'photo'  — default: editorial photo inside specimen frame
//     'bib'    — typographic BIB 0001 startnummer plate (no photo)
//     'trust'  — giant 400K · 14M numbers + small book image
//   Variants drive BenefitVisual.js — adding a new variant means
//   teaching that file, not bolting CSS overrides onto sections.

const photo = (seed, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${encodeURIComponent('leader-os-' + seed)}/${w}/${h}?grayscale`;

// Local editorial assets — bundled with the frontend build.
const local = (file) => `/landing/${file}`;

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

// 5 benefits — order matches mockup specimen-sheets:
//   01 INHALT          → Frameworks-Katalog (track photo)
//   02 IMMER WACH      → WladBot 24/7 (phone-in-hand photo)
//   03 SPRINT          → 30-Tage-Transformation (BIB-plate, no photo)
//   04 AUTHENTIZITÄT   → Wlad (editorial portrait)
//   05 TRUST           → 400K + 14M + 3× Bestseller (big-numbers variant)
export const LANDING_BENEFITS = [
  {
    nr: '01',
    code: 'INHALT',
    eyebrow: 'BENEFIT 01 · INHALT',
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
    variant: 'photo',
    photo: photo('01-frameworks-track'),
  },
  {
    nr: '02',
    code: 'COACH',
    eyebrow: 'BENEFIT 02 · IMMER WACH',
    headline: '24 Stunden.',
    headlineAccent: '7 Tage.',
    subline: 'Dein KI-Coach wartet nie bis Montag.',
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
    variant: 'photo',
    photo: photo('02-coach-phone'),
  },
  {
    nr: '03',
    code: 'SPRINT',
    eyebrow: 'BENEFIT 03 · SPRINT',
    headline: 'Dreißig Tage.',
    headlineAccent: 'Ein neues Du.',
    subline: 'Startnummer für deine Führungs-Evolution.',
    body:
      'Jeden Tag eine Frage. Jeden Tag ein Drill. Jeden Tag etwas ' +
      'näher an der Führungskraft, die du werden willst. ' +
      'Am Ende: dein persönliches Zertifikat 0001.',
    detail: [
      ['ID',    'STARTNUMMER',    'BIB · 0001 · KOHORTE 01'],
      ['DAY',   'TÄGLICH',        '1 Frage · 1 Drill · 1 Reflexion'],
      ['END',   'ABSCHLUSS',      'Zertifikat 0001 · LinkedIn-ready'],
      ['SIGN',  'UNTERSCHRIFT',   'Wlad Jachtchenko persönlich'],
    ],
    cta: 'Sprint starten',
    href: 'https://leader-check.de',
    variant: 'bib',
  },
  {
    nr: '04',
    code: 'WLAD',
    eyebrow: 'BENEFIT 04 · AUTHENTIZITÄT',
    headline: 'Wlads Methodik.',
    headlineAccent: 'Live.',
    body:
      'Fünfhunderttausend Kunden haben seine Methode gelernt. ' +
      'Drei SPIEGEL-Bestseller. Vierzehn Millionen Views. ' +
      'Jetzt direkt in deiner Tasche.',
    detail: [
      ['NAM', 'WLAD JACHTCHENKO', 'Europas führender Argumentations-Coach'],
      ['MAT', 'METHODIK',         'Authentische Wlad-Frameworks'],
      ['VOI', 'STIMME',           'Antwortet in Wlads Ton'],
      ['CTX', 'KONTEXT',          'Deine Situation, sein Wissen'],
    ],
    cta: 'Mehr über Wlad',
    href: 'https://leader-check.de',
    variant: 'photo',
    photo: local('hf-07.png'),
    photoFit: 'portrait',
  },
  {
    nr: '05',
    code: 'TRUST',
    eyebrow: 'BENEFIT 05 · TRUST',
    headline: '400 Tausend.',
    headlineAccent: '14 Millionen.',
    body:
      'Kunden weltweit haben seine Methode gelernt. ' +
      'Vierzehn Millionen Views auf seinem Podcast und YouTube. ' +
      'Drei SPIEGEL-Bestseller. Zwölf Bücher gesamt.',
    detail: [
      ['400K', 'KUNDEN',          'In 20+ Ländern'],
      ['14M',  'VIEWS',           'Podcast + YouTube'],
      ['3×',   'SPIEGEL-BESTS.',  'Weiße Rhetorik · Dunkle Rhetorik · 5 Rollen'],
      ['12',   'BÜCHER GESAMT',   '250 000+ Verkäufe'],
      ['ZERT', 'AUSBILDUNG',      'Staatlich · sechs Monate'],
    ],
    cta: 'Mehr Beweise',
    href: 'https://leader-check.de',
    variant: 'trust',
    photo: local('hf-05.png'),
    trustNumbers: [
      { big: '400', suffix: 'TAUSEND', caption: 'Kunden weltweit' },
      { big: '14',  suffix: 'MILLIONEN', caption: 'Views Podcast + YouTube' },
    ],
  },
];

// Hero photo — large editorial backdrop. Same picsum seed approach.
export const HERO_PHOTO = photo('hero', 1600, 2000);
