import { Link } from 'react-router-dom';

/**
 * LandingFooter — editorial sitemap-footer.
 *
 * Drei Spalten: Produkt · Lernen · Über. Plus Brand + Legal + BIB-
 * Strip. Bewusst KEIN Slogan-Echo — die Closing-Wall macht FinalCTA.
 * "Werde KI-nativ." soll nur einmal sichtbar bleiben (Hero) plus die
 * Dichotomie-Variante im FinalCTA.
 */

const COL_PRODUCT = [
  { label: 'Sprint · 30 Tage', href: 'https://leadercheck.de', external: true },
  { label: 'OS · Jahr', href: 'https://leadercheck.de', external: true },
  { label: 'WladBot · 24/7', href: '#benefit-02' },
  { label: '11 Frameworks', href: '#benefit-01' },
  { label: 'Zertifikat 0001', href: '#benefit-06' },
];

const COL_LEARN = [
  { label: 'Diagnose · kostenlos', href: 'https://leadercheck.de', external: true },
  { label: '90-Sek-Intro mit Wlad', href: '#wlad-intro' },
  { label: 'Innen-Ansicht', href: '#app-preview' },
  { label: 'Manifest', href: '#manifesto' },
  { label: 'FAQ', href: '#faq' },
];

const COL_ABOUT = [
  { label: 'Demo · 20 Min', href: 'https://cal.com/leaderos/demo', external: true },
  { label: 'Beratung · 30 Min', href: 'https://cal.com/leaderos/beratung', external: true },
  { label: 'Login', href: 'https://leaderos.de/login', external: true },
  { label: 'leadercheck.de · App', href: 'https://leadercheck.de', external: true },
  { label: 'Impressum', to: '/impressum' },
  { label: 'Datenschutz', to: '/datenschutz' },
  { label: 'AGB', to: '/agb' },
];

const Column = ({ title, links }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand mb-5 font-mono">
      ▸ {title}
    </p>
    <ul className="space-y-3 text-[13.5px] leading-[1.45] text-white/65">
      {links.map((l) => (
        <li key={l.label}>
          {l.to ? (
            <Link to={l.to} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ) : (
            <a
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="hover:text-white transition-colors"
            >
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export const LandingFooter = () => (
  <footer
    className="bg-[#0A0A0A] text-white/60 border-t border-white/[0.06]"
    data-testid="landing-footer"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-24">
      {/* Top — brand + sitemap */}
      <div className="grid md:grid-cols-12 gap-10 md:gap-14">
        {/* Brand block */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-4 mb-6">
            <span
              className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand text-black font-black text-2xl shadow-[0_8px_24px_-8px_rgba(191,255,0,0.5)]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              aria-label="Leader-OS Mark"
            >
              W
              <span
                aria-hidden
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black border-2 border-brand flex items-center justify-center text-brand text-[8px] font-bold"
              >
                ·
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
            Das Operating System für Führungskräfte — gebaut auf
            Wlad Jachtchenkos Methodik. 30 Tage Sprint, ein Jahr
            Begleitung, ein KI-Coach der dich kennt.
          </p>

          {/* Scarcity Pill — Klasse 0001 mit Live-Plätzen */}
          <div className="mt-7 inline-flex items-center gap-2.5 px-3.5 py-2 border-2 border-brand/60 bg-brand/[0.10] text-[10px] font-bold uppercase tracking-[0.22em] text-brand font-mono">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-brand" />
            </span>
            KLASSE 0001 · 43/50 FREI
          </div>
        </div>

        {/* 3 sitemap columns */}
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
          <Column title="PRODUKT" links={COL_PRODUCT} />
          <Column title="LERNEN" links={COL_LEARN} />
          <Column title="UNTERNEHMEN" links={COL_ABOUT} />
        </div>
      </div>

      {/* Investment-strip */}
      <div className="mt-14 pt-6 border-t border-white/[0.08] grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-brand mb-3 font-mono">
            ▸ INVESTITION
          </p>
          <p className="text-[14px] leading-[1.55] text-white/65 max-w-md">
            Diagnose kostenlos · 30-Tage-Sprint <span className="text-white">997 €</span>{' '}
            · OS-Jahr inkl. Komplettbegleitung{' '}
            <span className="text-white">4 797 €</span>. Keine Abo-Falle,
            14 Tage Geld-zurück-Garantie auf den Sprint.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-brand mb-3 font-mono">
            ▸ KONTAKT
          </p>
          <a
            href="mailto:hello@leader-os.de"
            className="text-[14px] text-white/65 hover:text-white transition-colors"
          >
            hello@leader-os.de
          </a>
          <p className="mt-1.5 text-[13px] text-white/45">
            Antwort innerhalb von 24 h · Mo–Fr
          </p>
        </div>
      </div>

      {/* BIB strip */}
      <div className="mt-10 pt-5 border-t border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[9.5px] uppercase tracking-[0.22em] font-bold text-white/35 font-mono">
        <span>© {new Date().getFullYear()} LEADER-OS · AIPORATE</span>
        <span>DREIßIG TAGE · ELF FRAMEWORKS · EIN OS</span>
      </div>
    </div>
  </footer>
);
