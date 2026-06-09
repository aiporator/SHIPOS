import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WladMark } from '../brand/WladMark';

/**
 * Sticky top nav — Söhne-tracked wordmark + lime "Anmelden" pill.
 * Backdrop blur kicks in after scrolling past 40 px so the top of hero
 * stays clean.
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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Leader-OS Startseite">
          <WladMark size={28} animated />
          <div className="flex flex-col leading-none">
            <span
              className="font-black text-[15px] tracking-tight text-foreground"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.025em' }}
            >
              Leader<span className="text-brand mx-0.5">·</span>OS
            </span>
            <span className="text-[8px] text-muted-foreground font-bold tracking-[0.22em] uppercase mt-[2px]">
              Powered by WladBot
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <a
            href="https://leader-check.de"
            className="hidden sm:inline-block text-[12px] font-bold uppercase tracking-[0.15em] text-foreground/70 hover:text-foreground transition-colors"
            data-testid="landing-nav-diagnose"
          >
            Diagnose
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-foreground/90 transition-all hover:translate-y-[-1px]"
            data-testid="landing-nav-login"
          >
            Anmelden
            <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
