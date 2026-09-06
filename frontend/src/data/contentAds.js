// Paid-Ad-Creatives · Netflix-Bites-DNA für LeaderOS.
//
// Look: ein einziger saturierter Farbblock, gecroppter Mensch im
// Moment der Aktion (lesen · sprechen · entscheiden · zuhören),
// XXL Tracked-Uppercase-Headline in Kontrast-Neon oben + unten,
// Bottom-Strip mit Datum / CTA / URL. Keine Frames, keine Hairlines,
// keine BIB-Codes · Specimen ist editorial, Ads sind laut.
//
// JEDE Ad ist daten-getrieben: hier ändern → /ads sehen → screenshoten.
// Das ist genau der Punkt: Claude Code edit · Vercel build · live.
//
// Formate:
//   '1x1' → 1080×1080  Meta-Feed, LinkedIn-Feed
//   '4x5' → 1080×1350  Meta-Feed-Vertical (mehr Realestate)
//   '9x16'→ 1080×1920  Stories · Reels · TikTok · YouTube-Shorts
//
// Photo-Quelle ist aktuell Picsum-Stock · wenn echte Wlad-Shoots
// liegen unter /ads/photos/<slug>.jpg, einfach den Photo-Pfad
// hier umstellen. Ein File, eine Änderung, alle Tiles ziehen mit.

const stock = (seed, w, h) =>
  `https://picsum.photos/seed/${encodeURIComponent('lo-ad-' + seed)}/${w}/${h}`;

// Brand-Paletten · direkt im Netflix-Bites-Frequenzband, plus
// Lime als unser Anker. Jede Palette: bg (riesiger Farbblock),
// hi (Headline-Neon), lo (kleinere Caption / URL).
export const AD_PALETTES = {
  // Lime auf Schwarz · unser Brand-Stamm
  midnight: { bg: '#0A0A0A', hi: '#BFFF00', lo: '#FAFAF7' },
  // Heat-Magenta · gegen Stillstand
  heat: { bg: '#E11D74', hi: '#FFE600', lo: '#FFFFFF' },
  // Electric-Blue · für KI-Headlines
  spark: { bg: '#1E40FF', hi: '#BFFF00', lo: '#FFFFFF' },
  // Acid-Lime auf Tief-Grün · fürs Manifest
  rally: { bg: '#16632B', hi: '#BFFF00', lo: '#FFFFFF' },
  // Klares Weiß · Trust-Ads (Bücher, Bestseller)
  paper: { bg: '#F5F5F2', hi: '#0A0A0A', lo: '#0A0A0A' },
  // Hot-Orange · für Sprint / Urgency
  blaze: { bg: '#FF6A2D', hi: '#0A0A0A', lo: '#0A0A0A' },
};

