/**
 * Article 6/10 · persona use case for HR / People Ops.
 */
export default {
  slug: 'leader-os-fuer-hr-und-people-ops',
  type: 'case-study',
  status: 'published',
  title: 'Leader-OS für HR und People Ops.',
  description:
    'Wenn deine Aufgabe ist Führungskräfte zu entwickeln, nicht selbst ' +
    'eine zu sein: wie Leader-OS in eine bestehende L&D-Architektur passt ' +
    'und welche Datenpunkte du als Programm-Owner bekommst.',
  author: 'Wlad Jachtchenko',
  publishedAt: '2026-06-25',
  cover: null,
  tags: ['Leader-OS', 'Use Case', 'People Ops'],
  body: [
    { type: 'paragraph', text:
      'HR und People Ops haben ein eigenes Problem mit Leadership-Programmen: jeder Anbieter verspricht ' +
      'Transformation, niemand liefert Daten. Du als Programm-Owner musst am Ende des Quartals erklären was ' +
      'das Programm bewirkt hat · und hast nur Selbst-Berichte deiner Führungskräfte.' },
    { type: 'paragraph', text:
      'Leader-OS ist auf zwei Dimensionen angepasst: nahtloser Einbau in deine L&D-Architektur und ehrliche ' +
      'Daten für deine Reports.' },
    { type: 'heading', level: 2, text: 'Was du als Programm-Owner siehst.' },
    { type: 'list', style: 'bullet', items: [
      'Aggregierte Diagnose-Scores pro Kohorte (KI / Rhetorik / EQ), keine Einzelnamen ohne Opt-In.',
      'Sprint-Completion-Rate, Drill-Frequenz, größte gemeinsame Lücken.',
      'Ende-Sprint-Survey mit standardisierten Fragen für deinen L&D-Report.',
      'Optional: ZRR-Berichte (Zertifikat, Reflexion, Roadmap) als PDF-Export.',
    ] },
    { type: 'callout', tone: 'lime', text:
      'Wir tracken Output, nicht Input. Du bekommst nicht "Anna war zu 87 Prozent in der App" · du bekommst ' +
      '"Anna hat ihre B-W-W-Reflex-Zeit von 22 Sekunden auf 8 Sekunden gesenkt".' },
    { type: 'heading', level: 2, text: 'Einbau in deine L&D-Architektur.' },
    { type: 'paragraph', text:
      'Leader-OS ersetzt KEIN bestehendes Mentoring-Programm. Es schließt die Lücke zwischen Onboarding ' +
      '("Welcome to Leadership") und High-Touch-Mentoring. Klassische Architektur:' },
    { type: 'list', style: 'numbered', items: [
      'Onboarding-Sprint nach Beförderung · Leader-OS, 30 Tage. Pro Person 997 EUR.',
      'Ongoing Drill-Channel via Plus-Plus · für High Performer die nach dem Sprint mehr wollen.',
      'High-Touch Mentoring nur für die Top-2 Prozent · 1:1 mit Wlad, durch Plus-Plus-Warteliste.',
    ] },
    { type: 'paragraph', text:
      'Das schichtet sauber unter und über deine bestehenden Maßnahmen. Du musst nichts abschalten. Du musst ' +
      'nichts neu kaufen außer einem Kontingent für die Sprint-Sitze.' },
    { type: 'heading', level: 2, text: 'Beispiel-Setup: Mittelstand, 80 Führungskräfte.' },
    { type: 'paragraph', text:
      'Eine HR-Verantwortliche aus einem 800-Personen-Mittelständler beschreibt ihren Rollout so: alle ' +
      'sechzig neu beförderten Lead-Rollen pro Jahr bekommen einen Leader-OS-Sprint im ersten Monat nach ' +
      'der Beförderung. Die zwanzig High-Performer aus der bestehenden Senior-Schicht bekommen Plus-Plus. ' +
      'Drei VPs sind in der Mentoring-12-Warteliste. Gesamt-Budget: 80 Personen.' },
    { type: 'framework', code: 'STAFF', title: 'L&D-Layering',
      explanation:
        'Schicht A: Sprint für jeden neuen Lead (30 Tage, 997 EUR). Schicht B: Plus-Plus als Continuous ' +
        'Drill für High Performer (4 797 EUR). Schicht C: 1:1 mit Wlad für Top-Talent (Warteliste). Du ' +
        'wählst pro Person welche Schicht passt, basierend auf Diagnose-Score und Role-Trajectory.' },
    { type: 'heading', level: 2, text: 'Was du NICHT bekommst.' },
    { type: 'list', style: 'bullet', items: [
      'Keine Detail-Daten von individuellen Drill-Sessions ohne Opt-In der Person. Die Sprint-Privatsphäre bleibt geschützt.',
      'Keine Leistungs-Beurteilung. Wir liefern dir keine Daten für Performance-Reviews. Das wäre das Gegenteil von Coaching-Vertrauen.',
      'Keine "Ranking"-Tabellen pro Kohorte. Output-Daten sind aggregiert.',
    ] },
    { type: 'paragraph', text:
      'Für ein konkretes Setup-Gespräch mit deinem L&D-Team: buch eine 30-Min-Beratung. Wir bringen ein ' +
      'Beispiel-Setup aus deiner Branche mit und zeigen dir wie das Reporting aussieht.' },
  ],
  seo: {
    title: 'Leader-OS für HR und People Ops: L&D mit KI',
    description:
      'Leader-OS für HR und People Ops: wie es in eine bestehende L&D-Architektur ' +
      'passt · Sprint für neue Leads, Plus-Plus für High Performer, Mentoring für ' +
      'Top-Talent. Plus Reporting für Programm-Owner.',
    keywords: ['Leadership Programm HR', 'People Ops Leadership Development', 'L&D Leadership Training KI', 'HR Leadership Tool', 'Wlad Jachtchenko Enterprise'],
  },
  related: ['der-business-case-fuer-leader-os', 'leader-os-im-team-rollout'],
};
