import { Link } from 'react-router-dom';
import { EmailCapture } from '../../features/newsletter';

/**
 * LandingFooter — comprehensive newsroom-style sitemap.
 *
 * Drei Sitemap-Spalten (SYSTEM · EXPLORE · COMPANY) im Dotted-Grid-Stil,
 * amber Section-Header + light-lavender Bold-Links — wie eine richtige
 * "wo finde ich alles"-Footer-Landkarte, nicht der Mini-Sitemap-Footer
 * von früher. Dwell-time + Sitemap-Tiefe für SEO + Konversion.
 *
 * Drumherum bleibt: Brand-Block (top-left), Newsletter, Investitions-
 * Strip, BIB-Closing. Was unten breit ausgespielt wird, gibt Tiefe;
 * die Brand-/Scarcity-Säule oben links macht die Conversion-Pflicht.
 */

const COL_SYSTEM = [
  { label: 'Leadership-Diagnose',     to: '/#archetyp' },
  { label: 'Die 5 Rollen',            to: '/journal/die-5-rollen-einer-ki-nativen-fuehrungskraft' },
  { label: 'WladBot · 24/7 Sparring', href: '#benefit-02' },
  { label: '11 Frameworks',           href: '#benefit-01' },
  { label: '6-Monats-Curriculum',     to: '/journal/in-6-monaten-zur-ki-nativen-fuehrungskraft' },
  { label: 'Zertifikat 0001',         href: '#benefit-06' },
  { label: 'Klasse 0001',             href: '#klassen' },
  { label: 'Beratungsgespräch',       to: '/#beratung' },
];

const COL_EXPLORE = [
  { label: 'Feldnotizen · Journal',          to: '/journal' },
  { label: 'KI-Praxis',                      to: '/journal#cat-ki-praxis' },
  { label: 'Methoden & Frameworks',          to: '/journal#cat-methoden' },
  { label: 'Rhetorik & Kommunikation',       to: '/journal#cat-rhetorik' },
  { label: 'Rollen & Karriere',              to: '/journal#cat-rollen-karriere' },
  { label: 'Plattform & Klasse 0001',        to: '/journal#cat-plattform' },
  { label: 'Free Tools',                     href: '#tools' },
  { label: 'Case Studies',                   href: '#case-studies' },
  { label: 'Podcast · Wlad spricht',         href: 'https://podcast.wladjachtchenko.de', external: true },
  { label: 'Bücher · 3 SPIEGEL-Bestseller',  href: 'https://wladjachtchenko.de/buecher', external: true },
  { label: 'Leadership-Summit',              href: '#summit' },
  { label: 'Wissensbasis',                   href: '#manifesto' },
  { label: 'FAQ',                            href: '#faq' },
];

const COL_COMPANY = [
  { label: 'Beratungsgespräch buchen',   to: '/#beratung' },
  { label: 'Login',                       href: 'https://leaderos.de/login', external: true },
  { label: 'Newsletter · Feldnotizen',    href: '#newsletter-footer' },
  { label: 'Wlad auf LinkedIn',           href: 'https://www.linkedin.com/in/wladjachtchenko/', external: true },
  { label: 'Karriere',                    href: '#careers' },
  { label: 'start@aiporate.com',          href: 'mailto:start@aiporate.com' },
  { label: 'Impressum',                   to: '/impressum' },
  { label: 'Datenschutz',                 to: '/datenschutz' },
  { label: 'AGB',                         to: '/agb' },
];

