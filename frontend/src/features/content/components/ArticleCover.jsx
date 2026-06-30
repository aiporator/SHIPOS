import { WladBotThumbnail } from './WladBotThumbnail';

/**
 * ArticleCover · one decision point for every journal cover.
 *   - Article has a real photographic `cover` → render it with the
 *     newsroom-halftone editorial treatment (grayscale + lime tint).
 *   - No cover → render the branded WladBot thumbnail (thumbnail-with-text),
 *     so the journal reads as one consistent branded set instead of random
 *     stock photography. Self-falls-back if wladbot3.0.png isn't there yet.
 */
export const ArticleCover = ({
  article,
  eyebrow = 'LEADER·OS',
  wrapClassName = '',
  imgClassName = 'absolute inset-0 w-full h-full object-cover',
  halftone = true,
  ink = false,
  eager = false,
}) => {
  if (article?.cover) {
    return (
      <div
        className={`relative ${halftone ? `newsroom-halftone ${ink ? 'newsroom-halftone--ink' : ''} ` : ''}${wrapClassName}`}
      >
        <img
          src={article.cover}
          alt={article.title}
          loading={eager ? 'eager' : 'lazy'}
          {...(eager ? { fetchPriority: 'high' } : {})}
          decoding="async"
          className={imgClassName}
        />
      </div>
    );
  }
  return (
    <div className={`relative ${wrapClassName}`}>
      <WladBotThumbnail title={article?.title || ''} eyebrow={eyebrow} />
    </div>
  );
};
