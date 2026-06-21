import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { LandingNav } from '../../../components/landing/LandingNav';
import { LandingFooter } from '../../../components/landing/LandingFooter';
import { listArticles } from '../data/registry';
import { groupByTaxonomy } from '../data/taxonomy';
import { resolveCover } from '../utils/covers';
import { applySeoToDocument } from '../utils/seo';

/**
 * JournalIndex — /journal · Players'-Tribune-style editorial hub.
 *
 *   1. Image-led hero (full-bleed cover of the week's lead article,
 *      classic centered Instrument-Serif italic title — NOT a huge
 *      sans-serif block).
 *   2. "TOP STORIES" 3-up image-overlay grid (title + byline on photo,
 *      Players' Tribune-style).
 *   3. Each category section: header strip → 1 big SPLIT card
 *      (text-left + image-right, ~50/50) → 3 image-first mini cards.
 *   4. Funnel CTA breaks weaved in:
 *        a. After C-01 KI-Praxis     → Archetyp-Quiz teaser (dark)
 *        b. After C-03 Rhetorik      → Diagnose-Test split block
 *        c. After C-04 Rollen        → Klasse 0001 charter block (lime)
 *   5. Sticky tiny category strip so deep-scroll users jump.
 *
 * Every card has an image (resolved via covers.js), and every section
 * funnels to either the article AND/OR the Leadership-Diagnose-Test
 * (`/#archetyp`). No flat all-card grid.
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

const authorOf = (article) =>
  article.author?.name || article.author || 'Wlad Jachtchenko';

const serifItalic = {
  fontFamily: "'Instrument Serif', 'Outfit', Georgia, serif",
  fontStyle: 'italic',
  fontWeight: 400,
  letterSpacing: '-0.01em',
};

// ─────────────────────────────────────────────────────────────────────────
// HERO — image-led, centered serif italic, NOT loud
// ─────────────────────────────────────────────────────────────────────────
const Hero = ({ article, totalCount }) => {
  if (!article) return null;
  const cover = resolveCover(article, 'lead');
  return (
    <header
      className="relative bg-[#0A0A0A] text-white overflow-hidden"
      data-testid="journal-hero"
    >
      <Link to={`/journal/${article.slug}`} className="block relative group">
        {/* Background image — sized like Players' Tribune hero */}
        <div className="relative h-[68vh] min-h-[560px] max-h-[820px] w-full">
          <img
            src={cover}
            alt={article.title}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-[1200ms] ease-out"
          />
          {/* Top vignette + bottom fade to white — TPT signature */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.08) 30%, rgba(10,10,10,0.18) 55%, rgba(255,255,255,0.0) 78%, var(--bg-fade,#ffffff) 100%)',
            }}
          />

          {/* Title block — centered, classic serif italic, modestly sized */}
          <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center text-center px-6">
            <div className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.32em] text-white/85 mb-5 flex items-center gap-3">
              <span className="text-brand">▸ Feldnotizen</span>
              <span className="opacity-50">·</span>
              <span>Das KI-Leadership Magazin</span>
            </div>
            <h1
              className="text-[44px] sm:text-[64px] md:text-[84px] lg:text-[104px] leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] max-w-[1100px]"
              style={serifItalic}
            >
              {article.title.replace(/\.$/, '')}
            </h1>
            <div className="mt-7 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">
              {authorOf(article)}
            </div>
          </div>
        </div>
      </Link>

      {/* Meta strip immediately below the image */}
      <div className="bg-white text-foreground border-b border-foreground/10">
        <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-foreground/60">
          <div className="flex items-center gap-x-5 gap-y-1 flex-wrap">
            <span className="text-brand-strong">▸ Lead-Story</span>
            <span className="opacity-30">·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="opacity-30">·</span>
            <span>{readingMinutes(article)} Min</span>
          </div>
          <div className="flex items-center gap-x-5 gap-y-1 flex-wrap">
            <span>{totalCount} Artikel im Archiv</span>
            <Link
              to="/#archetyp"
              className="hover:text-brand-strong transition-colors"
            >
              ▸ Diagnose-Test starten
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// TOP STORIES — Players'-Tribune 3-up image-overlay grid
// ─────────────────────────────────────────────────────────────────────────
const TopStoryCard = ({ article }) => {
  const cover = resolveCover(article, 'portrait');
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-top-${article.slug}`}
      className="group relative block overflow-hidden aspect-[4/5] bg-foreground"
    >
      <img
        src={cover}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms] ease-out"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.0) 38%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.78) 100%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
        <h3
          className="text-[26px] sm:text-[30px] md:text-[34px] leading-[1.02] max-w-[28ch]"
          style={serifItalic}
        >
          {article.title.replace(/\.$/, '')}
        </h3>
        <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/80">
          {authorOf(article)}
        </div>
      </div>
    </Link>
  );
};

const TopStories = ({ articles }) => {
  if (!articles.length) return null;
  return (
    <section
      aria-label="Top Stories"
      className="bg-white"
      data-testid="journal-top-stories"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-foreground/10">
        {articles.map((a) => (
          <TopStoryCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Section header — small mono caps + arrow link
// ─────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ category }) => (
  <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 pt-14 pb-6">
    <div className="flex items-center justify-between border-b border-foreground/15 pb-3">
      <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-foreground">
        <span>{category.name}</span>
        <span className="opacity-30">·</span>
        <span className="text-foreground/55">{category.funnelLabel}</span>
      </div>
      <a
        href={`#cat-${category.slug}`}
        className="inline-flex items-center justify-center w-9 h-9 border border-foreground/30 hover:bg-foreground hover:text-white transition-colors rounded-full"
        aria-label={`Alle Artikel in ${category.name}`}
      >
        <ArrowRight size={14} />
      </a>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// SPLIT CARD — left text panel + right photo panel (Players' Tribune)
// ─────────────────────────────────────────────────────────────────────────
const SplitCard = ({ article, imageOnRight = true }) => {
  const cover = resolveCover(article, 'wide');
  const text = (
    <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12 bg-white">
      <h3
        className="text-[26px] sm:text-[32px] md:text-[40px] leading-[1.02] text-foreground"
        style={serifItalic}
      >
        {article.title.replace(/\.$/, '')}
      </h3>
      <p className="mt-4 text-[14.5px] md:text-[16px] leading-[1.55] text-foreground/70 line-clamp-3">
        {article.description}
      </p>
      <div className="mt-7 font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-foreground/70">
        {authorOf(article)}
      </div>
    </div>
  );
  const photo = (
    <div className="relative overflow-hidden bg-foreground/5 aspect-[4/3] md:aspect-auto">
      <img
        src={cover}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[900ms] ease-out"
      />
    </div>
  );
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-split-${article.slug}`}
      className="group block bg-white border border-foreground/10 hover:border-foreground/30 transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {imageOnRight ? (<>{text}{photo}</>) : (<>{photo}{text}</>)}
      </div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// MINI image-first card (used in 3-up row)
// ─────────────────────────────────────────────────────────────────────────
const MiniCard = ({ article }) => {
  const cover = resolveCover(article, 'wide');
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-mini-${article.slug}`}
      className="group block bg-white border border-foreground/10 hover:border-foreground/30 transition-colors"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-foreground/5">
        <img
          src={cover}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[800ms] ease-out"
        />
      </div>
      <div className="p-5 md:p-6">
        <h4
          className="text-[19px] md:text-[22px] leading-[1.1] text-foreground"
          style={serifItalic}
        >
          {article.title.replace(/\.$/, '')}
        </h4>
        <p className="mt-2.5 text-[13px] leading-[1.5] text-foreground/65 line-clamp-2">
          {article.description}
        </p>
        <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/60">
          {authorOf(article)}
        </div>
      </div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Per-category section: header → split → 3 minis
// ─────────────────────────────────────────────────────────────────────────
const CategorySection = ({ category, splitDirection = true }) => {
  if (!category.articles.length) return null;
  const [lead, ...rest] = category.articles;
  const minis = rest.slice(0, 3);

  return (
    <section
      id={`cat-${category.slug}`}
      data-testid={`category-${category.slug}`}
      aria-label={category.name}
      className="bg-white"
    >
      <SectionHeader category={category} />

      <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 pb-4">
        <SplitCard article={lead} imageOnRight={splitDirection} />
      </div>

      {minis.length > 0 && (
        <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-5">
            {minis.map((a) => (
              <MiniCard key={a.slug} article={a} />
            ))}
          </div>
          {rest.length > minis.length && (
            <div className="mt-7 text-center">
              <Link
                to={`/journal?cat=${category.slug}`}
                className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/70 hover:text-brand-strong border-b border-foreground/20 hover:border-brand-strong pb-1 transition-colors"
              >
                Alle {rest.length} Artikel in {category.name}
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Funnel CTA blocks (Players'-Tribune-style "Letter to..." inserts)
// ─────────────────────────────────────────────────────────────────────────
const DiagnoseCTA = () => (
  <section
    aria-label="Leadership-Diagnose"
    className="bg-[#0A0A0A] text-white"
    data-testid="journal-cta-diagnose"
  >
    <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-0 border border-white/10">
        <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-foreground">
          <img
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&h=1200&fit=crop&crop=faces&auto=format&q=80"
            alt="Leadership Diagnose"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(10,10,10,0.0) 30%, rgba(10,10,10,0.55) 100%)',
            }}
          />
        </div>
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-5">
            ▸ Leadership-Diagnose · 60 Sekunden
          </div>
          <h3
            className="text-[32px] md:text-[46px] leading-[1.02]"
            style={serifItalic}
          >
            Welcher KI-Leader bist du wirklich?
          </h3>
          <p className="mt-5 max-w-xl text-[15px] md:text-[17px] leading-[1.55] text-white/75">
            5 Fragen. Ein Archetyp. Ein konkreter Lernpfad — abgestimmt auf
            Wlads Methodik und deinen aktuellen Rollen-Übergang.
            Kein Login. Kein Spam.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/#archetyp"
              className="inline-flex items-center gap-3 px-6 h-13 py-3.5 bg-brand hover:bg-white text-black font-bold text-[13.5px] tracking-[0.02em] transition-colors"
            >
              Diagnose-Test starten
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/journal"
              className="inline-flex items-center gap-3 px-6 py-3.5 border border-white/30 hover:border-white text-white font-bold text-[13.5px] tracking-[0.02em] transition-colors"
            >
              Erst weiterlesen
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ArchetypTeaserCTA = () => (
  <section
    aria-label="Archetyp-Quiz Teaser"
    className="bg-[#F5F5F5]"
    data-testid="journal-cta-archetyp"
  >
    <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-20">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
        <div className="md:col-span-7">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55 mb-4">
            ▸ Zwischenstopp · Diagnose
          </div>
          <h3
            className="text-[32px] md:text-[52px] leading-[1.02] text-foreground"
            style={serifItalic}
          >
            Bevor du weiterliest — kennst du deinen Archetyp?
          </h3>
        </div>
        <div className="md:col-span-5 md:text-right">
          <Link
            to="/#archetyp"
            className="inline-flex items-center gap-3 px-6 h-12 bg-foreground hover:bg-brand text-white hover:text-black font-bold text-[13px] tracking-[0.02em] transition-colors"
          >
            Test starten
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const KlasseCTA = () => (
  <section
    aria-label="Dein nächster Schritt"
    className="bg-brand text-black"
    data-testid="journal-cta-klasse"
  >
    <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-8">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-black/60 mb-5">
            ▸ Dein nächster Schritt · Staatlich anerkannte Führungskräfte-Ausbildung
          </div>
          <h3
            className="text-[36px] md:text-[58px] leading-[1.0]"
            style={serifItalic}
          >
            In 6 Monaten kann sich alles verändern.
          </h3>
          <p className="mt-5 max-w-2xl text-[15px] md:text-[17px] leading-[1.55] text-black/75">
            Oder du machst es weiter wie bisher. Beides hat einen Preis.
            Selbstbewusst dein Team führen, souverän und schlagfertig in
            herausfordernden Situationen — ohne Selbstzweifel, Gedankenkarussell
            oder unnötige Überstunden. 400 000+ zufriedene Klienten in 20 Ländern.
          </p>
        </div>
        <div className="md:col-span-4 md:text-right flex md:block flex-col gap-3">
          <Link
            to="/#beratung"
            className="inline-flex items-center justify-center gap-3 px-6 h-14 bg-black hover:bg-foreground text-brand font-bold text-[14px] tracking-[0.02em] transition-colors"
          >
            Beratungsgespräch buchen
            <ArrowRight size={18} />
          </Link>
          <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/55">
            ▸ Unverbindlich · 30 Min
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────
// Sticky category strip
// ─────────────────────────────────────────────────────────────────────────
const CategoryStrip = ({ categories, search, setSearch }) => (
  <nav
    aria-label="Kategorie-Navigation"
    className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-foreground/10"
  >
    <div className="max-w-[1480px] mx-auto px-6 md:px-12 lg:px-16 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45">
        ▸ Kategorien
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

  // Hero = newest article (already sorted by registry); top stories = the
  // next 3 newest, drawn from across all categories so the top of the page
  // reads as "what's hot this week", not "C-01 first 3".
  const heroArticle = filtered[0] || null;
  const topStories = filtered.slice(1, 4);

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

      {heroArticle && <Hero article={heroArticle} totalCount={articles.length} />}

      {topStories.length > 0 && <TopStories articles={topStories} />}

      <CategoryStrip categories={categories} search={search} setSearch={setSearch} />

      <main>
        {categories.map((cat, idx) => {
          const splitDir = idx % 2 === 0; // alternate image side per section
          return (
            <div key={cat.code}>
              <CategorySection category={cat} splitDirection={splitDir} />
              {cat.code === 'C-01' && <ArchetypTeaserCTA />}
              {cat.code === 'C-03' && <DiagnoseCTA />}
              {cat.code === 'C-04' && <KlasseCTA />}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <section className="max-w-[1480px] mx-auto px-6 md:px-12 py-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-foreground/55">
              ▸ Kein Treffer für "{search}". Versuch "KI", "Rhetorik", "Framework".
            </p>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
