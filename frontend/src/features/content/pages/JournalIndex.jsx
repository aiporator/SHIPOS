import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { LandingNav } from '../../../components/landing/LandingNav';
import { LandingFooter } from '../../../components/landing/LandingFooter';
import { listArticles } from '../data/registry';
import { TAXONOMY, groupByTaxonomy } from '../data/taxonomy';
import { applySeoToDocument } from '../utils/seo';

/**
 * JournalIndex — /journal landing.
 *
 * Vice-/Editorial-style full-width hub. No max-width cage around the body.
 * The hub is built as a magazine, not a card wall:
 *
 *   1. Full-bleed hero with big italic display lockup
 *   2. Curated category nav strip (sticky-ish at top of scroll)
 *   3. Per-category section: large lead-card on the left, side-rail of
 *      smaller minis on the right (vice-style)
 *   4. Inline funnel CTA after every 2-3 categories (Archetyp-Quiz teaser
 *      + newsletter capture) — interactive, not just read-and-leave
 *   5. Newsletter / Klasse 0001 close-out
 *
 * Tags are now real categories (KI-Praxis, Methoden, Rhetorik, Rollen,
 * Plattform) — see ../data/taxonomy.js. Each category has tagline +
 * funnel-label so the index reads as a curated brand-magazine.
 */

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const readingMinutes = (article) => {
  const words = (article.body ?? []).reduce((sum, block) => {
    if (typeof block?.text === 'string') return sum + block.text.split(/\s+/).length;
    if (typeof block?.explanation === 'string') return sum + block.explanation.split(/\s+/).length;
    return sum;
  }, 0);
  if (!words) return 4;
  return Math.max(2, Math.round(words / 220));
};

// ─────────────────────────────────────────────────────────────────────────
// Article cards
// ─────────────────────────────────────────────────────────────────────────
const LeadCard = ({ article, category }) => {
  const mins = readingMinutes(article);
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-lead-${article.slug}`}
      className="group block bg-foreground text-background hover:bg-brand hover:text-black transition-colors"
    >
      <div className="aspect-[16/10] relative overflow-hidden bg-foreground/95">
        {article.cover ? (
          <img
            src={article.cover}
            alt={article.coverAlt || article.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-8">
            <span
              className="text-[120px] md:text-[180px] leading-none tracking-[-0.05em] opacity-15 text-background group-hover:text-black/15"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              {category.code.replace('C-', '')}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-brand text-black px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
          ▸ LEAD-ARTIKEL
        </div>
      </div>
      <div className="p-7 md:p-10">
        <div className="flex items-center gap-3 mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] opacity-65 group-hover:opacity-100">
          <span className="text-brand group-hover:text-black">{category.name}</span>
          <span className="opacity-50">·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="opacity-50">·</span>
          <span>{mins} MIN</span>
        </div>
        <h3
          className="text-[32px] md:text-[48px] leading-[0.96] tracking-[-0.035em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          {article.title.replace(/\.$/, '')}<span className="text-brand group-hover:text-foreground not-italic">.</span>
        </h3>
        <p className="mt-5 text-[15px] md:text-[16.5px] leading-[1.6] opacity-75 line-clamp-3">
          {article.description}
        </p>
        <div className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em]">
          Artikel lesen
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

const MiniCard = ({ article, category, index }) => {
  const mins = readingMinutes(article);
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-mini-${article.slug}`}
      className="group block border-2 border-foreground bg-background hover:bg-brand/5 transition-colors p-5 md:p-6"
    >
      <div className="flex items-center gap-3 mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55">
        <span className="text-brand-strong">{String(index + 2).padStart(2, '0')} · {category.name}</span>
        <span className="opacity-30">·</span>
        <span>{mins} MIN</span>
      </div>
      <h4
        className="text-[18px] md:text-[22px] leading-[1.1] tracking-[-0.025em] text-foreground"
        style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
      >
        {article.title.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
      </h4>
      <p className="mt-3 text-[13.5px] leading-[1.5] text-foreground/65 line-clamp-3">
        {article.description}
      </p>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Inline funnel CTAs that appear between category sections
// ─────────────────────────────────────────────────────────────────────────
const ArchetypTeaserCTA = () => (
  <section
    aria-label="Archetyp-Quiz Teaser"
    className="bg-[#0A0A0A] text-white relative overflow-hidden"
  >
    <div
      aria-hidden
      className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(191,255,0,0.10) 0%, transparent 65%)',
        filter: 'blur(40px)',
      }}
    />
    <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
      <div className="md:col-span-8">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-4">
          ▸ ZWISCHENSTOPP · 60 SEKUNDEN
        </div>
        <h3
          className="text-[32px] md:text-[52px] leading-[0.95] tracking-[-0.035em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Welcher KI-Leader<br />
          <span className="text-white/55">bist du wirklich</span>
          <span className="text-brand not-italic">?</span>
        </h3>
        <p className="mt-5 max-w-xl text-[15px] md:text-[16.5px] leading-[1.6] text-white/75">
          5 Fragen, ein Archetyp, ein konkreter Lernpfad. Kein Login, kein Spam.
        </p>
      </div>
      <div className="md:col-span-4 md:text-right">
        <Link
          to="/#archetyp"
          className="inline-flex items-center gap-3 px-6 h-14 bg-brand hover:bg-white text-black font-bold text-[14px] tracking-[0.02em] transition-colors"
        >
          Archetyp-Test starten
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);