export const AD_SERIES = [
  // ─── A · Hero-Manifest ──────────────────────────────────────────
  {
    id: 'AD-A-01',
    slug: 'ki-nativ-werden',
    format: '1x1',
    platform: 'meta',
    palette: 'midnight',
    topText: 'KI-NATIVE\nLEADERSHIP',
    titleText: 'WERDE\nKI-NATIV.',
    bottomText: 'BIB · 0001 · JETZT STARTEN',
    cta: 'LEADER-OS.DE',
    photo: stock('lead-portrait-1', 1080, 1080),
    photoFit: 'cover',
    caption:
      'Es gibt 2026 keine neutrale Position mehr. Wer KI heute nicht ' +
      'als Hebel nutzt, führt morgen unter jemandem, der es tut. ' +
      'Diagnose kostenlos auf leader-check.de.',
  },
  {
    id: 'AD-A-02',
    slug: 'tempo-kurs',
    format: '4x5',
    platform: 'meta',
    palette: 'heat',
    topText: 'KI BESTIMMT\nDAS TEMPO.',
    titleText: 'DU BESTIMMST\nDEN KURS.',
    bottomText: 'DIAGNOSE · 5 MIN · KOSTENLOS',
    cta: 'LEADER-CHECK.DE',
    photo: stock('lead-portrait-2', 1080, 1350),
    photoFit: 'cover',
    caption:
      'Algorithmen führen Prozesse. Menschen führen Menschen. ' +
      'Mach den 5-Minuten-Check.',
  },
  {
    id: 'AD-A-03',
    slug: 'zertifikat-0001',
    format: '9x16',
    platform: 'stories',
    palette: 'spark',
    topText: 'ZERTIFIKAT 0001\nLINKEDIN-READY',
    titleText: '30 TAGE.\nEIN NEUES DU.',
    bottomText: '14 TAGE KOSTENLOS · OHNE KARTE',
    cta: 'LEADER-OS.DE',
    photo: stock('lead-portrait-3', 1080, 1920),
    photoFit: 'cover',
    caption:
      'Dreißig Tage. Elf Frameworks. Ein Coach der nie schläft. ' +
      'Starte 14 Tage kostenlos, ganz ohne Karte.',
  },

  // ─── B · Pain-First (Drill / Feedback / Verhandlung) ────────────
  {
    id: 'AD-B-01',
    slug: 'feedback-drama',
    format: '1x1',
    platform: 'meta',
    palette: 'rally',
    topText: 'FEEDBACK\nOHNE DRAMA.',
    titleText: 'DREI SÄTZE\nREICHEN.',
    bottomText: 'BEOBACHTUNG · WIRKUNG · WUNSCH',
    cta: 'LEADER-OS.DE',
    photo: stock('1on1-talk-1', 1080, 1080),
    photoFit: 'cover',
    caption:
      'Beobachtung. Wirkung. Wunsch. Mehr braucht keine schwierige ' +
      '1:1-Konversation. Mehr macht sie kaputt.',
  },
  {
    id: 'AD-B-02',
    slug: 'townhall-ohne-angst',
    format: '9x16',
    platform: 'stories',
    palette: 'blaze',
    topText: 'FIRMENREDE\nOHNE ANGST.',
    titleText: 'KLARE SKRIPTE\nSTATT BAUCH.',
    bottomText: 'WLADBOT · 24/7 · IN DEINER TASCHE',
    cta: 'LEADER-OS.DE',
    photo: stock('speaker-stage-1', 1080, 1920),
    photoFit: 'cover',
    caption:
      'Du brauchst kein größeres Talent. Du brauchst das richtige ' +
      'Skript für den Moment. WladBot gibt dir den nächsten Satz.',
  },

  // ─── C · Trust (Bestseller, 400k, Zahlen) ───────────────────────
  {
    id: 'AD-C-01',
    slug: 'trust-zahlen',
    format: '1x1',
    platform: 'meta',
    palette: 'paper',
    topText: '400.000+ KLIENTEN\nSEIT 2007',
    titleText: '3× SPIEGEL-\nBESTSELLER.',
    bottomText: 'WLAD JACHTCHENKO · 13 BÜCHER',
    cta: 'LEADER-OS.DE',
    photo: '/wlad/wlad-portrait.jpg',
    photoFit: 'cover',
    // Nur Kanon-Zahlen (docs/gtm/WLAD_CANON.md). „14 Mio. Views" stand
    // hier ohne Beleg und ist raus.
    caption:
      '400.000+ Klienten. 13 Bücher, drei davon SPIEGEL-Bestseller. ' +
      'Diese Methodik landet jetzt in deiner Tasche.',
  },

  // ─── D · Retarget (Demo / Beratung) ─────────────────────────────
  {
    id: 'AD-D-01',
    slug: 'demo-buchen',
    format: '4x5',
    platform: 'meta',
    palette: 'midnight',
    topText: 'LIVE-DEMO\n20 MINUTEN',
    titleText: 'DEIN USE-CASE.\nNICHT UNSERER.',
    bottomText: 'CAL.COM/LEADEROS/DEMO',
    cta: 'TERMIN BUCHEN',
    photo: stock('laptop-call-1', 1080, 1350),
    photoFit: 'cover',
    caption:
      'Keine Slide-Deck-Show. 20 Min live, deine Frage zuerst, das ' +
      'Tool danach. cal.com/leaderos/demo',
  },

  // ─── E · KI-Native Hooks ────────────────────────────────────────
  {
    id: 'AD-E-01',
    slug: 'chatgpt-vs-wladbot',
    format: '1x1',
    platform: 'meta',
    palette: 'spark',
    topText: 'CHATGPT KENNT\nDAS INTERNET.',
    titleText: 'WLADBOT KENNT\nDICH.',
    bottomText: '2 212 WLAD-CHUNKS · CONTEXT-LAYER',
    cta: 'LEADER-OS.DE',
    photo: stock('phone-chat-night', 1080, 1080),
    photoFit: 'cover',
    caption:
      'ChatGPT kennt das halbe Internet. WladBot kennt deine Challenge, ' +
      'deine Frameworks-Historie, deinen Ton. Der Unterschied zwischen ' +
      'einem Tipp und der nächsten Antwort.',
  },
  {
    id: 'AD-E-02',
    slug: 'tools-werden-schneller',
    format: '4x5',
    platform: 'meta',
    palette: 'heat',
    topText: 'TOOLS WERDEN\nSCHNELLER.',
    titleText: 'FÜHRUNG MUSS\nKLARER WERDEN.',
    bottomText: 'KI-NATIVE LEADERSHIP · 30 TAGE',
    cta: 'DIAGNOSE STARTEN',
    photo: stock('boardroom-look', 1080, 1350),
    photoFit: 'cover',
    caption:
      'Jeder hat dieselben Tools. Niemand hat deine Klarheit. ' +
      '5 Min Diagnose auf leader-check.de.',
  },

  // ─── F · Drill-Carousel-Hooks ───────────────────────────────────
  {
    id: 'AD-F-01',
    slug: 'sexier-drill',
    format: '1x1',
    platform: 'meta',
    palette: 'rally',
    topText: '6 SCHRITTE.\n1 ARGUMENT.',
    titleText: 'STATEMENT.\nEXPLANATION.\nEXAMPLE.',
    bottomText: 'SEXIER · 1 VON 11 FRAMEWORKS',
    cta: 'LEADER-OS.DE',
    photo: stock('whiteboard-talk', 1080, 1080),
    photoFit: 'cover',
    // Definition wörtlich aus dem Kanon: R = Rebuttal, nicht Resolution.
    caption:
      'SEXIER · Statement, Explanation, eXample, Impact, Explanation of ' +
      'Impact, Rebuttal. Das Argumentations-Modell, das in jeder Verhandlung ' +
      'trägt. Eines von 11 Frameworks im LeaderOS.',
  },
  {
    id: 'AD-F-02',
    slug: 'dunkle-rhetorik',
    format: '9x16',
    platform: 'stories',
    palette: 'midnight',
    topText: 'ERKENNE SIE.',
    titleText: 'NUTZE SIE NIE.',
    bottomText: 'DUNKLE RHETORIK · 3 KONTER',
    cta: 'LEADER-OS.DE',
    photo: stock('shadow-portrait', 1080, 1920),
    photoFit: 'cover',
    caption:
      'Straw Man. Ad Hominem. Falsches Wir. Drei der häufigsten Tricks ' +
      'in Diskussionen · und der einfache Konter dazu. Du musst nicht ' +
      'aggressiver werden. Du musst nur sehen, was gespielt wird.',
  },

  // ─── G · Beratung & Enterprise ──────────────────────────────────
  {
    id: 'AD-G-01',
    slug: 'beratung-30min',
    format: '4x5',
    platform: 'linkedin',
    palette: 'paper',
    topText: '30 MINUTEN.\nKEIN PITCH.',
    titleText: 'DEIN FALL.\nUNSER PLAN.',
    bottomText: 'CAL.COM/LEADEROS/BERATUNG',
    cta: 'TERMIN BUCHEN',
    photo: stock('1on1-coffee', 1080, 1350),
    photoFit: 'cover',
    caption:
      'Du beschreibst die Situation, wir setzen einen klaren nächsten ' +
      'Schritt. Keine Verkaufs-Show. cal.com/leaderos/beratung',
  },
  {
    id: 'AD-G-02',
    slug: 'enterprise-team',
    format: '1x1',
    platform: 'linkedin',
    palette: 'blaze',
    topText: 'DEIN TEAM\nGEMEINSAM.',
    titleText: 'EIN OS.\nEINE METHODIK.',
    bottomText: 'ENTERPRISE · AB 10 PLÄTZE',
    cta: 'ANFRAGE STELLEN',
    photo: stock('team-circle', 1080, 1080),
    photoFit: 'cover',
    caption:
      'Wenn alle in deinem Team denselben Frameworks-Stack haben, ' +
      'reden sie dieselbe Sprache. Enterprise-Tarife ab 10 Plätze.',
  },

  // ─── H · Zertifikat & Class ─────────────────────────────────────
  {
    id: 'AD-H-01',
    slug: 'class-0001',
    format: '9x16',
    platform: 'stories',
    palette: 'rally',
    topText: 'DEINE CHALLENGE\nDEIN ZERTIFIKAT',
    titleText: 'BIB 0001\nSICHERN.',
    bottomText: 'JETZT STARTEN · 14 TAGE KOSTENLOS',
    cta: 'JETZT DABEI',
    photo: stock('marathon-bib', 1080, 1920),
    photoFit: 'cover',
    caption:
      'Starte deine Challenge, wann du willst. Jeder bekommt das ' +
      'Zertifikat 0001 · handschriftlich von Wlad, mit dem Original-Siegel.',
  },
  {
    id: 'AD-H-02',
    slug: 'zertifikat-linkedin',
    format: '1x1',
    platform: 'linkedin',
    palette: 'paper',
    topText: 'PDF? NEIN.',
    titleText: 'ZERTIFIKAT\n0001.',
    bottomText: 'WLAD JACHTCHENKO · HANDSIGNIERT',
    cta: 'LEADER-OS.DE',
    photo: stock('certificate-flat', 1080, 1080),
    photoFit: 'cover',
    caption:
      'Kein generisches Kurs-PDF. Eine LinkedIn-ready Urkunde mit ' +
      'deiner BIB 0001, Goldfolie-Siegel und Wlads handschriftlicher ' +
      'Unterschrift. Trägst du, oder lässt du.',
  },
];

