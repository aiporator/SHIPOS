import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { EmailCapture } from '../../features/newsletter';
import { WladMark } from '../brand/WladMark';

/**
 * LandingFooter — comprehensive black sitemap with lime focal accents
 * and 3 brand image tiles. Built for "godmode" launch: every public
 * route reachable in one click, every Journal category deep-linked,
 * Wlad authority visible.
 *
 *  STRUCTURE
 *    1. Brand block (logo + scarcity pill)
 *    2. Four sitemap columns (SYSTEM · PLATTFORM · EXPLORE · COMPANY)
 *    3. Image-tile strip (Wlad portrait · Intro-Video poster · Brand-W
 *       sticker) — each linking out
 *    4. Newsletter capture (Feldnotizen)
 *    5. Investment + contact split
 *    6. BIB closing strip
 *
 *  COLOR DISCIPLINE
 *    bg #0A0A0A pure ink, lime accents EVERYWHERE the user should focus:
 *    section labels, scarcity pill, image hover-rings, investment numbers,
 *    "Beratungsgespräch" link emphasis. White hover-state for the link
 *    columns; slate-300 idle so the wall is calm but readable.
 */

// ─────────────────────────────────────────────────────────────────────────
// Sitemap data
// ─────────────────────────────────────────────────────────────────────────
const COL_SYSTEM = [
  { label: 'Sprint · 30 Tage + 12 Monate', to: '/#pricing' },
  { label: 'Plus-Plus · OS-Jahr',          to: '/#pricing' },
  { label: 'WladBot · 24/7 Sparring',      to: '/#platform' },
  { label: '11 Frameworks',                to: '/#platform' },
  { label: '6-Monats-Curriculum',          to: '/journal/in-6-monaten-zur-ki-nativen-fuehrungskraft' },
  { label: 'Die 5 Rollen',                 to: '/journal/die-5-rollen-einer-ki-nativen-fuehrungskraft' },
  { label: 'Leadership-Diagnose',          to: '/#archetyp' },
  { label: 'Klasse 0001 · Charter',        to: '/#klassen' },
  { label: 'Beratungsgespräch buchen',     to: '/#beratung', focal: true },
];

const COL_PLATTFORM = [
  { label: 'Dashboard',          to: '/dashboard' },
  { label: 'Chat · WladBot',     to: '/chat' },
  { label: 'Daily Check-In',     to: '/daily-checkin' },
  { label: 'Tools',              to: '/tools' },
  { label: 'Simulationen',       to: '/simulations' },
  { label: 'Missions',           to: '/missions' },
  { label: 'Lern-Videos',        to: '/lern-videos' },
  { label: 'My Path',            to: '/my-path' },
  { label: 'Community',          to: '/community' },
  { label: 'Wlad-Universe',      to: '/wlad-universe' },
  { label: 'Playbooks',          to: '/playbooks' },
  { label: 'Coaching',           to: '/coaching' },
  { label: 'Downloads',          to: '/downloads' },
];

const COL_EXPLORE = [
  { label: 'Feldnotizen · Journal',         to: '/journal' },
  { label: 'KI-Praxis',                     to: '/journal#cat-ki-praxis' },
  { label: 'Methoden & Frameworks',         to: '/journal#cat-methoden' },
  { label: 'Rhetorik & Kommunikation',      to: '/journal#cat-rhetorik' },
  { label: 'Rollen & Karriere',             to: '/journal#cat-rollen-karriere' },
  { label: 'Plattform & Klasse 0001',       to: '/journal#cat-plattform' },
  { label: 'Free Tools',                    to: '/#tools' },
  { label: 'Podcast · Wlad spricht',        href: 'https://podcast.wladjachtchenko.de', external: true },
  { label: 'Bücher · 3 SPIEGEL-Bestseller', href: 'https://wladjachtchenko.de/buecher', external: true },
  { label: 'Leadership-Summit',             to: '/#summit' },
  { label: 'FAQ',                           to: '/#faq' },
];

const COL_COMPANY = [
  { label: 'Login',                  href: 'https://leaderos.de/login', external: true },
  { label: 'Onboarding',             to: '/onboarding' },
  { label: 'Profile',                to: '/profile' },
  { label: 'Referral · Empfehlung',  to: '/referral' },
  { label: 'Enterprise',             to: '/enterprise' },
  { label: 'Wlad auf LinkedIn',      href: 'https://www.linkedin.com/in/wladjachtchenko/', external: true },
  { label: 'start@aiporate.com',     href: 'mailto:start@aiporate.com' },
  { label: 'Karriere',               to: '/#careers' },
  { label: 'Impressum',              to: '/impressum' },
  { label: 'Datenschutz',            to: '/datenschutz' },
  { label: 'AGB',                    to: '/agb' },
  { label: 'Widerruf',               to: '/widerruf' },
];

