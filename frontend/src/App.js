import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "./components/ui/sonner";
import { NetworkStatusBanner } from "./components/shared/NetworkStatusBanner";

// ── Eager routes ────────────────────────────────────────────────────────
// Login + Dashboard ship in the main bundle because they are the most-hit
// entry points and we never want to pay a chunk-load delay there.
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

// ── Lazy routes ─────────────────────────────────────────────────────────
// Everything else is code-split. CRA / webpack splits each into its own
// chunk; the in-app navigation continues to feel instant because Suspense
// shows the WladMark loader for the few hundred ms the chunk takes to load.
const MagicLinkVerifyPage = lazy(() => import("./pages/MagicLinkVerifyPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const DailyCheckinPage = lazy(() => import("./pages/DailyCheckinPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const SimulationsPage = lazy(() => import("./pages/SimulationsPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const PlaybooksPage = lazy(() => import("./pages/PlaybooksPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MyPathPage = lazy(() => import("./pages/MyPathPage"));
const ChallengersPage = lazy(() => import("./pages/ChallengersPage"));
const CoachingPage = lazy(() => import("./pages/CoachingPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const VideoChallengePage = lazy(() => import("./pages/VideoChallengePage"));
const VideoArchivePage = lazy(() => import("./pages/VideoArchivePage"));
const WladUniversePage = lazy(() => import("./pages/WladUniversePage"));
const LeaderDiagnosePage = lazy(() => import("./pages/LeaderDiagnosePage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const ReferralPage = lazy(() => import("./pages/ReferralPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const Challenge30Page = lazy(() => import("./pages/Challenge30Page"));
const DownloadsPage = lazy(() => import("./pages/DownloadsPage"));
const ImpressumPage = lazy(() => import("./pages/ImpressumPage"));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage"));
const WiderrufPage = lazy(() => import("./pages/WiderrufPage"));
const AGBPage = lazy(() => import("./pages/AGBPage"));
const EmailUnsubscribePage = lazy(() => import("./pages/EmailUnsubscribePage"));

import { WladMark } from "./components/brand/WladMark";
import { CookieConsent } from "./components/legal/CookieConsent";
import { ReAuthModal } from "./components/auth/ReAuthModal";
import { FakeWladCall } from "./components/calls/FakeWladCall";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

import { CreditProvider } from "./contexts/CreditContext";
import { PricingProvider } from "./contexts/PricingContext";
import { TierProvider } from "./contexts/TierContext";

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse-glow rounded-xl">
      <WladMark size={48} animated />
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <AuthCallback />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/magic" element={<MagicLinkVerifyPage />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/daily-checkin" element={<ProtectedRoute><DailyCheckinPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
        <Route path="/simulations" element={<ProtectedRoute><SimulationsPage /></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><VideoChallengePage /></ProtectedRoute>} />
        <Route path="/missions/archive" element={<ProtectedRoute><VideoArchivePage /></ProtectedRoute>} />
        <Route path="/wlad-universe" element={<ProtectedRoute><WladUniversePage /></ProtectedRoute>} />
        <Route path="/leader-diagnose" element={<ProtectedRoute><LeaderDiagnosePage /></ProtectedRoute>} />
        <Route path="/video-challenge" element={<Navigate to="/missions" replace />} />
        <Route path="/challengers" element={<ProtectedRoute><ChallengersPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/playbooks" element={<ProtectedRoute><PlaybooksPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/my-path" element={<ProtectedRoute><MyPathPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        {/* Admin route is intentionally hidden behind a non-guessable path. Backend require_admin() still gates all /api/admin/* */}
        <Route path="/wlad-control-x7k9q2" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/progress-old" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/coaching" element={<ProtectedRoute><CoachingPage /></ProtectedRoute>} />
        <Route path="/downloads" element={<ProtectedRoute><DownloadsPage /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        {/* /settings is a semantic alias of /profile. Users (and the testing
            agent in iter 91) expected /settings to resolve, not catch-all
            redirect to /dashboard. Keep this above the wildcard. */}
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="/enterprise" element={<ProtectedRoute><EnterprisePage /></ProtectedRoute>} />
        <Route path="/challenge" element={<ProtectedRoute><Challenge30Page /></ProtectedRoute>} />
        {/* Public legal pages — no auth required (GDPR / German law) */}
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/widerruf" element={<WiderrufPage />} />
        <Route path="/agb" element={<AGBPage />} />
        {/* Public — opens via signed token in lifecycle drip emails */}
        <Route path="/email/unsubscribe" element={<EmailUnsubscribePage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CreditProvider>
              <TierProvider>
                <PricingProvider>
                  <BrowserRouter>
                    <NetworkStatusBanner />
                    <AppRouter />
                    <FakeWladCall />
                    <Toaster position="bottom-right" />
                    <CookieConsent />
                    <ReAuthModal />
                  </BrowserRouter>
                </PricingProvider>
              </TierProvider>
            </CreditProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
