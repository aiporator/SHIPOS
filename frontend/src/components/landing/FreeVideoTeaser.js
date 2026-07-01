import { Link } from 'react-router-dom';
import { Lock, ArrowUpRight } from 'lucide-react';
import { FREE_VIDEOS } from '../../data/freeVideos';

/**
 * FreeVideoTeaser · landing-page CTA block for the free 4-video funnel.
 *
 * The four videos double as four CTAs: each locked card links to /gratis
 * where the visitor opts in to unlock them + join the daily email series.
 * Top-of-funnel lead magnet, sits high on the landing.
 */
export const FreeVideoTeaser = () => (
  <section
    id="free-videos"
    aria-label="4 kostenlose Führungs-Videos"
    className="relative isolate overflow-hidden w-full bg-[#0A0A0A] text-white"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
        <div>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-4">
            ▸ Gratis · 4 Videos · sofort ansehen
          </p>
          <h2
            className="text-[30px] sm:text-[44px] md:text-[58px] leading-[0.98] tracking-[-0.035em] max-w-3xl"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            4 Videos, die dich zur Führungskraft machen<span className="text-brand not-italic">.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.6] text-white/65">
            Kostenlos von Wlad Jachtchenko · E-Mail eintragen, alle 4 sofort freischalten und
            danach jeden Tag eins ins Postfach.
          </p>
        </div>
        <Link
          to="/gratis"
          className="shrink-0 inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#BFFF00] hover:bg-white text-[#0A0A0A] font-bold text-[13px] uppercase tracking-[0.14em] transition-colors"
        >
          Gratis freischalten <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {FREE_VIDEOS.map((v) => (
          <Link
            key={v.day}
            to="/gratis"
            className="group relative border-2 border-white/12 hover:border-brand/60 bg-white/[0.02] p-5 flex flex-col aspect-[4/5] transition-colors"
          >
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-brand">
              ▸ Tag {v.day} · {v.duration}
            </span>
            <h3
              className="mt-3 text-[16px] md:text-[18px] leading-[1.15] tracking-[-0.02em] text-white flex-1"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              {v.title}
            </h3>
            <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 group-hover:text-brand transition-colors">
              <Lock size={13} /> Freischalten
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default FreeVideoTeaser;
