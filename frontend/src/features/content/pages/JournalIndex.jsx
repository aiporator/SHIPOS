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
export default function JournalIndex() {
  const articles = listArticles();
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

        {articles.length === 0 ? (
          <p className="text-[16px] text-foreground/55">Bald mehr.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