// ─── Welle 1 · Webinar 17.09.2026 · 8 Angles × 3 Formate ────────────
//
// Mengenplanung: docs/gtm/CREATIVE_MATRIX.md §3 (W1). Kampagnenstruktur,
// Zielgruppen, Meta-Copy-Felder: docs/gtm/META_ADS_WEBINAR.md.
//
// Ein Angle = ein Inhalt in drei Formaten (Variante „a"). Varianten b/c
// (andere Palette, anderer Hook) kommen erst, wenn ein Angle ≥ 50 Klicks
// hat — vorher ist jede Entscheidung Rauschen.
//
// Foto: ausschließlich eigene Assets (Wlad-Porträt). Kein Stock in Paid.
// Jede Zahl aus docs/gtm/WLAD_CANON.md. Keine erfundene Verknappung.
//
// Meta-Felder je Ad: `caption` = Primärtext · `headline` (≤ 40 Zeichen) ·
// `description` (≤ 30 Zeichen) · `url` mit UTM (utm_term setzt das Ad-Set
// über {{adset.name}}, siehe META_ADS_WEBINAR.md §1).

const WEBINAR_CAMPAIGN = 'webinar-2026-09';
const WLAD_PORTRAIT = '/wlad/wlad-portrait.jpg';
const WEBINAR_FORMATS = ['1x1', '4x5', '9x16'];

