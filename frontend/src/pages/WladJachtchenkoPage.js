import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ShareBar } from '../features/content/components/ShareBar';
import { WLAD_AVATAR, WLAD_AVATAR_FALLBACKS, withFallback } from '../lib/brandAssets';

/**
 * WladJachtchenkoPage · the canonical SERP-winner for "Wlad Jachtchenko".
 *
 * Why a standalone page exists when there's already the
 * /journal/wer-ist-wlad-jachtchenko article: the article lives inside the
 * journal taxonomy and competes with 90+ other entries. This page sits
 * at /wlad-jachtchenko (clean URL, no /journal/ prefix), carries the
 * full Person schema with everything Google's Knowledge Graph wants to
 * see (sameAs, knowsAbout, worksFor, alumniOf, award, hasOccupation,
 * affiliation), and is the canonical answer for image-search + AI
 * Overview when someone googles his name.
 *
 * It is also the page every internal link about Wlad targets — footer,
 * nav, article author byline · so Google sees a clear authority pattern:
 * 95+ links across the site converging on one canonical Person page.
 */

const FACTS = [
  ['Geboren',       'Kiew, Ukraine'],
  ['Wohnort',       'Berlin · Deutschland'],
  ['Beruf',         'Argumentations-Coach, Bestseller-Autor, Gründer'],
  ['Bücher',        '12 publiziert · davon 3× SPIEGEL-Bestseller'],
  ['Klienten',      '400 000+ trainierte Führungskräfte weltweit'],
  ['Reichweite',    '14 Millionen Views auf Podcast + YouTube'],
  ['Akademie',      'Argumentorik-Akademie · staatlich anerkannt · 6 Monate'],
  ['Coaching seit', '2010 · 15+ Jahre kontinuierliche Methodik-Entwicklung'],
  ['Gegründet',     'Leader-OS (2026) · Argumentorik-Akademie (2014)'],
];

const BOOKS = [
  {
    title: 'Weiße Rhetorik',
    sub: 'Mit Worten überzeugen · ohne zu manipulieren',
    badge: 'SPIEGEL-Bestseller',
  },
  {
    title: 'Dunkle Rhetorik',
    sub: 'Manipulation erkennen, abwehren, neutralisieren',
    badge: 'SPIEGEL-Bestseller',
  },
  {
    title: 'Die 5 Rollen einer Führungskraft',
    sub: 'Visionär · Vorbild · Coach · Konfliktlöser · Manager',
    badge: 'SPIEGEL-Bestseller',
  },
];

const ALSO_CALLED = [
  'Wladislaw Jachtchenko',
  'Wlad Jachtschenko',
  'Vlad Yachtchenko',
];

