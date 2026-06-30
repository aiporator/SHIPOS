import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { WladMark } from '../brand/WladMark';

/**
 * Landing nav · T1 Vellum Specification (see frontend/DESIGN.md).
 *
 * Floating composition over the vellum canvas: the Leader·OS logo lockup
 * sits in carbon on the cream (left), the action cluster rides as a dark
 * carbon pill (right) holding a white ghost "Diagnose" link and the single
 * lime primary pill (14-day trial). No shadow — tonal contrast alone lifts
 * the pill off the canvas. On scroll the bar gains a faint vellum blur +
 * hairline and tightens its padding.
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
          ? 'bg-background/85 backdrop-blur-xl border-b border-foreground/10 py-3'
          : 'bg-transparent border-b border-transparent py-4 md:py-5'
      }`}
    >
      <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-3 group shrink-0"
          aria-label="Leader-OS Startseite"
        >
          <WladMark size={scrolled ? 30 : 36} animated />
          <span
            className={`text-foreground transition-all ${scrolled ? 'text-[18px]' : 'text-[20px] md:text-[22px]'}`}
            style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: 400, letterSpacing: '0.01em' }}
          >
            Leader<span style={{ color: 'var(--t1-lime)' }} className="mx-0.5">·</span>OS
          </span>
        </Link>

        {/* Action cluster · dark carbon pill holding the ghost diagnose link
            + the one lime primary pill. The dual entry-points converge in
            the same identity via email_lower, so offering both the soft
            (diagnose) and hard (trial) commit side-by-side is strictly better. */}
        <nav
          className="inline-flex items-center gap-1 rounded-full pl-1.5 pr-1.5 py-1.5 sm:pl-4"
          style={{ background: 'var(--t1-carbon, #322d2a)' }}
        >
          <a
            href="https://leadercheck.de"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="landing-nav-diagnose"
            className="hidden sm:inline-flex items-center h-9 px-3 text-[11px] uppercase text-white/85 hover:text-white transition-colors"
            style={{ letterSpacing: '0.08em' }}
          >
            Diagnose · 10 Min
          </a>
          <a
            href="https://leaderos.de/signup?trial=14"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="landing-nav-cta"
            className="t1-pill group inline-flex items-center gap-2 h-9 px-4 text-[11px] uppercase"
          >
            <span className="hidden sm:inline">14 Tage kostenlos</span>
            <span className="sm:hidden">14 Tage</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </nav>
      </div>
    </header>
  );
};