const Column = ({ title, links, testId }) => (
  <div data-testid={testId}>
    <p
      className="text-[11px] font-extrabold uppercase tracking-[0.22em] mb-7"
      style={{ color: '#F5A623' }}
    >
      {title}
    </p>
    <ul className="space-y-5 text-[15px] font-bold leading-[1.3]">
      {links.map((l) => (
        <li key={l.label}>
          {l.to ? (
            <Link
              to={l.to}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ) : (
            <a
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const dotGridStyle = {
  backgroundColor: '#0E1320',
  backgroundImage:
    'radial-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1.2px)',
  backgroundSize: '22px 22px',
  backgroundPosition: '0 0',
};

export const LandingFooter = () => (
  <footer
    className="text-white/60 border-t border-white/[0.06]"
    style={dotGridStyle}
    data-testid="landing-footer"
  >
    <div className="max-w-[1480px] mx-auto px-5 md:px-10 lg:px-14 py-16 md:py-24">
      {/* Top — brand block + 3 deep sitemap columns */}
      <div className="grid md:grid-cols-12 gap-12 md:gap-14">
        {/* Brand block (kept) */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <span
              className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] bg-brand text-black shadow-[0_10px_28px_-10px_rgba(191,255,0,0.55)]"
              aria-label="Leader-OS"
            >
              <span
                aria-hidden
                className="text-[30px] leading-none"
                style={{
                  fontFamily: 'Outfit, Inter, sans-serif',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  letterSpacing: '-0.04em',
                }}
              >
                W
              </span>
            </span>
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
          </div>
          <p className="max-w-xs text-[13.5px] leading-[1.55] text-white/55">
            Das Operating System für Führungskräfte, gebaut auf
            Wlad Jachtchenkos Methodik. Staatlich anerkannt. 400 000+
            Klienten in 20 Ländern.
          </p>

          {/* Scarcity Pill — Klasse 0001 charter seats */}
          <div className="mt-7 inline-flex items-center gap-2.5 px-3.5 py-2 border-2 border-brand/60 bg-brand/[0.10] text-[10px] font-bold uppercase tracking-[0.22em] text-brand font-mono">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-brand" />
            </span>
            KLASSE 0001 · 12 VON 30 FREI
          </div>
        </div>

        {/* 3 deep sitemap columns */}
        <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
          <Column title="SYSTEM"  links={COL_SYSTEM}  testId="footer-col-system" />
          <Column title="EXPLORE" links={COL_EXPLORE} testId="footer-col-explore" />
          <Column title="COMPANY" links={COL_COMPANY} testId="footer-col-company" />
        </div>
      </div>

      {/* Newsletter — Feldnotizen opt-in */}
      <div
        id="newsletter-footer"
        data-newsletter-zone
        className="mt-16 pt-10 border-t border-white/[0.08] grid md:grid-cols-12 gap-8 md:gap-14 items-start"
      >
        <div className="md:col-span-5">
          <h3
            className="text-[28px] md:text-[34px] leading-[0.95] tracking-[-0.03em] text-white"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Feldnotizen<span className="text-brand not-italic">.</span>
          </h3>
          <p className="mt-3 max-w-sm text-[13.5px] leading-[1.55] text-white/55">
            Wlads Notizen aus 400 000 Coachings. Eine kurze E-Mail alle
            paar Wochen: Frameworks, Skripte, Beobachtungen. Kein Spam,
            keine Pitches.
          </p>
        </div>
        <div className="md:col-span-7">
          <EmailCapture source="footer" campaign="field-notes" tone="dark" compact />
        </div>
      </div>

      {/* Investment-strip */}
      <div className="mt-14 pt-6 border-t border-white/[0.08] grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <div>
          <p
            className="text-[9.5px] font-bold uppercase tracking-[0.28em] mb-3 font-mono"
            style={{ color: '#F5A623' }}
          >
            ▸ INVESTITION
          </p>
          <p className="text-[14px] leading-[1.55] text-white/65 max-w-md">
            Diagnose kostenlos · 30-Tage-Sprint{' '}
            <span className="text-white">997 €</span>{' '}
            · OS-Jahr inkl. Komplettbegleitung{' '}
            <span className="text-white">4 797 €</span>. Keine Abo-Falle,
            14 Tage Geld-zurück-Garantie auf den Sprint.
          </p>
        </div>
        <div className="md:text-right">
          <p
            className="text-[9.5px] font-bold uppercase tracking-[0.28em] mb-3 font-mono"
            style={{ color: '#F5A623' }}
          >
            ▸ KONTAKT
          </p>
          <a
            href="mailto:start@aiporate.com"
            className="text-[14px] text-white/75 hover:text-white transition-colors"
          >
            start@aiporate.com
          </a>
          <p className="mt-1.5 text-[13px] text-white/45">
            Antwort innerhalb von 24 h · Mo bis Fr
          </p>
        </div>
      </div>

      {/* BIB strip */}
      <div className="mt-10 pt-5 border-t border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[9.5px] uppercase tracking-[0.22em] font-bold text-white/35 font-mono">
        <span>© {new Date().getFullYear()} LEADER-OS · AIPORATE</span>
        <span>STAATLICH ANERKANNT · 400 000+ KLIENTEN · 20 LÄNDER</span>
      </div>
    </div>
  </footer>
);