const IMAGE_TILES = [
  {
    src: '/wlad/wlad-portrait.jpg',
    alt: 'Wlad Jachtchenko Portrait',
    eyebrow: '▸ AUTHOR',
    title: 'Wlad Jachtchenko',
    sub: '3× SPIEGEL · 400 000+ Kunden',
    href: 'https://www.linkedin.com/in/wladjachtchenko/',
    external: true,
  },
  {
    src: '/landing/hf-04.png',
    alt: 'Wlad Intro Video Poster',
    eyebrow: '▸ INTRO · 90 SEK',
    title: 'Bevor du startest',
    sub: 'Wlad erklärt Leader-OS in 90 Sekunden',
    href: '/#wlad-intro',
    external: false,
  },
  {
    src: '/stickers/STK-04-wladbot-stamp.svg',
    alt: 'WladBot Stamp',
    eyebrow: '▸ POWERED BY',
    title: 'WladBot · 24/7',
    sub: 'Dein KI-Sparring-Partner',
    href: '/#platform',
    external: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────
const SitemapLink = ({ link }) => {
  const className = link.focal
    ? 'inline-flex items-center gap-1.5 text-brand hover:text-white transition-colors font-extrabold'
    : 'text-slate-300 hover:text-white transition-colors font-bold';
  if (link.to) {
    return (
      <Link to={link.to} className={className}>
        {link.label}
        {link.focal && <span aria-hidden className="text-brand">→</span>}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className={className}
    >
      {link.label}
      {link.external && <ArrowUpRight size={12} className="inline-block ml-0.5 text-slate-500" />}
    </a>
  );
};

const Column = ({ title, links, testId }) => (
  <div data-testid={testId}>
    <p className="text-[10.5px] font-extrabold uppercase tracking-[0.24em] text-brand mb-6">
      {title}
    </p>
    <ul className="space-y-3.5 text-[13.5px] leading-[1.3]">
      {links.map((l) => (
        <li key={l.label}>
          <SitemapLink link={l} />
        </li>
      ))}
    </ul>
  </div>
);

const ImageTile = ({ tile }) => {
  const isSvg = tile.src.endsWith('.svg');
  const inner = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.03] border border-white/10 group-hover:border-brand transition-colors">
        <img
          src={tile.src}
          alt={tile.alt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full ${isSvg ? 'object-contain p-12' : 'object-cover'} group-hover:scale-[1.04] transition-transform duration-[800ms] ease-out`}
        />
        {/* lime sweep on hover */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(191,255,0,0) 30%, rgba(191,255,0,0.18) 100%)',
          }}
        />
      </div>
      <div className="mt-3.5">
        <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.26em] text-brand mb-1.5">
          {tile.eyebrow}
        </div>
        <div className="text-[15px] font-extrabold text-white leading-[1.15]">
          {tile.title}
        </div>
        <div className="mt-1 text-[12px] font-medium text-slate-400 leading-[1.4]">
          {tile.sub}
        </div>
      </div>
    </>
  );
  const className = 'group block';
  return tile.external ? (
    <a href={tile.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link to={tile.href.startsWith('/') ? tile.href : `/${tile.href}`} className={className}>
      {inner}
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Page-bg + dotted-grid layer
// ─────────────────────────────────────────────────────────────────────────
const dotGridStyle = {
  backgroundColor: '#0A0A0A',
  backgroundImage:
    'radial-gradient(rgba(191, 255, 0, 0.06) 1px, transparent 1.2px)',
  backgroundSize: '24px 24px',
  backgroundPosition: '0 0',
};

// ─────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────
export const LandingFooter = () => (
  <footer
    className="text-white/60 border-t border-white/[0.06]"
    style={dotGridStyle}
    data-testid="landing-footer"
  >
    <div className="max-w-[1480px] mx-auto px-5 md:px-10 lg:px-14 py-16 md:py-24">
      {/* ── Top: brand + 4 deep sitemap columns ────────────────────────── */}
      <div className="grid md:grid-cols-12 gap-12 md:gap-14">
        {/* Brand block */}
        <div className="md:col-span-3">
          <Link
            to="/"
            className="flex items-center gap-4 mb-6 group"
            aria-label="Leader-OS Startseite"
          >
            <WladMark size={56} animated />
            <div>
              <div
                className="text-[26px] font-black tracking-tight text-white leading-none"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}
              >
                Leader<span className="text-brand mx-0.5">·</span>OS
              </div>
              <div className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/45 font-mono">
                POWERED BY WLADBOT
              </div>
            </div>
          </Link>
          <p className="max-w-xs text-[13.5px] leading-[1.55] text-slate-400">
            Das Operating System für Führungskräfte, gebaut auf
            Wlad Jachtchenkos Methodik. Staatlich anerkannt.
            400 000+ Klienten in 20 Ländern.
          </p>

          {/* Scarcity Pill — Klasse 0001 charter seats */}
          <div className="mt-7 inline-flex items-center gap-2.5 px-3.5 py-2 border-2 border-brand bg-brand/[0.10] text-[10px] font-bold uppercase tracking-[0.22em] text-brand font-mono">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-brand" />
            </span>
            KLASSE 0001 · 12 VON 30 FREI
          </div>
        </div>

        {/* 4 sitemap columns */}
        <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          <Column title="SYSTEM"    links={COL_SYSTEM}    testId="footer-col-system" />
          <Column title="PLATTFORM" links={COL_PLATTFORM} testId="footer-col-plattform" />
          <Column title="EXPLORE"   links={COL_EXPLORE}   testId="footer-col-explore" />
          <Column title="COMPANY"   links={COL_COMPANY}   testId="footer-col-company" />
        </div>
      </div>

      {/* ── Image-tile strip ───────────────────────────────────────────── */}
      <div className="mt-16 pt-10 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand">
            ▸ MEDIA · MEET WLAD
          </p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            3× SPIEGEL-BESTSELLER · 10M+ DOWNLOADS · 20 LÄNDER
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {IMAGE_TILES.map((t) => (
            <ImageTile key={t.title} tile={t} />
          ))}
        </div>
      </div>

      {/* ── Newsletter · Feldnotizen opt-in ─────────────────────────────── */}
      <div
        id="newsletter-footer"
        data-newsletter-zone
        className="mt-16 pt-10 border-t border-white/10 grid md:grid-cols-12 gap-8 md:gap-14 items-start"
      >
        <div className="md:col-span-5">
          <h3
            className="text-[28px] md:text-[34px] leading-[0.95] tracking-[-0.03em] text-white"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Feldnotizen<span className="text-brand not-italic">.</span>
          </h3>
          <p className="mt-3 max-w-sm text-[13.5px] leading-[1.55] text-slate-400">
            Wlads Notizen aus 400 000 Coachings. Eine kurze E-Mail alle
            paar Wochen: Frameworks, Skripte, Beobachtungen. Kein Spam,
            keine Pitches.
          </p>
        </div>
        <div className="md:col-span-7">
          <EmailCapture source="footer" campaign="field-notes" tone="dark" compact />
        </div>
      </div>

      {/* ── Investment + contact ─────────────────────────────────────────── */}
      <div className="mt-14 pt-6 border-t border-white/10 grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] mb-3 font-mono text-brand">
            ▸ INVESTITION
          </p>
          <p className="text-[14px] leading-[1.55] text-slate-300 max-w-md">
            Diagnose <span className="text-brand font-bold">kostenlos</span> ·
            30-Tage-Sprint + 12 Monate Mitgliedschaft{' '}
            <span className="text-brand font-bold">997 €</span>{' '}
            · OS-Jahr inkl. Komplettbegleitung{' '}
            <span className="text-brand font-bold">4 797 €</span>. Keine Abo-Falle,
            14 Tage Geld-zurück-Garantie auf den Sprint.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] mb-3 font-mono text-brand">
            ▸ KONTAKT
          </p>
          <a
            href="mailto:start@aiporate.com"
            className="text-[14px] text-white hover:text-brand transition-colors font-bold"
          >
            start@aiporate.com
          </a>
          <p className="mt-1.5 text-[13px] text-slate-400">
            Antwort innerhalb von 24 h · Mo bis Fr
          </p>
        </div>
      </div>

      {/* ── BIB strip ────────────────────────────────────────────────────── */}
      <div className="mt-10 pt-5 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[9.5px] uppercase tracking-[0.22em] font-bold text-white/35 font-mono">
        <span>© {new Date().getFullYear()} <span className="text-brand">LEADER-OS</span> · AIPORATE</span>
        <span>STAATLICH ANERKANNT · <span className="text-brand">400 000+ KLIENTEN</span> · 20 LÄNDER</span>
      </div>
    </div>
  </footer>
);
