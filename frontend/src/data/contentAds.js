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
    topText: '400 000 KUNDEN\n3 BESTSELLER',
    titleText: '14 MIO\nVIEWS.',
    bottomText: 'WLAD JACHTCHENKO · METHODIK · LIVE',
    cta: 'LEADER-OS.DE',
    photo: stock('books-shelf', 1080, 1080),
    photoFit: 'cover',
    caption:
      '400 000 Kunden. 3 SPIEGEL-Bestseller. 14 Millionen Views. ' +
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
    caption:
      'SEXIER · Statement, Explanation, Example, Impact, Exception, ' +
      'Resolution. Das Argumentations-Modell, das in jeder Verhandlung ' +
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

export const AD_BY_SLUG = Object.fromEntries(AD_SERIES.map((a) => [a.slug, a]));
