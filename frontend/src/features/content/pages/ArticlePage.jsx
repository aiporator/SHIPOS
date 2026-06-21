import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { LandingNav } from '../../../components/landing/LandingNav';
import { LandingFooter } from '../../../components/landing/LandingFooter';
import { useArticle, useRelatedArticles } from '../hooks/useArticle';
import { BlocksRenderer } from '../components/BlockRenderer';
import { ReadingProgress } from '../components/ReadingProgress';
import { RelatedArticles } from '../components/RelatedArticles';
import { NewsletterDrop } from '../components/NewsletterDrop';
import { applySeoToDocument, applyArticleJsonLd, buildArticleSeo } from '../utils/seo';

const TYPE_LABEL = {
  article: 'ARTICLE',
  guide: 'GUIDE',
  'field-note': 'FIELD NOTE',
  'case-study': 'CASE STUDY',
};

export default function ArticlePage() {
  const { slug } = useParams();
  const article = useArticle(slug);
  const related = useRelatedArticles(article, 2);

  useEffect(() => {
    if (!article) return undefined;
    const seo = buildArticleSeo(article);
    const restoreSeo = applySeoToDocument(seo);
    const removeJsonLd = applyArticleJsonLd(article, seo);
    return () => {
      restoreSeo();
      removeJsonLd();
    };
  }, [article]);

  if (!article) return <Navigate to="/journal" replace />;

  const date = new Date(article.publishedAt).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid={`article-${article.slug}`}>
      <ReadingProgress />
      <LandingNav />

      <main className="max-w-[760px] mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-16 md:pb-24">
        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-5 text-[10px] font-bold uppercase tracking-[0.22em] font-mono">
            <Link to="/journal" className="text-foreground/55 hover:text-foreground transition-colors">
              ← Feldnotizen
            </Link>
            <span aria-hidden className="text-foreground/20">/</span>
            <span className="text-brand-strong">{TYPE_LABEL[article.type] || 'ARTICLE'}</span>
            <span aria-hidden className="text-foreground/20">/</span>
            <span className="text-foreground/55">{article.readingMinutes} MIN</span>
          </div>

          <h1
            className="text-[40px] sm:text-[56px] md:text-[72px] leading-[0.95] tracking-[-0.035em] text-foreground"
            style={{
              fontFamily: 'Outfit, Inter, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
            }}
          >
            {article.title.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
          </h1>

          {article.description && (
            <p className="mt-6 text-[18px] md:text-[20px] leading-[1.5] text-foreground/70 max-w-2xl">
              {article.description}
            </p>
          )}

          <div className="mt-8 pt-4 border-t border-foreground/10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/55 font-mono">
            <span>{article.author ?? 'Wlad Jachtchenko'}</span>
            <span aria-hidden className="text-foreground/20">·</span>
            <span>{date}</span>
            {(article.tags ?? []).slice(0, 3).map((t) => (
              <span key={t} className="text-foreground/45">· {t}</span>
            ))}
          </div>
        </header>

        <article className="text-foreground">
          <BlocksRenderer blocks={article.body} />
        </article>

        <NewsletterDrop articleSlug={article.slug} />

        <RelatedArticles articles={related} />
      </main>

      <LandingFooter />
    </div>
  );
}
