import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { BenefitSection } from '../components/landing/BenefitSection';
import { FinalCTA } from '../components/landing/FinalCTA';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ScrollProgressRail } from '../components/landing/ScrollProgressRail';
import { LANDING_ASSETS, LANDING_META, LANDING_BENEFITS_ORDER } from '../data/landingAssets';

/**
 * LandingPage — the public face of leader-os.de.
 *
 * Direction A locked: Athletic Editorial. The page is a magazine — top
 * nav, full-viewport hero, six benefit sections that alternate sides,
 * a closing dark "ZEIT ZU FÜHREN" CTA wall, footer.
 *
 * Auth-aware: signed-in users get bounced straight to /dashboard so the
 * marketing page doesn't show after login.
 *
 * SEO: real semantic <h1>/<h2>/<p> markup outside the image assets.
 * Hero image preloaded eager + fetchpriority=high; the rest lazy-load.
 *
 * Accessibility: every section has aria-label, every image has alt,
 * scroll-rail respects prefers-reduced-motion (handled inside the
 * parallax via useReducedMotion in BenefitSection).
 */
export default function LandingPage() {
  const { user, loading } = useAuth();

  // Hooks always run before any early return — Rules of Hooks.
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

  // Soft-bounce authenticated users — they don't need marketing.
  if (loading) {
    return (
      <div className="min-h-screen bg-background" data-testid="landing-loading" />
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div
      className="bg-background text-foreground min-h-screen antialiased"
      data-testid="landing-page"
    >
      <LandingNav />
      <ScrollProgressRail />

      <main>
        <HeroSection />

        {LANDING_BENEFITS_ORDER.slice(1).map((key, idx) => {
          const asset = LANDING_ASSETS[key];
          if (!asset) return null;
          return (
            <BenefitSection
              key={key}
              asset={asset}
              index={idx}
              anchor={`benefit-${asset.nr}`}
            />
          );
        })}

        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
