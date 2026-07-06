import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Check } from 'lucide-react';
import { LandingFooter } from '../components/landing/LandingFooter';
import { PlusCircleCTA } from '../components/landing/PlusCircleCTA';
import { WladMark } from '../components/brand/WladMark';
import { applyPageMeta } from '../lib/pageMeta';

/**
 * WebinarThankYouPage · /webinar/danke · dedicated confirmation surface for
 * the webinar squeeze page (routes/webinar.py sends the real confirmation
 * email + reminders; this page is the on-screen moment right after signup).
 *
 * Kept separate from the generic /thank-you (leader-check funnel) because
 * the next steps differ completely: add-to-calendar, and — per the explicit
 * growth goal — a direct bridge into starting the LeaderOS trial NOW
 * instead of waiting for the webinar date.
 */

const WEBINAR_START = new Date('2026-08-20T10:00:00+02:00');
const WEBINAR_END = new Date('2026-08-20T11:30:00+02:00');

const googleCalendarUrl = () => {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const details = encodeURIComponent(
    'Live-Webinar: das Leadership Operating System für Führungskräfte.\n\nJoin via LeaderOS: https://leader-os.de/webinar'
  );
  return (
    'https://www.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Führe besser. Jeden Tag. · Live-Webinar') +
    `&dates=${fmt(WEBINAR_START)}/${fmt(WEBINAR_END)}` +
    `&details=${details}` +
    '&location=' + encodeURIComponent('Online — LeaderOS')
  );
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function WebinarThankYouPage() {
  const [params] = useSearchParams();
  const email = params.get('email');

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');

    const restoreMeta = applyPageMeta({
      title: 'Platz gesichert · Live-Webinar · LeaderOS',
      description: 'Dein Platz im kostenlosen LeaderOS Live-Webinar ist reserviert. Zum Kalender hinzufügen und direkt weitermachen.',
      url: 'https://leader-os.de/webinar/danke',
      image: 'https://leader-os.de/og-wlad.jpg',
    });

    return () => { restoreMeta(); if (!wasDark) root.classList.remove('dark'); };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-[100dvh] antialiased" data-testid="webinar-thank-you-page">
      <header className="max-w-[1100px] mx-auto px-5 md:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="LeaderOS Startseite">
          <WladMark size={34} />
          <span className="font-black tracking-tight text-foreground text-[19px]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
            Leader<span className="text-brand mx-0.5">·</span>OS
          </span>
        </Link>
      </header>

      <main id="main-content" className="max-w-[820px] mx-auto px-5 md:px-10 pt-14 md:pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="inline-flex w-11 h-11 items-center justify-center bg-brand text-[#0A0A0A] mb-7"
        >
          <Check size={22} strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial="hidden" animate="show" variants={FADE_UP}
          className="text-[36px] sm:text-[56px] md:text-[68px] leading-[0.95] tracking-[-0.04em] text-foreground max-w-2xl"
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Platz gesichert<span className="text-brand not-italic">.</span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="show" custom={1} variants={FADE_UP}
          className="mt-6 max-w-xl text-[16px] md:text-[18px] leading-[1.55] text-foreground/70"
        >
          {email ? (
            <>Wir haben <strong className="text-foreground">{email}</strong> vorgemerkt und dir eine Bestätigung geschickt — inklusive Kalender-Link. 24h und 1h vor dem Webinar meldet sich LeaderOS automatisch nochmal.</>
          ) : (
            <>Deine Anmeldung ist bestätigt — check deine Mails. 24h und 1h vor dem Webinar meldet sich LeaderOS automatisch nochmal.</>
          )}
        </motion.p>

        <motion.div initial="hidden" animate="show" custom={2} variants={FADE_UP} className="mt-8">
          <motion.a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="webinar-thankyou-calendar"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="inline-flex items-center gap-2.5 h-13 px-6 py-3.5 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors text-[12.5px] font-bold uppercase tracking-[0.14em]"
          >
            <Calendar size={16} /> Zum Kalender hinzufügen
          </motion.a>
        </motion.div>

        {/* The explicit growth bridge: don't make them wait for August. */}
        <motion.section
          initial="hidden" animate="show" custom={3} variants={FADE_UP}
          className="mt-16 pt-12 border-t-2 border-foreground/12"
        >
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.24em] text-brand mb-4">▸ WÄHREND DU WARTEST</p>
          <h2
            className="text-[26px] sm:text-[36px] leading-[1.0] tracking-[-0.03em] text-foreground max-w-xl"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            Du musst nicht bis August warten<span className="text-brand not-italic">.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-[1.6] text-foreground/65">
            Das Webinar ist der Impuls. LeaderOS ist das System, das danach trägt — WladBot als
            24/7-Coach, tägliche Mikro-Drills, dieselbe Methodik. Starte deine 14 Tage kostenlos
            schon jetzt, ganz ohne auf den Termin zu warten.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <PlusCircleCTA
              href="https://leaderos.de/signup?trial=14&utm_source=webinar&utm_medium=thankyou&utm_campaign=webinar-2026-08-20"
              testId="webinar-thankyou-cta-trial"
            >
              14 Tage kostenlos starten
            </PlusCircleCTA>
            <Link
              to="/fuehrung-beginnt-hier"
              className="text-[12px] font-bold uppercase tracking-[0.2em] text-foreground/55 hover:text-foreground transition-colors"
              data-testid="webinar-thankyou-cta-videos"
            >
              Oder: 4 Gratis-Videos ansehen →
            </Link>
          </div>
        </motion.section>
      </main>

      <LandingFooter />
    </div>
  );
}