const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://leader-os.de/wlad-jachtchenko#person',
  name: 'Wlad Jachtchenko',
  givenName: 'Wlad',
  familyName: 'Jachtchenko',
  alternateName: ALSO_CALLED,
  birthPlace: { '@type': 'Place', name: 'Kiew, Ukraine' },
  nationality: { '@type': 'Country', name: 'Deutschland' },
  description:
    'Wlad Jachtchenko ist Europas führender Argumentations-Coach, 3× SPIEGEL-Bestseller-Autor ' +
    'und Gründer der Argumentorik-Akademie sowie der KI-Coaching-Plattform Leader-OS. Er trainiert ' +
    'seit 2010 Führungskräfte und hat über 400 000 Klienten in mehr als 20 Ländern erreicht.',
  url: 'https://leader-os.de/wlad-jachtchenko',
  image: 'https://leader-os.de/wlad/wlad-portrait.jpg',
  jobTitle: 'Argumentations-Coach · Bestseller-Autor · Gründer',
  worksFor: [
    {
      '@type': 'Organization',
      name: 'Leader-OS',
      url: 'https://leader-os.de',
    },
    {
      '@type': 'EducationalOrganization',
      name: 'Argumentorik-Akademie',
      url: 'https://argumentorik-akademie.de',
    },
  ],
  knowsAbout: [
    'Boardroom-Rhetorik',
    'Argumentation',
    'Führungskräfte-Coaching',
    'Verhandlungsführung',
    'Dunkle Rhetorik · Manipulation',
    'Emotionale Intelligenz für Führung',
    'KI Leadership',
    'KI-natives Führen',
    'Harvard-Verhandlungsmethode',
    'Schulz von Thun Kommunikationsmodell',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Argumentations-Coach',
    occupationLocation: { '@type': 'Country', name: 'Deutschland' },
  },
  author: BOOKS.map((b) => ({
    '@type': 'Book',
    name: b.title,
    inLanguage: 'de',
    author: { '@id': 'https://leader-os.de/wlad-jachtchenko#person' },
  })),
  sameAs: [
    'https://www.linkedin.com/in/wladjachtchenko/',
    'https://www.youtube.com/@WladTraining',
    'https://wladjachtchenko.de',
    'https://wladjachtchenko.de/buecher',
    'https://podcast.wladjachtchenko.de',
    'https://twitter.com/WladTraining',
  ],
};

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wer ist Wlad Jachtchenko?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Wlad Jachtchenko ist Europas führender Argumentations-Coach, dreifacher SPIEGEL-Bestseller-Autor und Gründer der Argumentorik-Akademie. Seit 2010 trainiert er Führungskräfte aus DAX-Konzernen, Mittelstand und Startups in Boardroom-Rhetorik, Verhandlung und KI-nativer Führung. 2026 hat er die KI-Coaching-Plattform Leader-OS gestartet.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche Bücher hat Wlad Jachtchenko geschrieben?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Wlad Jachtchenko hat 12 Bücher veröffentlicht, davon drei SPIEGEL-Bestseller: Weiße Rhetorik (Überzeugung ohne Manipulation), Dunkle Rhetorik (Manipulation erkennen und abwehren) und Die 5 Rollen einer Führungskraft. Insgesamt über 250 000 verkaufte Exemplare.',
      },
    },
    {
      '@type': 'Question',
      name: 'Was ist die Argumentorik-Akademie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Die Argumentorik-Akademie ist eine von Wlad Jachtchenko gegründete, staatlich anerkannte sechsmonatige Ausbildung zum Argumentations-Coach. Sie hat seit der Gründung 2014 mehrere tausend Coaches ausgebildet und ist im deutschsprachigen Raum führend in evidenzbasierter Rhetorik-Ausbildung.',
      },
    },
    {
      '@type': 'Question',
      name: 'Was ist Leader-OS und welche Rolle spielt Wlad Jachtchenko?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Leader-OS ist die 2026 von Wlad Jachtchenko gegründete KI-Coaching-Plattform für Führungskräfte. Sie bündelt seine fünfzehnjährige Coaching-Methodik in elf drillbaren Frameworks plus WladBot · einen 24/7-KI-Coach trainiert auf 2 212 authentische Wlad-Lektionen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie kann man Wlad Jachtchenko buchen oder erreichen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Direkter Kontakt über start@aiporate.com (Argumentorik-Akademie GmbH, Berlin). Für Coaching-Anfragen gibt es Leader-OS · die Plattform ersetzt seine ausgebuchten 1:1-Slots durch WladBot und monatliche Live-Sessions in Plus-Plus. Speaker-Anfragen für Keynotes laufen ebenfalls über die Email.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche Methodik vertritt Wlad Jachtchenko?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Wlad Jachtchenkos Kernsatz lautet: Führung ist Skill, Skill ist trainierbar. Konkret bedeutet das drillbare Frameworks statt Theorie · Harvard-Verhandlung, Schulz von Thuns Kommunikationsquadrat, Feedback-Formel BWW, ALPEN-Methode, Vier-Farben-Modell, Dunkle-Rhetorik-Defensive. Heute kombiniert mit KI-Coaching für 24/7-Verfügbarkeit.',
      },
    },
  ],
};

