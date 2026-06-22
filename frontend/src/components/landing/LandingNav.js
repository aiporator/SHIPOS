import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { WladMark } from '../brand/WladMark';

/**
 * Sticky top nav — wide editorial.
 *
 * Edge-to-edge container (px-6 → px-12) so the nav reads as the page
 * header, not a centered ad-bar floating in the void. Taller default
 * (h-20) collapses to h-16 on scroll. Brand lockup sits big on the
 * left, the CTA is a flat editorial button — no rounded +icon, no
 * pill chrome, no "click here" energy.
 *
 *  Primary CTA   to  leadercheck.de        (app, Emergent)
 *  Secondary CTA to  leaderos.de/login     (app, Emergent)
 *
 * DOMAIN-TOPOLOGY (canonical, see docs/DOMAIN_TOPOLOGY.md):
 *   leader-os.de + leader-check.de   = Vercel marketing landings (this app)
 *   leaderos.de  + leadercheck.de    = Emergent apps (where users convert)
 */
export const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <header
      data-testid="landing-nav"
      className={`sticky top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-xl border-b-2 border-foreground/10 h-16'
          : 'bg-background border-b border-foreground/[0.06] h-20'
      }`}
    >
      <div className={`w-full px-6 md:px-12 lg:px-16 h-full flex items-center justify-between gap-6`}>
        <Link
          to="/"
          className="flex items-center gap-3 group shrink-0"
          aria-label="Leader-OS Startseite"
        >
          <WladMark size={scrolled ? 32 : 40} animated />
          <div className="leading-none">
            <span
              className={`font-black tracking-tight text-foreground transition-all ${scrolled ? 'text-[17px]' : 'text-[22px] md:text-[24px]'}`}
              style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.03em' }}
            >
              Leader<span className="text-brand mx-0.5">·</span>OS
            </span>
          </div>
        </Link>

        {/* Single-focus nav: only the leadercheck.de CTA. The legacy
            Klassen / So funktioniert's / Journal / Login links were dropped
            per user feedback ("Layer kennt auch niemand") — the whole nav
            now points at ONE action: start the diagnose on leadercheck.de.
            Anchors to specific sections still work via in-page scroll;
            users discover them as they scroll, not as nav choices. */}
        <nav className="flex items-center">
          <a
            href="https://leadercheck.de"
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-2.5 bg-foreground text-background hover:bg-brand hover:text-black font-bold uppercase tracking-[0.12em] transition-colors ${
              scrolled ? 'h-10 px-4 text-[10.5px] sm:text-[11px]' : 'h-12 px-5 text-[11px] sm:text-[12px]'
            }`}
            data-testid="landing-nav-cta"
          >
            <span className="hidden sm:inline">Diagnose · leadercheck.de</span>
            <span className="sm:hidden">Diagnose</span>
            <ArrowRight
              size={scrolled ? 14 : 16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </a>
        </nav>
      </div>
    </header>
  );
};