const KlasseCTA = () => (
  <section
    aria-label="Klasse 0001 CTA"
    className="bg-brand text-black"
  >
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
      <div className="md:col-span-8">
        <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-black/60 mb-4">
          ▸ KLASSE 0001 · 30 CHARTER-PLÄTZE
        </div>
        <h3
          className="text-[32px] md:text-[52px] leading-[0.95] tracking-[-0.035em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Genug gelesen<span className="not-italic">.</span><br />
          <span className="text-black/55">Zeit es zu machen</span>
          <span className="not-italic">.</span>
        </h3>
        <p className="mt-5 max-w-xl text-[15px] md:text-[16.5px] leading-[1.6] text-black/75">
          30 Plätze, Charter-Preis, 6 Monate strukturierte Ausbildung mit
          Wlad persönlich. Lifetime-Zugang zur Klasse + Vorzug für 0002, 0003, 0004.
        </p>
      </div>
      <div className="md:col-span-4 md:text-right">
        <Link
          to="/#klassen"
          className="inline-flex items-center gap-3 px-6 h-14 bg-black hover:bg-foreground text-brand font-bold text-[14px] tracking-[0.02em] transition-colors shadow-[6px_6px_0_0_rgba(0,0,0,0.85)]"
        >
          Charter-Platz sichern
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────
// Category section: 1 lead-card + side-rail of minis
// ─────────────────────────────────────────────────────────────────────────
const CategorySection = ({ category }) => {
  if (!category.articles.length) return null;
  const [lead, ...rest] = category.articles;
  const minis = rest.slice(0, 4);
  const overflow = rest.length - minis.length;

  return (
    <section
      id={`cat-${category.slug}`}
      data-testid={`category-${category.slug}`}
      aria-label={category.name}
      className="border-t-2 border-foreground/[0.08] bg-background"
    >
      <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
        {/* Category header */}
        <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55">
              <span className="text-brand-strong">▸ {category.code}</span>
              <span className="opacity-30">·</span>
              <span>{category.funnelLabel}</span>
              <span className="opacity-30">·</span>
              <span>{category.articles.length} ARTIKEL</span>
            </div>
            <h2
              className="text-[36px] sm:text-[52px] md:text-[72px] leading-[0.92] tracking-[-0.04em] text-foreground"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              {category.name.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
            </h2>
            <p className="mt-3 text-[14px] md:text-[16px] font-semibold text-foreground/65">
              {category.tagline}
            </p>
            <p className="mt-3 max-w-2xl text-[13.5px] md:text-[15px] leading-[1.6] text-foreground/60">
              {category.description}
            </p>
          </div>
        </div>

        {/* Magazine grid: 1 lead left + 4 minis right rail */}
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-7">
            <LeadCard article={lead} category={category} />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-5 md:gap-6">
            {minis.map((a, i) => (
              <MiniCard key={a.slug} article={a} category={category} index={i} />
            ))}
            {overflow > 0 && (
              <Link
                to={`/journal?cat=${category.slug}`}
                className="block border-2 border-dashed border-foreground/30 p-5 hover:border-brand-strong hover:bg-brand/5 transition-colors"
              >
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/55">
                  ▸ +{overflow} WEITERE IN {category.name.toUpperCase()}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Sticky category nav
// ─────────────────────────────────────────────────────────────────────────
const CategoryStrip = ({ categories, search, setSearch }) => (
  <nav
    aria-label="Kategorie-Navigation"
    className="sticky top-20 z-20 bg-background/95 backdrop-blur-md border-y border-foreground/[0.06]"
  >
    <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45">
        ▸ FELDNOTIZEN ·
      </span>
      {categories.map((c) => (
        <a
          key={c.code}
          href={`#cat-${c.slug}`}
          className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/75 hover:text-brand-strong transition-colors"
        >
          {c.name}
          <span className="ml-1.5 opacity-50">({c.articles.length})</span>
        </a>
      ))}
      <div className="ml-auto flex items-center gap-2 border border-foreground/15 px-3 h-9">
        <Search size={13} className="text-foreground/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen…"
          className="bg-transparent outline-none text-[12px] font-semibold text-foreground placeholder:text-foreground/40 w-32 md:w-44"
          data-testid="journal-search"
        />
      </div>
    </div>
  </nav>
);

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function JournalIndex() {
  const [search, setSearch] = useState('');
  const articles = useMemo(() => listArticles(), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.toLowerCase();
    return articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [articles, search]);

  const categories = useMemo(() => groupByTaxonomy(filtered), [filtered]);

  useEffect(() => {
    return applySeoToDocument({
      title: 'Feldnotizen · KI-Praxis, Methoden, Rhetorik · Leader-OS',
      description:
        'Frameworks, Skripte und Field-Notes für KI-natives Führen — ' +
        'aus Wlad Jachtchenkos Arbeit mit über 400 000 Klienten. KI-Praxis, ' +
        'Methodik, Rhetorik, Rollen und der Pfad in Klasse 0001.',
      canonical: 'https://leader-os.de/journal',
      keywords: ['KI', 'Führung', 'Rhetorik', 'Frameworks', 'Wlad Jachtchenko', 'Leader-OS', 'Sprint 0001'],
      robots: 'index, follow, max-image-preview:large',
      ogImage: null,
    });
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="journal-index">
      <LandingNav />

      {/* ── Full-bleed editorial hero ── */}
      <header className="bg-[#0A0A0A] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(191,255,0,0.14) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="relative max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 pt-28 md:pt-40 pb-20 md:pb-28">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-brand mb-7 flex items-center gap-3 flex-wrap">
            <span>▸ FELDNOTIZEN</span>
            <span className="opacity-30">·</span>
            <span className="text-white/55">DAS KI-LEADERSHIP MAGAZIN</span>
            <span className="opacity-30">·</span>
            <span className="text-white/55">{articles.length} ARTIKEL</span>
          </div>
          <h1
            className="text-[64px] sm:text-[100px] md:text-[140px] lg:text-[180px] leading-[0.85] tracking-[-0.05em]"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Aus dem Feld<span className="text-brand not-italic">.</span><br />
            <span className="text-white/45">Nicht aus dem<br />Bullshit-Bingo</span>
            <span className="text-brand not-italic">.</span>
          </h1>
          <p className="mt-10 max-w-3xl text-[16px] md:text-[20px] leading-[1.55] text-white/75">
            Frameworks, Skripte, Beobachtungen aus Wlads Methodik —
            verdichtet aus über 400 000 Coachings und 3 SPIEGEL-Bestsellern.
            Kein Theorie-Bingo, kein Generisches. Jeder Artikel hat eine
            Methodik die du heute Nachmittag einsetzen kannst.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">
            <span>▸ NEUE NOTIZ ALLE PAAR WOCHEN</span>
            <span>▸ KEIN NEWSLETTER-SPAM</span>
            <span>▸ DSGVO-KONFORM · EU-HOSTING</span>
          </div>
        </div>
      </header>

      {/* Sticky category navigation */}
      <CategoryStrip categories={categories} search={search} setSearch={setSearch} />

      {/* ── Category Sections ──
          Funnel-CTA injection: after C-01 (KI-Praxis) the Archetyp-Quiz teaser,
          after C-04 (Rollen) the Klasse-0001-CTA. Built as a switch so the
          order stays explicit. */}
      <main>
        {categories.map((cat, i) => (
          <div key={cat.code}>
            <CategorySection category={cat} />
            {cat.code === 'C-01' && <ArchetypTeaserCTA />}
            {cat.code === 'C-04' && <KlasseCTA />}
          </div>
        ))}

        {/* Empty state if search returns nothing */}
        {filtered.length === 0 && (
          <section className="max-w-[1480px] mx-auto px-6 md:px-12 py-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-foreground/55">
              ▸ KEIN TREFFER FÜR "{search}". VERSUCH "KI", "RHETORIK", "FRAMEWORK".
            </p>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
