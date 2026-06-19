import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WladMark } from '../brand/WladMark';

/**
 * Sticky top nav — action-oriented.
 *
 *  Primary CTA   →  leadercheck.de        (app, Emergent — runs the diagnose)
 *  Secondary CTA →  leaderos.de/login     (app, Emergent — auth + dashboard)
 *
 * DOMAIN-TOPOLOGY (canonical, see docs/DOMAIN_TOPOLOGY.md):
 *   leader-os.de + leader-check.de   = Vercel marketing landings (this app)
 *   leaderos.de  + leadercheck.de    = Emergent apps (where users convert)
 *
 * Plus tiny "So funktioniert's" anchor on desktop.
 */
export const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-testid="landing-nav"
      className={`sticky top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-foreground/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Leader-OS Startseite">
          <WladMark size={28} animated />
          <div className="flex flex-col leading-none">
            <span
              className="font-black text-[15px] tracking-tight text-foreground"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.025em' }}
            >
              Leader<span className="text-brand mx-0.5">·</span>OS
            </span>
            <span className="text-[8px] text-foreground/55 font-bold tracking-[0.22em] uppercase mt-[2px] font-mono">
              Powered by WladBot
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 md:gap-5">
          <a
            href="#how-it-works"
            className="hidden md:inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition-colors"
            data-testid="landing-nav-how"
          >
            So funktioniert's
          </a>
          <a
            href="https://leaderos.de/login"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition-colors"
            data-testid="landing-nav-login"
          >
            Login
          </a>
          <a
            href="https://leadercheck.de"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand text-[#0A0A0A] text-[11px] font-bold uppercase tracking-[0.12em] hover:brightness-105 active:translate-y-px transition-all"
            data-testid="landing-nav-cta"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0A0A0A] text-brand font-black leading-none text-xs" aria-hidden>+</span>
            <span>Diagnose starten</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
