/**
 * WladTopicChips · kompakte 1-Klick-Themen direkt unter dem Chat.
 *
 * Ersetzt den irreführenden „Wlads Buch" Footer-Link. Beim Klick auf ein
 * Topic wird der Chat-Input mit dem passenden Wlad-Starter-Prompt befüllt
 * · der User landet sofort in einer fokussierten Wlad-Session.
 *
 * Design: subtil, scrollbar, max 1 Zeile hoch. Kein Banner, kein Slop.
 */
import { useState } from 'react';
import { Sparkles, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
  WLAD_TOPIC_PILLARS,
  WLAD_BOOKS,
  WLAD_PODCAST,
  WLAD_MASTERCLASS,
} from '../../data/wladTopics';

const PillarColumn = ({ pillar, onPick, lang }) => (
  <div className="min-w-0 flex-1">
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pillar.color }} />
      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70 truncate">
        {lang === 'de' ? pillar.label_de : pillar.label_en}
      </span>
    </div>
    <div className="flex flex-wrap gap-1">
      {pillar.topics.map((t) => (
        <button
          key={t.id}
          onClick={() => onPick(t)}
          data-testid={`wlad-topic-${t.id}`}
          className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.07] dark:border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.06] dark:hover:bg-white/[0.06] text-foreground/75 hover:text-foreground hover:border-[#BFFF00]/40 transition-all font-medium"
          style={{ borderLeftColor: pillar.color, borderLeftWidth: 2 }}
        >
          {t.title}
        </button>
      ))}
    </div>
  </div>
);

export const WladTopicChips = ({ onPickPrompt, lang = 'de' }) => {
  const [expanded, setExpanded] = useState(false);

  // Collapsed teaser · 1 topic per pillar
  const teasers = WLAD_TOPIC_PILLARS.map((p) => ({
    pillar: p,
    sample: p.topics[0],
  }));

  return (
    <div className="max-w-4xl mx-auto mt-3" data-testid="wlad-topics-chips">
      {!expanded ? (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => setExpanded(true)}
            data-testid="wlad-topics-toggle"
            className="text-[10px] px-2.5 py-1 rounded-full bg-[#BFFF00]/[0.08] border border-[#BFFF00]/20 text-[#6B8A00] dark:text-[#BFFF00] hover:bg-[#BFFF00]/[0.15] transition-colors font-bold flex items-center gap-1"
          >
            <Sparkles size={9} />
            {lang === 'de' ? "Wlads Themen" : "Wlad's Topics"}
            <ChevronDown size={9} />
          </button>
          {teasers.map(({ pillar, sample }) => (
            <button
              key={sample.id}
              onClick={() => onPickPrompt(sample.prompt_de)}
              data-testid={`wlad-topic-teaser-${sample.id}`}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.18] text-muted-foreground hover:text-foreground transition-all"
            >
              <span className="inline-block w-1 h-1 rounded-full mr-1 align-middle" style={{ background: pillar.color }} />
              {sample.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] dark:bg-white/[0.015] p-3" data-testid="wlad-topics-expanded">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#BFFF00]" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/85">
                {lang === 'de' ? "Wlads Methodik · Klick = Starter-Prompt" : "Wlad's Methods · Click = Starter Prompt"}
              </span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="wlad-topics-collapse"
            >
              <ChevronUp size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {WLAD_TOPIC_PILLARS.map((p) => (
              <PillarColumn key={p.id} pillar={p} onPick={(t) => onPickPrompt(t.prompt_de)} lang={lang} />
            ))}
          </div>

          {/* Books + Resources strip */}
          <div className="mt-3 pt-3 border-t border-white/[0.05] flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 flex items-center gap-1">
              <BookOpen size={9} /> {lang === 'de' ? 'Originalquellen' : 'Original Sources'}
            </span>
            {WLAD_BOOKS.map((b) => (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground hover:text-[#BFFF00] transition-colors font-medium flex items-center gap-0.5"
                data-testid={`wlad-book-${b.id}`}
              >
                {b.title} <ExternalLink size={8} className="opacity-50" />
              </a>
            ))}
            <a
              href={WLAD_MASTERCLASS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-[#BFFF00] transition-colors font-medium flex items-center gap-0.5"
              data-testid="wlad-masterclass-link"
            >
              {WLAD_MASTERCLASS.title} <ExternalLink size={8} className="opacity-50" />
            </a>
            <a
              href={WLAD_PODCAST.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-[#BFFF00] transition-colors font-medium flex items-center gap-0.5"
              data-testid="wlad-podcast-link"
            >
              Podcast „{WLAD_PODCAST.title}" <ExternalLink size={8} className="opacity-50" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default WladTopicChips;
