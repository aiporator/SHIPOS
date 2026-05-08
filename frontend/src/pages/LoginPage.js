import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { parseAuthError } from '../lib/authErrors';
import { Globe, Zap, WifiOff } from 'lucide-react';
import { LoginBrandPanel } from '../components/auth/LoginBrandPanel';
import { QuickLoginList } from '../components/auth/QuickLoginList';
import { AuthForm } from '../components/auth/AuthForm';
import { GoogleButton, TrustBadges, ModeSwitch } from '../components/auth/LoginExtras';

const getFeatures = (de) => (de ? [
  { t: '30-Tage KI-Leadership Sprint', s: '300 Fragen, tägliche Challenges, AI Roleplays' },
  { t: '16 Video-Missionen mit KI-Analyse', s: 'Kamera an, Rede halten, sofort KI-Bewertung' },
  { t: 'Persönlicher KI-Coach — 24/7', s: '5 spezialisierte Rollen für jede Situation' },
  { t: 'Täglich KI-Business Briefing', s: 'Trends, Leader-Zitate, strategische Insights' },
] : [
  { t: '30-Day AI Leadership Sprint', s: '300 questions, daily challenges, AI roleplays' },
  { t: '16 Video Missions with AI Analysis', s: 'Camera on, give speech, instant AI scoring' },
  { t: 'Personal AI Coach — 24/7', s: '5 specialized roles for every situation' },
  { t: 'Daily AI Business Briefing', s: 'Trends, leader quotes, strategic insights' },
]);

export default function LoginPage() {
  const { login } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [quickLoadingEmail, setQuickLoadingEmail] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const de = lang === 'de';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload = mode === 'register'
        ? { ...form, email: (form.email || '').trim() }
        : { email: (form.email || '').trim(), password: form.password };
      const res = await api.post(endpoint, payload);
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError(de
          ? 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung und versuche es erneut.'
          : 'Cannot reach server. Please check your connection and try again.');
      } else {
        setError(parseAuthError(err, de ? 'Fehler aufgetreten' : 'An error occurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email) => {
    setQuickLoadingEmail(email);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password: 'test123' });
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError(de
          ? 'Keine Verbindung zum Server. Server evtl. noch am Starten — bitte in 10 Sek nochmal versuchen.'
          : 'Cannot reach server. Backend may still be starting — retry in 10s.');
      } else {
        setError(parseAuthError(err, de ? 'Test-Login fehlgeschlagen' : 'Test login failed'));
      }
    } finally {
      setQuickLoadingEmail(null);
    }
  };

  const handleGoogle = () => {
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin + '/auth-callback')}`;
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A0A0A]" data-testid="login-page">
      <button
        onClick={toggleLang}
        className="fixed top-4 right-4 lg:top-8 lg:right-10 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white transition-colors text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
        data-testid="login-lang-toggle"
      >
        <Globe size={11} /> {de ? 'DE' : 'EN'}
      </button>

      <LoginBrandPanel features={getFeatures(de)} de={de} />

      <div className="flex-1 flex items-start lg:items-center justify-center px-5 pt-16 pb-8 sm:px-8 lg:p-12 relative">
        {/* Mobile compact brand header — visible only below lg */}
        <div data-testid="login-mobile-header" className="absolute top-4 left-4 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#BFFF00] flex items-center justify-center shadow-md shadow-[#BFFF00]/20">
            <Zap size={14} className="text-[#0A0A0A]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>WLADBOT</span>
            <span className="text-[9px] text-[#BFFF00]/70 font-semibold tracking-wider uppercase">Leadership OS</span>
          </div>
        </div>

        <div className="w-full max-w-md lg:max-w-[380px]">
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
              {mode === 'register' ? (de ? 'Account erstellen' : 'Create account') : (de ? 'Willkommen zurück' : 'Welcome back')}
            </h2>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">
              {mode === 'register'
                ? (de ? 'Starte deinen KI-Leadership Sprint — 3 Sessions kostenlos.' : 'Start your AI Leadership sprint — 3 sessions free.')
                : (de ? 'Melde dich an und mach weiter.' : 'Sign in and continue.')}
            </p>
          </div>

          <GoogleButton onClick={handleGoogle} de={de} />

          <div className="relative my-6 lg:my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
            <div className="relative flex justify-center">
              <span className="bg-[#0A0A0A] px-3 text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                {de ? 'oder per E-Mail' : 'or with email'}
              </span>
            </div>
          </div>

          {error && (
            <div data-testid="auth-error" className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-medium flex items-start gap-2">
              <WifiOff size={14} className="mt-0.5 shrink-0 opacity-60" />
              <span>{error}</span>
            </div>
          )}

          <AuthForm
            mode={mode} form={form} setForm={setForm}
            showPw={showPw} setShowPw={setShowPw}
            loading={loading} onSubmit={handleSubmit} de={de}
          />

          <QuickLoginList
            quickLoadingEmail={quickLoadingEmail}
            onQuickLogin={handleQuickLogin}
            de={de}
          />

          <div className="mt-6 lg:mt-8 text-center">
            <ModeSwitch mode={mode} onSwitchMode={switchMode} de={de} />
          </div>

          <TrustBadges />
        </div>
      </div>
    </div>
  );
}
