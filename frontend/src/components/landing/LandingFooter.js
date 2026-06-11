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
  { label: 'Sprint · 30 Tage', href: 'https://leader-check.de', external: true },
  { label: 'OS · Jahr', href: 'https://leader-check.de', external: true },
  { label: 'WladBot · 24/7', href: '#benefit-02' },
  { label: '11 Frameworks', href: '#benefit-01' },
  { label: 'Zertifikat 0001', href: '#benefit-06' },
];

const COL_LEARN = [
  { label: 'Diagnose · kostenlos', href: 'https://leader-check.de', external: true },
  { label: '90-Sek-Intro mit Wlad', href: '#wlad-intro' },
  { label: 'Innen-Ansicht', href: '#app-preview' },
  { label: 'Manifest', href: '#manifesto' },
  { label: 'FAQ', href: '#faq' },
];

const COL_ABOUT = [
  { label: 'Demo · 20 Min', href: 'https://cal.com/leaderos/demo', external: true },
  { label: 'Beratung · 30 Min', href: 'https://cal.com/leaderos/beratung', external: true },
  { label: 'Login', to: '/login' },
  { label: 'leader-check.de', href: 'https://leader-check.de', external: true },
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
          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-black font-black"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              W
            </span>
            <div
              className="text-[22px] font-black tracking-tight text-white"
              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}
            >
              Leader<span className="text-brand mx-0.5">·</span>OS
            </div>
          </div>
          <p className="max-w-xs text-[13.5px] leading-[1.55] text-white/55">
            Das Operating System für Führungskräfte, die KI-nativ
            werden — gebaut auf Wlad Jachtchenkos Methodik. Powered by
            WladBot · BIB · 0001 · CLASS 01.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 px-3 py-1.5 border border-brand/40 bg-brand/[0.08] text-[10px] font-bold uppercase tracking-[0.22em] text-brand font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            CLASS 0001 · JETZT OFFEN
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
        <span>BIB · 0001 · DREIßIG TAGE · ELF FRAMEWORKS · CLASS 01</span>
      </div>
    </div>
  </footer>
);
