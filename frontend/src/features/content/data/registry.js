/**
 * Article registry — the single source of truth for all published
 * content. Static imports (no dynamic `import('./articles/' + slug)`)
 * because dynamic imports with computed paths are awkward with CRA's
 * webpack and break bundler-side static analysis.
 *
 * To add an article: import it here, add to ARTICLES, done. The
 * registry order is the default chronological list (newest first
 * after the sort below). Filtering happens via `listArticles({...})`.
 */
import warumFrameworksNichtImKopfBleiben from './articles/warum-frameworks-nicht-im-kopf-bleiben';
import sprintOderMarathon from './articles/sprint-oder-marathon';
import dieFeedbackFormelBww from './articles/die-feedback-formel-bww';
import wieLenaIhrTownhallDrehte from './articles/wie-lena-ihr-townhall-drehte';
import deinKalenderFuehrtDich from './articles/dein-kalender-fuehrt-dich';
import kiImFuehrungsAlltagDreiUseCases from './articles/ki-im-fuehrungs-alltag-drei-use-cases';
import chatgptAlsSparringPartnerFuenfSkripte from './articles/chatgpt-als-sparring-partner-fuenf-skripte';

const ARTICLES = [
  warumFrameworksNichtImKopfBleiben,
  sprintOderMarathon,
  dieFeedbackFormelBww,
  wieLenaIhrTownhallDrehte,
  deinKalenderFuehrtDich,
  kiImFuehrungsAlltagDreiUseCases,
  chatgptAlsSparringPartnerFuenfSkripte,
];

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

/**
 * Get an article by slug. Returns null if missing or unpublished.
 */
export function getArticle(slug) {
  const found = BY_SLUG.get(slug);
  if (!found) return null;
  if (found.status && found.status !== 'published') return null;
  return found;
}

/**
 * List articles, newest first.
 *
 * @param {Object} [options]
 * @param {string} [options.type]   — filter by 'article' | 'guide' | 'field-note' | 'case-study'
 * @param {string} [options.tag]    — filter by tag (case-insensitive)
 * @param {string[]} [options.slugs]— preserve given order (used by RelatedArticles)
 * @param {number} [options.limit]
 */
export function listArticles(options = {}) {
  let out = ARTICLES.filter((a) => !a.status || a.status === 'published');

  if (options.type) {
    out = out.filter((a) => a.type === options.type);
  }
  if (options.tag) {
    const t = options.tag.toLowerCase();
    out = out.filter((a) => (a.tags ?? []).some((x) => x.toLowerCase() === t));
  }
  if (options.slugs) {
    const order = new Map(options.slugs.map((s, i) => [s, i]));
    out = out
      .filter((a) => order.has(a.slug))
      .sort((a, b) => order.get(a.slug) - order.get(b.slug));
  } else {
    out = [...out].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }

  if (typeof options.limit === 'number') out = out.slice(0, options.limit);
  return out;
}

/**
 * The full set of unique tags across all published articles.
 */
export function listTags() {
  const set = new Set();
  for (const a of ARTICLES) {
    if (a.status && a.status !== 'published') continue;
    for (const t of a.tags ?? []) set.add(t);
  }
  return Array.from(set).sort();
}
