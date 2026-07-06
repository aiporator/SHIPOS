import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { listArticles } from '../../features/content/data/registry';
import { ArticleCover } from '../../features/content/components/ArticleCover';

/**
 * JournalTeaserSection · featured articles auf der Landing.
 *
 * Zweck: SEO + Discoverability. Wir haben 130+ veröffentlichte Artikel
 * im content/registry, die meisten waren bisher nur über /journal
 * erreichbar · keine Linkjuice von der Homepage, keine Sichtbarkeit
 * für Erst-Besucher. Diese Section zieht die 3 aktuellsten Artikel
 * auf die Landing und gibt dem ganzen Journal eine prominente
 * Einstiegs-Rampe.
 *
 * Design: Editorial-Grid. Großer Lead-Article links, zwei kleinere
 * rechts (Magazin-Layout). Lime BIB-codes für die Topic-Tags, Mono
 * für Datum/Lesezeit, Outfit-italic-900 für Headlines.
 *
 * Trust pass: covers now route through the shared ArticleCover/
 * WladBotThumbnail system (real WladBot avatar + speech-bubble excerpt
 * on every card that lacks a photo) instead of a generic book icon, plus
 * a real byline + verified-facts strip so the section reads as
 * "written by someone real" rather than an anonymous content farm.
 */

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const readingMinutes = (article) => {
  // Rough estimate: count words in body paragraphs at 220 wpm.
  const words = (article.body ?? []).reduce((sum, block) => {
    if (typeof block?.text === 'string') return sum + block.text.split(/\s+/).length;
    if (typeof block?.explanation === 'string') return sum + block.explanation.split(/\s+/).length;
    return sum;
  }, 0);
  if (!words) return 4;
  return Math.max(2, Math.round(words / 220));
};

const FADE_UP = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

