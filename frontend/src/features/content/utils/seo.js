/**
 * SEO helpers for the content engine.
 *
 * Articles carry their own `seo` block (title, description, canonical,
 * ogImage, keywords). This module owns the imperative DOM updates that
 * happen on route entry. No React, no head manager dep — CRA + react-
 * router-v6 means we don't have react-helmet wired and adding it for
 * one feature is over-altitude.
 */

const SITE_BASE = 'https://leader-os.de';

export function buildArticleSeo(article) {
  const explicit = article.seo ?? {};
  return {
    title: explicit.title ?? `${article.title} · Feldnotizen · Leader-OS`,
    description: explicit.description ?? article.description ?? '',
    canonical: explicit.canonical ?? `${SITE_BASE}/journal/${article.slug}`,
    ogImage: explicit.ogImage ?? article.cover ?? null,
    keywords: explicit.keywords ?? article.tags ?? [],
    robots: explicit.robots ?? 'index, follow, max-image-preview:large',
  };
}

/**
 * Apply the SEO block to the live document. Returns a cleanup function
 * that restores the previous values. Idempotent across re-mounts.
 */
export function applySeoToDocument(seo) {
  if (typeof document === 'undefined') return () => {};

  const prevTitle = document.title;
  const meta = {
    description: setMeta('name', 'description', seo.description),
    keywords: setMeta('name', 'keywords', (seo.keywords ?? []).join(', ')),
    robots: setMeta('name', 'robots', seo.robots),
    canonical: setLink('canonical', seo.canonical),
    ogTitle: setMeta('property', 'og:title', seo.title),
    ogDescription: setMeta('property', 'og:description', seo.description),
    ogUrl: setMeta('property', 'og:url', seo.canonical),
    ogType: setMeta('property', 'og:type', 'article'),
    ogImage: seo.ogImage ? setMeta('property', 'og:image', seo.ogImage) : null,
  };

  document.title = seo.title;

  return () => {
    document.title = prevTitle;
    Object.values(meta).forEach((entry) => entry?.restore?.());
  };
}

function setMeta(attr, key, value) {
  if (!value) return null;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  let created = false;
  let prev = null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
    created = true;
  } else {
    prev = el.getAttribute('content');
  }
  el.setAttribute('content', value);
  return {
    restore: () => {
      if (created) el.remove();
      else if (prev !== null) el.setAttribute('content', prev);
    },
  };
}

function setLink(rel, href) {
  if (!href) return null;
  let el = document.querySelector(`link[rel="${rel}"]`);
  let created = false;
  let prev = null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
    created = true;
  } else {
    prev = el.getAttribute('href');
  }
  el.setAttribute('href', href);
  return {
    restore: () => {
      if (created) el.remove();
      else if (prev !== null) el.setAttribute('href', prev);
    },
  };
}

/**
 * JSON-LD article schema for an individual article page. Injects a
 * single <script type="application/ld+json"> into <head> and returns
 * a cleanup that removes it on unmount.
 */
export function applyArticleJsonLd(article, seo) {
  if (typeof document === 'undefined') return () => {};
  const data = {
    '@context': 'https://schema.org',
    '@type': article.type === 'guide' ? 'TechArticle' : 'BlogPosting',
    headline: article.title,
    description: seo.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author ?? 'Wlad Jachtchenko',
      url: 'https://leader-os.de',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Leader-OS',
      url: 'https://leader-os.de',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': seo.canonical },
    image: seo.ogImage ? [seo.ogImage] : undefined,
    keywords: (seo.keywords ?? []).join(', '),
  };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  el.dataset.articleSlug = article.slug;
  document.head.appendChild(el);
  return () => el.remove();
}
