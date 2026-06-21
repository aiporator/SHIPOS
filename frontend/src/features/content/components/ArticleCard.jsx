import { Link } from 'react-router-dom';
import { readingTime } from '../utils/readingTime';

const TYPE_LABEL = {
  article: 'ARTICLE',
  guide: 'GUIDE',
  'field-note': 'FIELD NOTE',
  'case-study': 'CASE STUDY',
};

/**
 * ArticleCard — entry in the JournalIndex grid.
 *
 * Brand: editorial specimen card with hairline border, lime accent on
 * the type label, type+date+reading-time mono strip, lime period on
 * the title. No image dependency (Phase 3 articles haven't shipped
 * imagery yet); if a cover is present, BlockRenderer's <Image/>
 * handles it inside the article instead.
 */
export const ArticleCard = ({ article }) => {
  const minutes = article.readingMinutes ?? readingTime(article.body);
  const date = new Date(article.publishedAt).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  return (
    <article
      data-testid={`article-card-${article.slug}`}
      className="group relative border border-foreground/12 hover:border-foreground/40 rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-22px_rgba(0,0,0,0.18)] bg-background"
    >
      <div className="flex items-center justify-between mb-5 text-[10px] font-bold uppercase tracking-[0.22em] font-mono">
        <span className="text-brand-strong">{TYPE_LABEL[article.type] || 'ARTICLE'}</span>
        <span className="text-foreground/45">{minutes} MIN</span>
      </div>

      <h3
        className="text-[24px] md:text-[28px] leading-[1.05] tracking-[-0.025em] text-foreground"
        style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
      >
        {article.title.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
      </h3>

      <p className="mt-3 text-[14px] leading-[1.5] text-foreground/65 flex-1">
        {article.description}
      </p>

      <div className="mt-6 pt-4 border-t border-foreground/10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/45 font-mono">
          {date}
        </span>
        <Link
          to={`/journal/${article.slug}`}
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground hover:text-brand-strong transition-colors"
          aria-label={`Artikel lesen: ${article.title}`}
        >
          Lesen <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Whole card hit-target for ease of click. */}
      <Link
        to={`/journal/${article.slug}`}
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0"
      />
    </article>
  );
};
