import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "./components/ui/sonner";
import { NetworkStatusBanner } from "./components/shared/NetworkStatusBanner";
import LoginPage from "./pages/LoginPage";
import MagicLinkVerifyPage from "./pages/MagicLinkVerifyPage";
import AuthCallback from "./pages/AuthCallback";
import DashboardPage from "./pages/DashboardPage";
import DailyCheckinPage from "./pages/DailyCheckinPage";
import ChatPage from "./pages/ChatPage";
import SimulationsPage from "./pages/SimulationsPage";
import TasksPage from "./pages/TasksPage";
import PlaybooksPage from "./pages/PlaybooksPage";
import EventsPage from "./pages/EventsPage";
import ProgressPage from "./pages/ProgressPage";
import CommunityPage from "./pages/CommunityPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import MyPathPage from "./pages/MyPathPage";
import ChallengersPage from "./pages/ChallengersPage";
import CoachingPage from "./pages/CoachingPage";
import ToolsPage from "./pages/ToolsPage";
import VideoChallengePage from "./pages/VideoChallengePage";
import VideoArchivePage from "./pages/VideoArchivePage";
import LeaderDiagnosePage from "./pages/LeaderDiagnosePage";
import OnboardingPage from "./pages/OnboardingPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ReferralPage from "./pages/ReferralPage";
import EnterprisePage from "./pages/EnterprisePage";
import Challenge30Page from "./pages/Challenge30Page";
import DownloadsPage from "./pages/DownloadsPage";
import ImpressumPage from "./pages/ImpressumPage";
import DatenschutzPage from "./pages/DatenschutzPage";
import WiderrufPage from "./pages/WiderrufPage";
import AGBPage from "./pages/AGBPage";
import { CookieConsent } from "./components/legal/CookieConsent";
import { ReAuthModal } from "./components/auth/ReAuthModal";

import { CreditProvider } from "./contexts/CreditContext";
import { TierProvider } from "./contexts/TierContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl bg-[var(--cyan)] flex items-center justify-center animate-pulse-glow">
          <span className="text-lg font-bold text-black">W</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
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
      <Route path="/enterprise" element={<ProtectedRoute><EnterprisePage /></ProtectedRoute>} />
      <Route path="/challenge" element={<ProtectedRoute><Challenge30Page /></ProtectedRoute>} />
      {/* Public legal pages — no auth required (GDPR / German law) */}
      <Route path="/impressum" element={<ImpressumPage />} />
      <Route path="/datenschutz" element={<DatenschutzPage />} />
      <Route path="/widerruf" element={<WiderrufPage />} />
      <Route path="/agb" element={<AGBPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CreditProvider>
            <TierProvider>
              <BrowserRouter>
                <NetworkStatusBanner />
                <AppRouter />
                <Toaster position="bottom-right" />
                <CookieConsent />
                <ReAuthModal />
              </BrowserRouter>
            </TierProvider>
          </CreditProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
