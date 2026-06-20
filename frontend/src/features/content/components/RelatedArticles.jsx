import { ArticleCard } from './ArticleCard';

export const RelatedArticles = ({ articles }) => {
  if (!articles || articles.length === 0) return null;
  return (
    <section
      aria-label="Verwandte Artikel"
      data-testid="related-articles"
      className="mt-20 md:mt-28 pt-10 border-t border-foreground/15"
    >
      <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-6 font-mono">
        ▸ WEITER LESEN
      </p>
      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
};