const ArticleLead = ({ article }) => {
  const mins = readingMinutes(article);
  const tag = article.tags?.[0] || 'Feldnotiz';
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-lead-${article.slug}`}
      className="group relative block border-2 border-black bg-background overflow-hidden hover:shadow-[8px_8px_0_0_#000] transition-shadow"
    >
      <div className="aspect-[16/10] bg-foreground/[0.04] relative overflow-hidden">
        <ArticleCover
          article={article}
          eyebrow="LEAD-ARTIKEL"
          halftone={Boolean(article.cover)}
          imgClassName="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
        />
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55">
          <span className="text-brand-strong">{tag}</span>
          <span className="opacity-30">·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="opacity-30">·</span>
          <span>{mins} MIN</span>
          <span className="opacity-30">·</span>
          <span>{article.author || 'Wlad Jachtchenko'}</span>
        </div>
        <h3
          className="text-[28px] md:text-[38px] leading-[1.02] tracking-[-0.03em] text-foreground"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          {article.title.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
        </h3>
        <p className="mt-4 text-[15px] md:text-[16px] leading-[1.55] text-foreground/70 line-clamp-3">
          {article.description}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground group-hover:text-brand-strong transition-colors">
          Artikel lesen
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

const ArticleMini = ({ article, index }) => {
  const mins = readingMinutes(article);
  const tag = article.tags?.[0] || 'Feldnotiz';
  return (
    <Link
      to={`/journal/${article.slug}`}
      data-testid={`journal-mini-${article.slug}`}
      className="group flex gap-4 border-2 border-black bg-background p-4 md:p-5 hover:bg-brand/5 transition-colors"
    >
      <div className="w-24 md:w-28 aspect-[4/5] shrink-0 relative overflow-hidden">
        <ArticleCover
          article={article}
          eyebrow={tag}
          halftone={Boolean(article.cover)}
          imgClassName="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55">
          <span className="text-brand-strong">{String(index + 2).padStart(2, '0')} · {tag}</span>
          <span className="opacity-30">·</span>
          <span>{mins} MIN</span>
        </div>
        <h4
          className="text-[17px] md:text-[20px] leading-[1.1] tracking-[-0.025em] text-foreground"
          style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          {article.title.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
        </h4>
        <p className="mt-2 text-[13px] leading-[1.5] text-foreground/65 line-clamp-2">
          {article.description}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55 group-hover:text-brand-strong transition-colors">
          Lesen
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export const JournalTeaserSection = () => {
  const articles = listArticles({ limit: 3 });
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const total = listArticles().length;

  return (
    <section
      id="journal"
      data-testid="journal-teaser-section"
      aria-label="Feldnotizen · das Journal von LeaderOS"
      className="border-y-2 border-black/[0.06] bg-[#FAFAF7]"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
        {/* Eyebrow + Headline */}
        <div className="mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.8 }} variants={FADE_UP}
              className="flex items-center gap-3 mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55"
            >
              <span className="text-brand-strong">▸ FELDNOTIZEN</span>
              <span className="opacity-30">·</span>
              <span>{total} ARTIKEL · LEADEROS JOURNAL</span>
            </motion.div>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={1} variants={FADE_UP}
              className="text-[40px] sm:text-[60px] md:text-[80px] leading-[0.92] tracking-[-0.04em] text-foreground"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              Aus dem Feld<span className="text-brand not-italic">.</span><br />
              <span className="text-foreground/55">Nicht aus dem Bullshit-Bingo</span>
              <span className="text-brand not-italic">.</span>
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={2} variants={FADE_UP}
              className="mt-6 max-w-2xl text-[15px] md:text-[16.5px] leading-[1.6] text-foreground/70"
            >
              Frameworks, Skripte und Field-Notes für KI-natives Führen · direkt
              aus der Arbeit mit Wlads Klienten. Kein Theorie-Bingo, kein
              Generisches. Jeder Artikel hat eine Methodik die du heute
              Nachmittag einsetzen kannst.
            </motion.p>
            {/* Trust strip · real credentials, not vague "expert content" claims */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} custom={3} variants={FADE_UP}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-foreground/55"
            >
              <span>▸ Von Wlad Jachtchenko</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>13 Bücher · 3× SPIEGEL-Bestseller</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>420.000+ trainierte Klienten</span>
            </motion.div>
          </div>
          <Link
            to="/journal"
            data-testid="journal-cta-all"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 h-12 border-2 border-black bg-background hover:bg-foreground hover:text-background font-bold text-[12px] tracking-[0.05em] uppercase transition-colors whitespace-nowrap"
          >
            Alle Artikel
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Magazine-Grid: 1 Lead links + 2 Minis rechts */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={4} variants={FADE_UP}
          className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start"
        >
          <ArticleLead article={lead} />
          <div className="flex flex-col gap-6 md:gap-8">
            {rest.map((article, i) => (
              <ArticleMini key={article.slug} article={article} index={i} />
            ))}
            {/* "Mehr" pill · fills the second slot if only 1 mini */}
            {rest.length < 2 && (
              <Link
                to="/journal"
                className="block border-2 border-dashed border-black/30 p-6 hover:border-brand-strong hover:bg-brand/5 transition-colors"
              >
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/55">
                  ▸ {total - articles.length} WEITERE ARTIKEL IM JOURNAL
                </div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Footer-Strip: Topic-Tags als Quick-Nav */}
        <div className="mt-10 pt-8 border-t border-foreground/10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/55">
          <span>▸ THEMEN</span>
          <Link to="/journal?tag=KI" className="hover:text-brand-strong transition-colors">KI</Link>
          <Link to="/journal?tag=Frameworks" className="hover:text-brand-strong transition-colors">FRAMEWORKS</Link>
          <Link to="/journal?tag=Rhetorik" className="hover:text-brand-strong transition-colors">RHETORIK</Link>
          <Link to="/journal?tag=Feedback" className="hover:text-brand-strong transition-colors">FEEDBACK</Link>
          <Link to="/journal?tag=Strategie" className="hover:text-brand-strong transition-colors">STRATEGIE</Link>
          <Link to="/journal?tag=Skripte" className="hover:text-brand-strong transition-colors">SKRIPTE</Link>
        </div>
      </div>
    </section>
  );
};
