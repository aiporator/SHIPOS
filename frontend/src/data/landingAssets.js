// Leader-OS Landing-Page editorial assets — Direction A (Athletic Editorial)
//
// SOURCE: generated via Recraft 4.1 in the Direction-A brand-bible
// session (Söhne/Druk-Wide-style headlines, lime as punctuation, hard-edged
// photo rectangles, BIB-coded eyebrows).
//
// HOSTING NOTE — these URLs are Higgsfield CloudFront. They work in any
// browser, but should be migrated to a controlled host once the landing
// design is locked. Migration paths in order of preference:
//   1. Download → /frontend/public/landing/benefit-XX.png  (best: ships
//      with build, no third-party dependency, gets Vercel CDN caching)
//   2. Supabase Storage bucket `landing-assets` with public-read RLS
//   3. Keep CloudFront URLs if Higgsfield account ownership is durable
//
// Once migrated, swap `url` here and `priority`/`fallback` stay.

export const LANDING_ASSETS = {
  benefit01: {
    nr: '01',
    eyebrow: 'BENEFIT 01 · INHALT',
    headline: 'Elf Frameworks. Ein OS.',
    body:
      'SEXIER. Fünf Rollen. Feedbackformel. Drei Säulen. Zehn Stufen. ' +
      'Kommunikationsquadrant. Dunkle Rhetorik. Vier-Farben-Modell. ' +
      'Schlagfertigkeit. ALPEN. Verhandlung. Alle in einem System.',
    cta: 'Alle Frameworks ansehen',
    href: 'https://leader-check.de',
    aspect: '16/9',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105555_171fbdd8-d4af-43db-bf48-47315c36c9ea.png',
  },
  benefit02: {
    nr: '02',
    eyebrow: 'BENEFIT 02 · IMMER WACH',
    headline: '24 Stunden. 7 Tage.',
    body:
      'WladBot kennt Wlads Methodik in- und auswendig. ' +
      'Für jede Führungs-Situation. Jederzeit.',
    cta: 'WladBot starten',
    href: 'https://leader-check.de',
    aspect: '3/2',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105604_c750a631-b6bb-4000-81e8-bb5cc936ed37.png',
  },
  benefit03: {
    nr: '03',
    eyebrow: 'BENEFIT 03 · SPRINT',
    headline: 'Dreißig Tage. Ein neues Du.',
    body:
      'Jeden Tag eine Frage. Jeden Tag ein Drill. ' +
      'Jeden Tag etwas näher an der Führungskraft die du werden willst.',
    cta: 'Sprint starten',
    href: 'https://leader-check.de',
    aspect: '1/1',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105612_5f4e62bf-5d92-4381-9448-169e4768dace.png',
  },
  benefit04: {
    nr: '04',
    eyebrow: 'BENEFIT 04 · AUTHENTIZITÄT',
    headline: 'Wlads Methodik. Live.',
    body:
      'Fünfhunderttausend Kunden haben seine Methode gelernt. ' +
      'Drei SPIEGEL-Bestseller. Vierzehn Millionen Views. ' +
      'Jetzt direkt in deiner Tasche.',
    cta: 'Mehr über Wlad',
    href: 'https://leader-check.de',
    aspect: '4/5',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105621_10fd6aec-0770-46f9-bf9c-91a257e83835.png',
  },
  benefit05: {
    nr: '05',
    eyebrow: 'BENEFIT 05 · TRUST',
    headline: '400 Tausend Kunden. 14 Millionen Views.',
    body:
      'Wlad Jachtchenko ist Europas führender Argumentations-Coach. ' +
      'Drei SPIEGEL-Bestseller. Staatlich zertifizierte Argumentorik-Ausbildung. ' +
      'Jetzt in einem OS.',
    cta: 'Mehr Beweise',
    href: 'https://leader-check.de',
    aspect: '3/2',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105628_347f2409-3b06-4aed-95f7-064606032b81.png',
  },
  benefit06: {
    nr: '06',
    eyebrow: 'BENEFIT 06 · ZERTIFIKAT',
    headline: 'Zertifikat 0001.',
    body:
      'Jeder Sprint endet mit einem persönlichen Zertifikat. ' +
      'Du kannst es auf LinkedIn teilen oder dem nächsten Arbeitgeber zeigen.',
    cta: 'Erstes Zertifikat freischalten',
    href: 'https://leader-check.de',
    aspect: '1/1',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105637_1ae1fcb6-61e5-4fc6-8707-1af4554a4909.png',
    fallback: true, // may still be in-progress at first visit
  },
  benefit07: {
    nr: '07',
    eyebrow: 'BENEFIT 07 · TECH-STACK',
    headline: 'Powered by WladBot.',
    body:
      'Voyage-3 Embeddings auf 2212 authentischen Wlad-Chunks. ' +
      'Hybrid Retrieval. GPT-5.2. Antwortet in Wlads Stimme, ' +
      'mit Wlads Frameworks, auf deine konkrete Situation.',
    cta: 'WladBot kennenlernen',
    href: 'https://leader-check.de',
    aspect: '16/9',
    dark: true,
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3DPsWNuTwY6JUd0ZsFXrevEFB06/hf_20260609_105647_84606bab-805d-4726-af89-8757f617a166.png',
    fallback: true, // may still be in-progress at first visit
  },
};

export const LANDING_META = {
  title: 'Leader-OS — Das OS für Führungskräfte. Werde KI-nativ.',
  description:
    'Elf Frameworks. Ein OS. WladBot-Coach 24/7. 30-Tage-Sprint. ' +
    'Wlad Jachtchenkos Methodik live in deiner Tasche.',
  url: 'https://leader-os.de',
  cohort: '0001',
  cta: {
    primary: { label: 'Bewerben für Kohorte 0001', href: 'https://leader-check.de' },
    secondary: { label: 'Anmelden', href: '/login' },
  },
};

export const LANDING_BENEFITS_ORDER = [
  'benefit01', 'benefit02', 'benefit03',
  'benefit04', 'benefit05', 'benefit06', 'benefit07',
];
