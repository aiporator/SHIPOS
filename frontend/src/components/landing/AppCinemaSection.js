/**
 * AppCinemaSection · Full-Viewport-Conversion-Section für die App,
 * gebaut nach der Auria-Cinematic-Hero-Referenz: dunkle Full-Bleed-
 * Bühne, Frosted-Glass-Nav-Pill (Brand links, weiße CTA rechts),
 * Amber-Badge, Instrument-Serif-Headline mit kursivem Kernwort,
 * Support-Absatz. Keine Entrance-Animationen (Spec) — einzige Motion
 * ist der CTA-Hover; die Atmosphäre kommt vom Visual.
 *
 * Visual ist der WladBot-3.0-Avatar der App (Team-Wunsch: "den Avatar
 * von leaderos.de nutzen", kanonischer Pfad aus lib/brandAssets:
 * /wlad/wladbot3.0.webp). Der Avatar steht als große zentrale Figur im
 * Kreis-Crop mit Lime-Glow auf tiefdunkler Bühne — sein hellgrauer
 * Asset-Hintergrund verschwindet im Crop. Brand-Lockup ist unser
 * echtes (W-Mark + Leader·OS in Outfit), Badge kanon-ehrlich
 * (3× SPIEGEL-Bestseller-Autor), CTA "App starten" → Trial-Signup.
 * Kein Apple-Logo: es gibt keine App-Store-App, das Icon wäre ein
 * falsches Versprechen. Instrument Serif ist global bereits geladen.
 */
import { WladMark } from '../brand/WladMark';

const SIGNUP = 'https://leaderos.de/signup?trial=14';

export const AppCinemaSection = () => (
  <section
    className="relative h-screen w-full overflow-hidden"
    style={{ background: 'radial-gradient(120% 90% at 50% 8%, #10131f 0%, #06070d 55%, #02040c 100%)' }}
    aria-label="LeaderOS App · Conversion"
  >
    {/* Atmosphäre · Lime-Glow hinter dem Avatar */}
    <div
      aria-hidden
      className="absolute left-1/2 -translate-x-1/2 bottom-[-12%] h-[70vh] w-[70vh] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(191,255,0,.16) 0%, rgba(191,255,0,.05) 45%, transparent 70%)' }}
    />

    <div className="relative z-10 flex h-full w-full flex-col">
      {/* Frosted nav pill */}
      <div className="flex w-full justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <nav className="flex w-full max-w-4xl items-center justify-between rounded-2xl bg-black/40 pl-5 pr-2 py-2 backdrop-blur-xl sm:pl-7 sm:pr-2.5 sm:py-2.5">
          <a href="/" className="flex items-center gap-2.5" aria-label="LeaderOS Startseite">
            <WladMark size={24} />
            <span
              className="text-lg tracking-tight text-white/90 sm:text-xl font-black"
              style={{ fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: '-0.03em' }}
            >
              Leader<span className="text-brand mx-0.5">·</span>OS
            </span>
          </a>
          <a
            href={SIGNUP}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-medium tracking-wide text-black transition-all hover:bg-white/90 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <svg viewBox="0 0 32 32" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true">
              <path
                d="M4.8 6.8 L11.6 27.4 Q13 28.8 14.4 27.2 L18.4 12.8 Q19.4 11.8 20.4 12.8 L23.8 27.2 Q25.2 28.8 26.6 27.4 L31.2 7"
                stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                transform="scale(0.88) translate(0 -1)"
              />
            </svg>
            App starten
          </a>
        </nav>
      </div>

      {/* Hero content */}
      <div className="flex flex-col items-center px-6 pt-10 text-center sm:pt-16 lg:pt-20">
        <div className="mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 sm:mb-8 sm:px-5 sm:py-2">
          <svg viewBox="0 0 22 22" className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" fill="currentColor" aria-hidden="true">
            <path d="M12.48 2.19 14.24 5.74c.24.5.88.97 1.42 1.06l3.19.54c2.04.34 2.52 1.83 1.05 3.3l-2.48 2.5c-.42.43-.65 1.24-.52 1.83l.71 3.09c.56 2.45-.73 3.4-2.88 2.12l-2.99-1.78c-.54-.33-1.43-.33-1.98 0l-2.99 1.78c-2.14 1.28-3.44.32-2.88-2.12l.71-3.09c.13-.59-.1-1.4-.52-1.83l-2.48-2.5C.14 9.17.61 7.68 2.65 7.34l3.19-.54c.53-.09 1.17-.56 1.41-1.06l1.76-3.55c.96-1.93 2.52-1.93 3.47 0Z" />
          </svg>
          <span className="text-xs font-medium tracking-wider text-amber-300 sm:text-sm">
            3× SPIEGEL-Bestseller-Autor
          </span>
        </div>

        <h2
          className="max-w-4xl text-4xl leading-[0.95] font-normal text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Werde die <em className="italic">Stimme</em>, die den
          <br className="hidden sm:block" /> Raum führt.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-snug text-white/70 sm:mt-7 sm:text-base md:text-lg">
          WladBot ist dein KI-Coach für Führung, Rhetorik und EQ, wann immer der Moment es verlangt.
          <br className="hidden sm:block" /> Wähle deine Situation und beginne dein Training.
        </p>
      </div>

      {/* Der App-Avatar · zentrale Figur, wächst in den unteren Raum */}
      <div className="relative mt-auto flex justify-center pb-0">
        <picture>
          <source srcSet="/wlad/wladbot3.0.webp" type="image/webp" />
          <img
            src="/wlad/wladbot3.0.png"
            alt="WladBot, der KI-Coach der LeaderOS-App"
            loading="lazy"
            className="h-[38vh] w-[38vh] min-h-[240px] min-w-[240px] max-h-[440px] max-w-[440px] rounded-full object-cover translate-y-[12%] sm:h-[44vh] sm:w-[44vh]"
            style={{
              objectPosition: '50% 18%',
              border: '3px solid rgba(191,255,0,.55)',
              boxShadow: '0 0 60px rgba(191,255,0,.22), 0 30px 80px rgba(0,0,0,.55)',
            }}
          />
        </picture>
      </div>
    </div>
  </section>
);
