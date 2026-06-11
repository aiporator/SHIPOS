import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { VimeoIntroSection } from '../components/landing/VimeoIntroSection';
import { ManifestoSection } from '../components/landing/ManifestoSection';
import { BenefitSection } from '../components/landing/BenefitSection';
import { AppPreviewSection } from '../components/landing/AppPreviewSection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTA } from '../components/landing/FinalCTA';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ScrollProgressRail } from '../components/landing/ScrollProgressRail';
import { LeadCaptureModal } from '../components/landing/LeadCaptureModal';
import { ConversionBand } from '../components/landing/ConversionBand';
import { LandingChatPod } from '../components/landing/LandingChatPod';
import LeaderCheckLanding from './LeaderCheckLanding';
import { LANDING_BENEFITS, LANDING_META } from '../data/landingAssets';

// Host-Branch: leader-check.de bekommt die fokussierte Diagnostic-Landing.
// Subdomains (www., preview-*) zählen mit, lokale Dev-Hosts nicht.
const isLeaderCheckHost = () => {
  if (typeof window === 'undefined') return false;
  return /(^|\.)leader-check\.de$/i.test(window.location.hostname);
};

/**
 * LandingPage — the public face of leader-os.de.
 *
 * Direction A LOCKED: Athletic Editorial × Heron-Preston specimen
 * sheets. Pure typography, zero external image dependency.
 *
 * Flow: Hero → How-It-Works (the explicit 3-step conversion path) →
 * 7 Benefits → Final CTA → Footer. Throughout: a sticky bottom
 * conversion band reminds the next step, exit-intent / 50%-scroll
 * triggers a lead-capture popup that lands the visitor on /thank-you.
 *
 * Auth-aware: signed-in users get bounced straight to /dashboard.
 */
export default function LandingPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = LANDING_META.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', LANDING_META.description);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = LANDING_META.description;
      document.head.appendChild(m);
    }

    // Landing-Page läuft IMMER in Light-Mode — egal was der User in
    // localStorage hatte. Editorial-Direction A ist explizit weiß-auf-
    // dunkel-akzent, nicht das umgekehrte. Dashboard und App-Surfaces
    // dürfen weiterhin der Theme-Preference folgen.
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    if (wasDark) root.classList.remove('dark');
    return () => {
      if (wasDark) root.classList.add('dark');
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background" data-testid="landing-loading" />;
  }
  if (user) return <Navigate to="/dashboard" replace />;

  // leader-check.de → fokussierte Diagnostic-Landing.
  // Gleicher CRA-Build, andere Identität, anderer Funnel-Zweck.
  if (isLeaderCheckHost()) return <LeaderCheckLanding />;

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="landing-page">
      <LandingNav />
      <ScrollProgressRail />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <VimeoIntroSection />
        <ManifestoSection />

        {LANDING_BENEFITS.map((asset, idx) => (
          <BenefitSection
            key={asset.nr}
            asset={asset}
            index={idx}
            anchor={`benefit-${asset.nr}`}
            total={LANDING_BENEFITS.length}
          />
        ))}

        <AppPreviewSection />
        <FAQSection />

        <FinalCTA />
      </main>

      <LandingFooter />

      {/* Conversion accessories — always-on band + exit-intent popup +
          editorial WladBot-Mini-Funnel (rechts unten). */}
      <ConversionBand />
      <LeadCaptureModal />
      <LandingChatPod mode="lead" />
    </div>
  );
}