const utmUrl = (base, id) =>
  `${base}${base.includes('?') ? '&' : '?'}utm_source=meta&utm_medium=paid_social` +
  `&utm_campaign=${WEBINAR_CAMPAIGN}&utm_content=${id}`;

const WEBINAR_ANGLES = [
  // ── D03 · Das Angebot selbst · Quadrant: convert ──────────────────
  {
    key: 'D03', slug: 'webinar-live', quadrant: 'convert', palette: 'midnight',
    topText: 'LIVE-WEBINAR\n17. SEPT.',
    titleText: 'FÜHRE BESSER.\nJEDEN TAG.',
    bottomText: 'DO 17.09. · 10 UHR · 0 €',
    cta: 'PLATZ SICHERN',
    landing: 'https://leader-os.de/webinar',
    headline: 'Live-Webinar mit Wlad Jachtchenko',
    description: '17. Sept · 10 Uhr · 90 Min',
    caption:
      'Du weißt, wie gute Führung geht. Du kommst nur nicht dazu, sie zu leben.\n\n' +
      'Am 17. September zeigt Wlad Jachtchenko (3× SPIEGEL-Bestseller, seit 2007 Coach ' +
      'für über 400.000 Klienten) live, wie Führung täglich trainierbar wird: der ' +
      'Charisma-Code, das Leadership-Betriebssystem und ein echter Live-Case aus der ' +
      'Community — mit deinen Fragen im Q&A.\n\n' +
      '90 Minuten. Kostenlos. Keine Aufzeichnung.',
  },
  // ── B01 · Der Seminar-Schmerz · Quadrant: educate → convert ───────
  {
    key: 'B01', slug: 'seminar-drei-wochen', quadrant: 'educate', palette: 'heat',
    topText: 'DAS SEMINAR\nWAR GUT.',
    titleText: 'DREI WOCHEN\nSPÄTER: NICHTS.',
    bottomText: 'TRAINIEREN STATT WISSEN',
    cta: 'LIVE DABEI',
    landing: 'https://leader-os.de/webinar',
    headline: 'Seminare ändern Wissen. Nicht Verhalten.',
    description: '17. Sept · live · kostenlos',
    caption:
      'Kennst du das? Das Führungsseminar war wirklich gut. Drei Wochen später ist ' +
      'vom Feedback-Vorsatz nichts übrig außer den Folien.\n\n' +
      'Das ist kein Charakterfehler. Wissen wird gelehrt, Verhalten wird trainiert — ' +
      'und zweimal im Jahr ist kein Training.\n\n' +
      'Im Live-Webinar am 17. September zeigt Wlad Jachtchenko, wie Führung in 15 ' +
      'Minuten am Tag trainierbar wird. Kostenlos, live, mit Q&A.',
  },
  // ── A02 · Feedbackformel · Quadrant: educate ──────────────────────
  {
    key: 'A02', slug: 'feedbackformel', quadrant: 'educate', palette: 'spark',
    topText: 'FEEDBACK\nOHNE DRAMA.',
    titleText: 'BEOBACHTUNG.\nWIRKUNG.\nWUNSCH.',
    bottomText: 'FEEDBACKFORMEL · 17.09. LIVE',
    cta: 'LIVE DABEI',
    landing: 'https://leader-os.de/webinar',
    headline: 'Drei Sätze für jedes schwierige Gespräch',
    description: 'Wlads Feedbackformel · live',
    caption:
      'Nie „Du bist…". Immer „Ich habe beobachtet, dass…".\n\n' +
      'Beobachtung + Wirkung + Wunsch — mehr braucht kein Kritikgespräch. Mehr macht ' +
      'es kaputt. Das ist Wlads Feedbackformel, und sie ist eines der Frameworks, ' +
      'die im Live-Webinar am 17. September an einem echten Fall durchgespielt werden.\n\n' +
      '90 Minuten, kostenlos, keine Aufzeichnung.',
  },
  // ── A01 · SEXIER · Quadrant: educate ──────────────────────────────
  {
    key: 'A01', slug: 'sexier-modell', quadrant: 'educate', palette: 'rally',
    topText: 'SECHS SCHRITTE.\nEIN ARGUMENT.',
    titleText: 'STATEMENT.\nEXPLANATION.\nEXAMPLE.',
    bottomText: 'SEXIER-MODELL · 17.09. LIVE',
    cta: 'LIVE DABEI',
    landing: 'https://leader-os.de/webinar',
    headline: 'SEXIER: sechs Schritte, ein Argument',
    description: 'SEXIER · live · kostenlos',
    caption:
      'Statement. Explanation. eXample. Impact. Explanation of Impact. Rebuttal.\n\n' +
      'Sechs Schritte, und ein Argument ist vollständig — mit Widerlegung der ' +
      'Gegenargumente, bevor jemand sie ausspricht. Das SEXIER-Modell aus Wlads ' +
      'SPIEGEL-Bestseller „Weiße Rhetorik".\n\n' +
      'Live am 17. September, mit deinen Fragen. Kostenlos.',
  },
  // ── C02 · 400.000+ seit 2007 · Quadrant: convert ──────────────────
  {
    key: 'C02', slug: 'seit-2007', quadrant: 'convert', palette: 'midnight',
    topText: 'SEIT 2007.\n400.000+ KLIENTEN.',
    titleText: 'JETZT LIVE.\nMIT DEINEN FRAGEN.',
    bottomText: 'DO 17.09. · 10 UHR · KOSTENLOS',
    cta: 'PLATZ SICHERN',
    landing: 'https://leader-os.de/webinar',
    headline: 'Wlad Jachtchenko · live am 17. September',
    description: '90 Min · Q&A · live',
    caption:
      'Seit 2007 trainiert Wlad Jachtchenko Führungskräfte — über 400.000 Klienten, ' +
      '13 Bücher, drei davon SPIEGEL-Bestseller.\n\n' +
      'Am 17. September zeigt er zum ersten Mal live, wie seine komplette Methodik ' +
      'als tägliches Trainingssystem funktioniert. Und beantwortet deine Fragen ' +
      'persönlich.\n\n' +
      'Kostenlos. Live. Keine Aufzeichnung.',
  },
  // ── C01 · 3× SPIEGEL · Quadrant: convert ──────────────────────────
  {
    key: 'C01', slug: 'spiegel-bestseller', quadrant: 'convert', palette: 'paper',
    topText: '3× SPIEGEL-\nBESTSELLER.',
    titleText: 'LIVE. 90 MIN.\nKOSTENLOS.',
    bottomText: 'WLAD JACHTCHENKO · 17.09.',
    cta: 'PLATZ SICHERN',
    landing: 'https://leader-os.de/webinar',
    headline: 'Der Autor von „Weiße Rhetorik" — live',
    description: '17. Sept · 10 Uhr · kostenlos',
    caption:
      '„Weiße Rhetorik", „Dunkle Rhetorik", „Die 5 Rollen einer Führungskraft" — ' +
      'die Methodik aus Wlads Büchern, live an einem echten Führungsfall ' +
      'durchgearbeitet.\n\n' +
      'Live-Webinar am 17. September, 10 Uhr, 90 Minuten. Kostenlos, ohne ' +
      'Aufzeichnung, mit Q&A.',
  },
  // ── D01 · Leader-Check · Quadrant: educate/no budget → organic-first ─
  {
    key: 'D01', slug: 'leader-check', quadrant: 'educate', palette: 'blaze',
    topText: 'ZEHN MINUTEN.\nKEIN LOGIN.',
    titleText: 'WO STEHST DU\nALS FÜHRUNGSKRAFT?',
    bottomText: 'LEADER-CHECK · 10 MIN · 0 €',
    cta: 'CHECK STARTEN',
    landing: 'https://leader-check.de/',
    headline: 'Dein Führungsprofil in 10 Minuten',
    description: 'Kostenlos · ohne Login',
    caption:
      'KI-Readiness, Rhetorik, emotionale Intelligenz — drei Dimensionen, ' +
      'zehn Minuten, kein Login.\n\n' +
      'Der Leader-Check zeigt dir, wo du als Führungskraft stehst und woran du ' +
      'als Erstes arbeiten solltest. Kostenlos, nach Wlad Jachtchenkos Methodik.',
  },
  // ── D02 · 30-Tage-Challenge · Quadrant: convert (Warm) ────────────
  {
    key: 'D02', slug: 'dreissig-tage', quadrant: 'convert', palette: 'rally',
    topText: 'ZWEIMAL IM JAHR\nIST KEIN TRAINING.',
    titleText: 'TÄGLICH.\n15 MINUTEN.',
    bottomText: 'CHALLENGE · 14 TAGE KOSTENLOS',
    cta: 'LEADER-OS.DE',
    landing: 'https://leader-os.de/',
    headline: 'Führung trainieren wie Fitness',
    description: '14 Tage kostenlos · ohne Karte',
    caption:
      'Führung ist Fähigkeit. Fähigkeit ist trainierbar.\n\n' +
      'Die 30-Tage-Challenge macht aus Wlads Methodik eine tägliche Routine: ' +
      '15 Minuten, ein KI-Coach, der seine Bücher kennt, Simulationen echter ' +
      'Führungssituationen, Feedback.\n\n' +
      '14 Tage kostenlos, ohne Karte, jederzeit kündbar.',
  },
];

