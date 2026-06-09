import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { BenefitSection } from '../components/landing/BenefitSection';
import { FinalCTA } from '../components/landing/FinalCTA';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ScrollProgressRail } from '../components/landing/ScrollProgressRail';
import { LeadCaptureModal } from '../components/landing/LeadCaptureModal';
import { ConversionBand } from '../components/landing/ConversionBand';
import { LANDING_BENEFITS, LANDING_META } from '../data/landingAssets';

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
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background" data-testid="landing-loading" />;
  }
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" data-testid="landing-page">
      <LandingNav />
      <ScrollProgressRail />

      <main>
        <HeroSection />
        <HowItWorksSection />

        {LANDING_BENEFITS.map((asset, idx) => (
          <BenefitSection
            key={asset.nr}
            asset={asset}
            index={idx}
            anchor={`benefit-${asset.nr}`}
          />
        ))}

        <FinalCTA />
      </main>

      <LandingFooter />

      {/* Conversion accessories — always-on band + exit-intent popup */}
      <ConversionBand />
      <LeadCaptureModal />
    </div>
  );
}
