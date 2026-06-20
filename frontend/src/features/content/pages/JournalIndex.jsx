import { useEffect } from 'react';
import { LandingNav } from '../../../components/landing/LandingNav';
import { LandingFooter } from '../../../components/landing/LandingFooter';
import { listArticles, listTags } from '../data/registry';
import { ArticleCard } from '../components/ArticleCard';
import { applySeoToDocument } from '../utils/seo';

/**
 * JournalIndex — /journal landing.
 *
 * Editorial card grid of every published article, newest first. Tag
 * pills underneath the headline let visitors filter without leaving
 * the page (simple in-URL ?tag= filter, no router work yet).
 */
// Curated buckets so the Knowledge Hub doesn't read as one flat card wall.
// Slugs are ordered intentionally; anything not listed lands in "Methodik".
const PLATFORM_SLUGS = [
  'warum-leader-os',
  'was-in-leader-os-drin-ist',
  'dein-erster-tag-mit-leader-os',
  'wladbot-vs-chatgpt-vs-coach',
  'leader-os-fuer-engineering-leitung',
  'leader-os-fuer-hr-und-people-ops',
  'leader-os-fuer-scaleup-gruender',
  'leader-os-im-team-rollout',
  'der-business-case-fuer-leader-os',
  'leader-os-vs-klassisches-coaching',
  'leader-os-fuer-mittelstand-ceo',
  'leader-os-fuer-cto-und-tech-vorstand',
  'leader-os-fuer-vertriebsleitung',
  'leader-os-fuer-neu-befoerderte-leads',
];

export default function JournalIndex() {
  const platformArticles = listArticles({ slugs: PLATFORM_SLUGS });
  const platformSet = new Set(PLATFORM_SLUGS);
  const methodikArticles = listArticles().filter((a) => !platformSet.has(a.slug));
  const tags = listTags();

  useEffect(() => {
    return applySeoToDocument({
      title: 'Feldnotizen · Leader-OS',
      description:
        'Notizen aus 400 000 Coachings. Frameworks, Skripte, ' +
        'Beobachtungen aus Wlads Methodik. Kein Spam, alle paar Wochen.',
      canonical: 'https://leader-os.de/journal',
      keywords: tags,
      robots: 'index, follow, max-image-preview:large',
    });
  }, [tags]);

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="journal-index">
      <LandingNav />

      <main className="max-w-[1280px] mx-auto px-5 md:px-10 pt-24 md:pt-32 pb-24 md:pb-32">
        <header className="max-w-3xl mb-16 md:mb-20">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-5 font-mono">
            ▸ LEADER-OS · FELDNOTIZEN
          </p>
          <h1
            className="text-[48px] sm:text-[72px] md:text-[96px] leading-[0.92] tracking-[-0.04em] text-foreground"
            style={{
              fontFamily: 'Outfit, Inter, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
            }}
          >
            Notizen aus dem<br />
            <span className="text-foreground/55">Coaching-Feld</span>
            <span className="text-brand not-italic">.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-foreground/70">
            Was wirklich funktioniert. Was nicht. Frameworks, Skripte,
            Beobachtungen aus Wlads Methodik. Eine kurze Notiz alle
            paar Wochen.
          </p>
        </header>

        {tags.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono mr-2">
              THEMEN ·
            </span>
            {tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] font-mono border border-foreground/15 text-foreground/70"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {platformArticles.length === 0 && methodikArticles.length === 0 ? (
          <p className="text-[16px] text-foreground/55">Bald mehr.</p>
        ) : (
          <>
            {platformArticles.length > 0 && (
              <section aria-label="Plattform-Hub" className="mb-16 md:mb-20">
                <div className="flex items-baseline justify-between flex-wrap gap-3 mb-7">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-2 font-mono">
                      ▸ PLATTFORM · WARUM UND WIE
                    </p>
                    <h2
                      className="text-[28px] sm:text-[36px] md:text-[44px] leading-[0.95] tracking-[-0.03em] text-foreground"
                      style={{
                        fontFamily: 'Outfit, Inter, sans-serif',
                        fontWeight: 900,
                        fontStyle: 'italic',
                      }}
                    >
                      Leader-OS verstehen<span className="text-brand not-italic">.</span>
                    </h2>
                  </div>
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono">
                    {platformArticles.length} Artikel
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  {platformArticles.map((a) => <ArticleCard key={a.slug} article={a} />)}
                </div>
              </section>
            )}

            {methodikArticles.length > 0 && (
              <section aria-label="Methodik und KI-Wissen">
                <div className="flex items-baseline justify-between flex-wrap gap-3 mb-7">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-2 font-mono">
                      ▸ METHODIK + KI-WISSEN
                    </p>
                    <h2
                      className="text-[28px] sm:text-[36px] md:text-[44px] leading-[0.95] tracking-[-0.03em] text-foreground"
                      style={{
                        fontFamily: 'Outfit, Inter, sans-serif',
                        fontWeight: 900,
                        fontStyle: 'italic',
                      }}
                    >
                      Frameworks. Field Notes. Prompts<span className="text-brand not-italic">.</span>
                    </h2>
                  </div>
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono">
                    {methodikArticles.length} Artikel
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  {methodikArticles.map((a) => <ArticleCard key={a.slug} article={a} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