export const WEBINAR_ADS = WEBINAR_ANGLES.flatMap(({ key, slug, landing, ...angle }) =>
  WEBINAR_FORMATS.map((format) => {
    const id = `AD-${key}-${format}-a`;
    return {
      ...angle,
      id,
      slug: `${slug}-${format}`,
      format,
      platform: format === '9x16' ? 'stories' : 'meta',
      campaign: WEBINAR_CAMPAIGN,
      photo: WLAD_PORTRAIT,
      photoFit: 'cover',
      url: utmUrl(landing, id),
    };
  }),
);

AD_SERIES.push(...WEBINAR_ADS);

// ─── LinkedIn · dieselben 8 Angles, Querformat 1200×627 ──────────────
//
// LinkedIn Single Image Ads nehmen 1,91:1 (1200×627) und 1:1. Die 1x1-
// Webinar-Ads oben laufen dort unverändert; hier kommt je Angle das
// Querformat dazu, mit LinkedIn-Copy: `liIntro` (Einleitungstext, ≤ 150
// Zeichen bleiben ungekürzt), `liHeadline` (≤ 70 Zeichen). CTA-Button im
// Campaign Manager: „Registrieren" (D03/C01/C02) bzw. „Mehr erfahren".
// Struktur, Zielgruppen, Insight Tag: docs/gtm/LINKEDIN_ADS_WEBINAR.md.

