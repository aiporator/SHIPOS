import { Link } from 'react-router-dom';
import { LANDING_META } from '../../data/landingAssets';

/**
 * LandingFooter — swiss editorial. Slogan + nav + legal + BIB strip.
 */
export const LandingFooter = () => (
  <footer
    className="bg-[#0A0A0A] text-white/60 border-t border-white/[0.06]"
    data-testid="landing-footer"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-14 md:py-20">
      {/* Slogan band */}
      <div className="pb-12 md:pb-16 border-b border-white/[0.06]">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-6 font-mono">
          ▸ DAS MOTTO
        </p>
        <p
          className="text-[44px] sm:text-[64px] md:text-[88px] lg:text-[112px] leading-[0.92] tracking-[-0.045em] text-white"
          style={{
            fontFamily: 'Outfit, Inter, system-ui, sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
          }}
        >
          {LANDING_META.slogan.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
        </p>
      </div>

      {/* Brand + nav */}
      <div className="pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div
            className="text-[20px] font-black tracking-tight text-white"
            style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.025em' }}
          >
            Leader<span className="text-brand mx-0.5">·</span>OS
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 font-mono">
            Powered by WladBot · CIRCLE 0001
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em] font-bold">
          <a href="https://leader-check.de" className="hover:text-white transition-colors">leader-check.de</a>
          <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
          <Link to="/agb" className="hover:text-white transition-colors">AGB</Link>
        </nav>
      </div>

      {/* BIB strip */}
      <div className="mt-10 pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[9.5px] uppercase tracking-[0.22em] font-bold text-white/35 font-mono">
        <span>© {new Date().getFullYear()} LEADER-OS · AIPORATE</span>
        <span>BIB · 0001 · DREIßIG TAGE · ELF FRAMEWORKS · CIRCLE 01</span>
      </div>
    </div>
  </footer>
);