export default function WladJachtchenkoPage() {
  useEffect(() => {
    document.title = 'Wlad Jachtchenko · Argumentations-Coach · Bio, Bücher, Leader-OS';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content',
      'Wlad Jachtchenko: Europas führender Argumentations-Coach, 3× SPIEGEL-Bestseller-Autor, Gründer der Argumentorik-Akademie und der KI-Coaching-Plattform Leader-OS. Biographie, Bücher, Methodik, Kontakt.',
    );

    const canon = document.createElement('link');
    canon.rel = 'canonical';
    canon.href = 'https://leader-os.de/wlad-jachtchenko';
    document.head.appendChild(canon);

    const ldPerson = document.createElement('script');
    ldPerson.type = 'application/ld+json';
    ldPerson.textContent = JSON.stringify(PERSON_JSON_LD);
    document.head.appendChild(ldPerson);

    const ldFaq = document.createElement('script');
    ldFaq.type = 'application/ld+json';
    ldFaq.textContent = JSON.stringify(FAQ_JSON_LD);
    document.head.appendChild(ldFaq);

    return () => {
      canon.remove();
      ldPerson.remove();
      ldFaq.remove();
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="wlad-page">
      <LandingNav />

      <main className="max-w-[1280px] mx-auto px-5 md:px-10 pt-16 md:pt-24 pb-16 md:pb-24">
        {/* Hero · Person identity card · stacked on mobile with centered
            wordmark over the portrait, side-by-side on md+ for the
            editorial spec layout. */}
        <section className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
          <div className="md:col-span-5 mx-auto md:mx-0 w-full">
            <div className="relative aspect-[4/5] w-full max-w-[420px] mx-auto md:mx-0 bg-foreground/5 border-2 border-foreground overflow-hidden">
              <img
                src={WLAD_AVATAR}
                onError={withFallback(WLAD_AVATAR_FALLBACKS)}
                alt="Wlad Jachtchenko · Europas führender Argumentations-Coach · 3× SPIEGEL-Bestseller · Gründer Leader-OS und Argumentorik-Akademie"
                width="420"
                height="525"
                fetchpriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-[50%_25%]"
              />
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-white/95 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-foreground">
                ▸ WLAD JACHTCHENKO
              </div>
              <div className="absolute bottom-3 right-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white drop-shadow">
                LEADER-OS · 2026
              </div>
            </div>
          </div>

          <div className="md:col-span-7 text-center md:text-left">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-4 font-mono">
              ▸ PERSON · WLAD JACHTCHENKO · EST. 2010
            </div>
            <h1
              className="text-[40px] sm:text-[56px] md:text-[88px] leading-[0.95] tracking-[-0.035em] text-foreground"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Wlad<br />Jachtchenko<span className="text-brand not-italic">.</span>
            </h1>
            <p className="mt-6 mx-auto md:mx-0 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.6] text-foreground/80 max-w-2xl">
              Europas führender Argumentations-Coach. Drei SPIEGEL-Bestseller.
              Vierhunderttausend trainierte Klienten. Fünfzehn Jahre Coaching-Praxis.
              Gründer der Argumentorik-Akademie und der KI-Coaching-Plattform Leader-OS.
            </p>

            {/* Quick CTAs · stacked + centered on mobile so each chip has a
                full row width and the lime trial button is unmissable. */}
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center md:justify-start gap-3">
              <Link
                to="/journal/wer-ist-wlad-jachtchenko"
                className="inline-flex items-center gap-2 px-5 h-12 bg-foreground hover:bg-brand text-white hover:text-foreground font-bold text-[12.5px] uppercase tracking-[0.14em] transition-colors"
              >
                Voller Lebenslauf
              </Link>
              <a
                href="https://leaderos.de/signup?trial=14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 h-12 bg-brand hover:bg-white text-foreground font-bold text-[12.5px] uppercase tracking-[0.14em] border-2 border-foreground transition-colors"
              >
                Leader-OS 14 Tage testen
              </a>
              <a
                href="https://www.linkedin.com/in/wladjachtchenko/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 h-12 text-foreground hover:text-brand-strong font-bold text-[12.5px] uppercase tracking-[0.14em] transition-colors"
              >
                LinkedIn <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Facts box · Wikipedia-style for AI Overview lift */}
        <section className="mt-20 md:mt-28 grid md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-5 text-center md:text-left">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-4 font-mono">
              ▸ FAKTEN · KOMPAKT
            </p>
            <h2
              className="text-[28px] sm:text-[32px] md:text-[44px] leading-[1.04] tracking-[-0.03em] text-foreground"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Auf einen Blick<span className="text-brand not-italic">.</span>
            </h2>
            <p className="mt-4 text-[14.5px] leading-[1.6] text-foreground/70">
              Daten und Zahlen die in jedem Pitch, jedem Pressetext und jedem
              LinkedIn-Profil auftauchen · hier einmal kuratiert.
            </p>
          </div>
          <div className="md:col-span-7">
            <dl className="border-t-2 border-foreground">
              {FACTS.map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-col sm:grid sm:grid-cols-3 gap-1.5 sm:gap-4 py-4 border-b border-foreground/15"
                >
                  <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/55">
                    {k}
                  </dt>
                  <dd className="sm:col-span-2 text-[14.5px] md:text-[15.5px] leading-[1.5] text-foreground font-semibold">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Books · SPIEGEL-Bestseller trio */}
        <section className="mt-20 md:mt-28">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end mb-10 md:mb-12">
            <div className="md:col-span-7 text-center md:text-left">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-4 font-mono">
                ▸ BÜCHER · 12 PUBLIZIERT
              </p>
              <h2
                className="text-[28px] sm:text-[36px] md:text-[52px] leading-[1.02] tracking-[-0.03em] text-foreground"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Drei davon<br />SPIEGEL-Bestseller<span className="text-brand not-italic">.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:pb-3 text-center md:text-left">
              <p className="text-[14.5px] md:text-[15.5px] leading-[1.6] text-foreground/70">
                Verkauft sich in zwei Welten zugleich: mittelständische Vorstandsetagen
                im Schwarzwald und Strategie-Berater in Berlin lesen dieselben Seiten.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {BOOKS.map((b) => (
              <article key={b.title} className="border-2 border-foreground p-6 md:p-7 hover:bg-foreground/[0.03] transition-colors">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 border border-brand-strong text-brand-strong font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] mb-5">
                  ★ {b.badge}
                </div>
                <h3
                  className="text-[24px] md:text-[28px] leading-[1.05] tracking-[-0.025em] text-foreground"
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
                >
                  {b.title.replace(/\.$/, '')}<span className="text-brand-strong not-italic">.</span>
                </h3>
                <p className="mt-3 text-[14px] leading-[1.55] text-foreground/65">
                  {b.sub}
                </p>
              </article>
            ))}
          </div>

          <a
            href="https://wladjachtchenko.de/buecher"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-foreground hover:text-brand-strong transition-colors"
          >
            Alle 12 Bücher ansehen <ArrowUpRight size={14} />
          </a>
        </section>

        {/* Quote · the iconic one · scales down on mobile so it stays
            inside the viewport on a 375px screen without ripping the
            sentence apart at awkward break points. */}
        <section className="mt-20 md:mt-28 border-y-2 border-foreground py-14 md:py-20">
          <blockquote
            className="text-[28px] sm:text-[40px] md:text-[60px] lg:text-[72px] leading-[1.06] tracking-[-0.03em] text-foreground max-w-5xl text-center md:text-left mx-auto md:mx-0"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            „Führung ist Skill. Skill ist trainierbar.
            Wer Skill für Talent hält, lernt nie zu führen<span className="text-brand not-italic">.</span>"
          </blockquote>
          <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/55 text-center md:text-left">
            ▸ WLAD JACHTCHENKO · METHODIK-KERNSATZ
          </p>
        </section>

        {/* Wlad's projects · the three properties he runs */}
        <section className="mt-20 md:mt-28">
          <div className="text-center md:text-left">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-4 font-mono">
              ▸ DREI PROJEKTE · ALLE LIVE
            </p>
            <h2
              className="text-[28px] sm:text-[36px] md:text-[52px] leading-[1.02] tracking-[-0.03em] text-foreground"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Wo Wlad heute arbeitet<span className="text-brand not-italic">.</span>
            </h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5 md:gap-6">
            {[
              { name: 'Leader-OS',
                sub: 'KI-Coaching-Plattform · seit 2026',
                desc: 'Wlads Methodik in einer Plattform. WladBot, 11 Frameworks, Klasse 0001 Charter.',
                href: 'https://leader-os.de',
                cta: 'leader-os.de' },
              { name: 'Argumentorik-Akademie',
                sub: 'Staatlich anerkannt · seit 2014',
                desc: 'Sechs-monatige Ausbildung zum Argumentations-Coach. Mehrere tausend Absolventen.',
                href: 'https://wladjachtchenko.de',
                cta: 'wladjachtchenko.de' },
              { name: 'Wlad spricht · Podcast',
                sub: '14 Millionen Views · wöchentlich',
                desc: 'Episoden zu Führung, Rhetorik, KI im Alltag. Auf Apple Podcasts und Spotify.',
                href: 'https://podcast.wladjachtchenko.de',
                cta: 'podcast.wladjachtchenko.de' },
            ].map((p) => (
              <article key={p.name} className="border-2 border-foreground p-6 md:p-7 hover:bg-foreground/[0.03] transition-colors flex flex-col">
                <h3
                  className="text-[22px] md:text-[26px] leading-[1.05] tracking-[-0.025em] text-foreground"
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
                >
                  {p.name}<span className="text-brand-strong not-italic">.</span>
                </h3>
                <p className="mt-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/55">
                  {p.sub}
                </p>
                <p className="mt-4 text-[14px] leading-[1.55] text-foreground/72 flex-1">
                  {p.desc}
                </p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground hover:text-brand-strong transition-colors"
                >
                  {p.cta} <ArrowUpRight size={13} />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Press / journalists · the surface that journalists Google-and-cite */}
        <section className="mt-20 md:mt-28 bg-foreground text-background p-6 sm:p-8 md:p-12">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center text-center md:text-left">
            <div className="md:col-span-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-4 font-mono">
                ▸ PRESSE · JOURNALISTEN
              </p>
              <h2
                className="text-[24px] sm:text-[28px] md:text-[40px] leading-[1.04] tracking-[-0.025em]"
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              >
                Pressefotos, Bio, Sprecher-Anfragen<span className="text-brand not-italic">.</span>
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.6] text-background/75 mx-auto md:mx-0">
                Für Interviews, Keynotes oder Hintergrundgespräche · einfach Mail an
                start@aiporate.com. Bio in zwei Längen, Pressefoto in 4K, und ein
                kuratierter Zitat-Pool stehen auf Anfrage bereit.
              </p>
            </div>
            <div className="md:col-span-5 md:text-right">
              <a
                href="mailto:start@aiporate.com?subject=Presse-Anfrage%20zu%20Wlad%20Jachtchenko"
                className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-brand hover:bg-white text-foreground font-bold text-[12.5px] uppercase tracking-[0.14em] transition-colors"
              >
                Presse-Anfrage senden
              </a>
            </div>
          </div>
        </section>

        {/* Entity-disambiguation lives in the Person JSON-LD's alternateName
            field (machine-readable, helps search engines resolve variant
            spellings) · we do not surface the variants visually anymore
            because brand discipline requires a single canonical
            wordmark on screen: "Wlad Jachtchenko". */}

        {/* Viral surface · readers landing on this page are doing
            authority-research about Wlad · the moment they finish
            reading is exactly when LinkedIn-share intent peaks. */}
        <ShareBar
          url="https://leader-os.de/wlad-jachtchenko"
          title="Wlad Jachtchenko · Argumentations-Coach · 3× SPIEGEL-Bestseller"
          summary="Europas führender Argumentations-Coach. Fünfzehn Jahre Coaching-Praxis. Gründer der Argumentorik-Akademie und Leader-OS."
          slug="wlad-jachtchenko"
        />
      </main>

      <LandingFooter />
    </div>
  );
}