const LI_COPY = {
  D03: {
    liIntro: 'Kostenloses Live-Webinar am 17.09., 10 Uhr: Wlad Jachtchenko zeigt, wie Führung täglich trainierbar wird. 90 Min, Q&A, keine Aufzeichnung.',
    liHeadline: 'Live-Webinar mit Wlad Jachtchenko · 17. September · kostenlos',
  },
  B01: {
    liIntro: 'Das Seminar war gut. Drei Wochen später war alles wie vorher. Wissen wird gelehrt, Verhalten wird trainiert. Live am 17.09., kostenlos.',
    liHeadline: 'Seminare ändern Wissen, nicht Verhalten. Live-Webinar am 17.09.',
  },
  A02: {
    liIntro: 'Beobachtung + Wirkung + Wunsch. Wlads Feedbackformel, live an einem echten Fall durchgespielt. 17.09., 10 Uhr, kostenlos.',
    liHeadline: 'Drei Sätze für jedes schwierige Gespräch · Live-Webinar',
  },
  A01: {
    liIntro: 'Statement · Explanation · eXample · Impact · Explanation of Impact · Rebuttal. Das SEXIER-Modell, live erklärt. 17.09., kostenlos.',
    liHeadline: 'SEXIER: sechs Schritte, ein vollständiges Argument · live',
  },
  C02: {
    liIntro: 'Seit 2007, über 400.000 Klienten, 13 Bücher. Am 17.09. zeigt Wlad Jachtchenko live, wie seine Methodik als tägliches Training funktioniert.',
    liHeadline: 'Wlad Jachtchenko live · 17. September · 90 Minuten · kostenlos',
  },
  C01: {
    liIntro: 'Die Methodik aus „Weiße Rhetorik" und „Die 5 Rollen einer Führungskraft", live an einem Führungsfall durchgearbeitet. 17.09., 10 Uhr.',
    liHeadline: 'Der Autor von „Weiße Rhetorik" live · kostenloses Webinar',
  },
  D01: {
    liIntro: 'KI-Readiness, Rhetorik, EQ: dein Führungsprofil in zehn Minuten, ohne Login. Nach Wlad Jachtchenkos Methodik. Kostenlos.',
    liHeadline: 'Leader-Check: dein Führungsprofil in 10 Minuten · kostenlos',
  },
  D02: {
    liIntro: 'Führung ist Fähigkeit, Fähigkeit ist trainierbar: 15 Minuten am Tag, ein KI-Coach, der Wlads Bücher kennt. 14 Tage kostenlos.',
    liHeadline: 'Führung trainieren wie Fitness · 14 Tage kostenlos testen',
  },
};

const liUrl = (base, id) =>
  `${base}${base.includes('?') ? '&' : '?'}utm_source=linkedin&utm_medium=paid_social` +
  `&utm_campaign=${WEBINAR_CAMPAIGN}&utm_content=${id}`;

export const LINKEDIN_ADS = WEBINAR_ANGLES.map(({ key, slug, landing, ...angle }) => {
  const id = `AD-${key}-1.91x1-a`;
  return {
    ...angle,
    ...LI_COPY[key],
    id,
    slug: `${slug}-li`,
    format: '1.91x1',
    platform: 'linkedin',
    campaign: WEBINAR_CAMPAIGN,
    photo: WLAD_PORTRAIT,
    photoFit: 'cover',
    url: liUrl(landing, id),
  };
});

AD_SERIES.push(...LINKEDIN_ADS);

export const AD_CAMPAIGNS = ['evergreen', WEBINAR_CAMPAIGN];
export const AD_PLATFORMS = ['meta', 'stories', 'linkedin'];

export const AD_BY_SLUG = Object.fromEntries(AD_SERIES.map((a) => [a.slug, a]));
