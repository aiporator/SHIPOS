import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { parseAuthError } from '../lib/authErrors';
import { Globe, Zap, WifiOff, KeyRound, Sparkles } from 'lucide-react';
import { LoginBrandPanel } from '../components/auth/LoginBrandPanel';
import { AuthForm } from '../components/auth/AuthForm';
import { GoogleButton, TrustBadges, ModeSwitch } from '../components/auth/LoginExtras';
import { MagicLinkForm } from '../components/auth/MagicLinkForm';

const getFeatures = (de) => (de ? [
  { t: '30-Tage KI-Leadership Sprint', s: '300 Fragen, tägliche Challenges, AI Roleplays' },
  { t: '16 Video-Missionen mit KI-Analyse', s: 'Kamera an, Rede halten, sofort KI-Bewertung' },
  { t: 'Persönlicher KI-Coach — 24/7', s: 'Dein WladBot kennt Wlads Methodik in- und auswendig' },
  { t: 'Täglich KI-Business Briefing', s: 'Trends, Leader-Zitate, strategische Insights' },
] : [
  { t: '30-Day AI Leadership Sprint', s: '300 questions, daily challenges, AI roleplays' },
  { t: '16 Video Missions with AI Analysis', s: 'Camera on, give speech, instant AI scoring' },
  { t: 'Personal AI Coach — 24/7', s: 'Your WladBot knows Wlad\'s methodology inside out' },
  { t: 'Daily AI Business Briefing', s: 'Trends, leader quotes, strategic insights' },
]);

// Authentication mode: 'register' | 'login' | 'magic'
export default function LoginPage() {
  const { login } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
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

  const handleGoogle = () => {
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin + '/auth-callback')}`;
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const isMagic = mode === 'magic';
  const isRegister = mode === 'register';

  const heading = isMagic
    ? (de ? 'Login ohne Passwort' : 'Sign in without a password')
    : isRegister
      ? (de ? 'Account erstellen' : 'Create account')
      : (de ? 'Willkommen zurück' : 'Welcome back');

  const subheading = isMagic
    ? (de ? 'Gib deine E-Mail ein — wir senden dir einen sicheren 1-Klick-Link.' : 'Enter your email — we\'ll send you a secure 1-click link.')
    : isRegister
      ? (de ? 'Starte deinen KI-Leadership Sprint — 3 Sessions kostenlos.' : 'Start your AI Leadership sprint — 3 sessions free.')
      : (de ? 'Melde dich an und mach weiter.' : 'Sign in and continue.');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A0A0A] relative overflow-hidden" data-testid="login-page">
      {/* Premium ambient background — only on the form side */}
      <div aria-hidden className="pointer-events-none absolute inset-0 lg:left-1/2">
        <div className="absolute top-1/4 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-[#BFFF00]/[0.045] blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/[0.035] blur-[130px]" />
      </div>

      <button
        onClick={toggleLang}
        className="fixed top-4 right-4 lg:top-8 lg:right-10 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white transition-colors text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
        data-testid="login-lang-toggle"
      >
        <Globe size={11} /> {de ? 'DE' : 'EN'}
      </button>

      <LoginBrandPanel features={getFeatures(de)} de={de} />

      <div className="flex-1 flex items-start lg:items-center justify-center px-5 pt-16 pb-8 sm:px-8 lg:p-12 relative z-10">
        <div data-testid="login-mobile-header" className="absolute top-4 left-4 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#BFFF00] flex items-center justify-center shadow-md shadow-[#BFFF00]/20">
            <Zap size={14} className="text-[#0A0A0A]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>WLADBOT</span>
            <span className="text-[9px] text-[#BFFF00]/70 font-semibold tracking-wider uppercase">Leadership OS</span>
          </div>
        </div>

        <div className="w-full max-w-md lg:max-w-[400px]">
          <div className="mb-6 lg:mb-7">
            <h2 className="text-[28px] sm:text-[32px] leading-[1.1] tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
              {heading}
            </h2>
            <p className="text-sm text-white/45 mt-2.5 leading-relaxed">
              {subheading}
            </p>
          </div>

          {/* Magic link tab toggle — only visible in login/magic modes (not on register) */}
          {!isRegister && (
            <div
              className="mb-5 inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              role="tablist"
              data-testid="auth-mode-tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  mode === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-white/45 hover:text-white/70'
                }`}
                data-testid="tab-password"
              >
                <KeyRound size={12} /> {de ? 'Passwort' : 'Password'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isMagic}
                onClick={() => switchMode('magic')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  isMagic ? 'bg-[#BFFF00]/12 text-[#BFFF00] shadow-sm' : 'text-white/45 hover:text-white/70'
                }`}
                data-testid="tab-magic-link"
              >
                <Sparkles size={12} /> Magic Link
              </button>
            </div>
          )}

          {!isMagic && <GoogleButton onClick={handleGoogle} de={de} />}

          {!isMagic && (
            <div className="relative my-6 lg:my-7">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
              <div className="relative flex justify-center">
                <span className="bg-[#0A0A0A] px-3 text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                  {de ? 'oder per E-Mail' : 'or with email'}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div data-testid="auth-error" className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-medium flex items-start gap-2">
              <WifiOff size={14} className="mt-0.5 shrink-0 opacity-60" />
              <span>{error}</span>
            </div>
          )}

          {isMagic ? (
            <MagicLinkForm de={de} />
          ) : (
            <>
              <AuthForm
                mode={mode} form={form} setForm={setForm}
                showPw={showPw} setShowPw={setShowPw}
                loading={loading} onSubmit={handleSubmit} de={de}
              />
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('magic')}
                  className="mt-3 w-full text-center text-[11px] font-semibold uppercase tracking-wider text-white/35 hover:text-[#BFFF00] transition-colors"
                  data-testid="switch-to-magic-link"
                >
                  {de ? 'Passwort vergessen? · Magic Link nutzen' : 'Forgot password? · Use a Magic Link'}
                </button>
              )}
            </>
          )}

          <div className="mt-6 lg:mt-7 text-center">
            <ModeSwitch
              mode={isMagic ? 'login' : mode}
              onSwitchMode={switchMode}
              de={de}
            />
          </div>

          <TrustBadges />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground" data-testid="legal-footer">
            <a href="/impressum" className="hover:text-[#BFFF00] hover:underline" data-testid="footer-impressum">Impressum</a>
            <span className="opacity-30">·</span>
            <a href="/datenschutz" className="hover:text-[#BFFF00] hover:underline" data-testid="footer-datenschutz">{de ? 'Datenschutz' : 'Privacy'}</a>
            <span className="opacity-30">·</span>
            <a href="/agb" className="hover:text-[#BFFF00] hover:underline" data-testid="footer-agb">AGB</a>
            <span className="opacity-30">·</span>
            <a href="/widerruf" className="hover:text-[#BFFF00] hover:underline" data-testid="footer-widerruf">{de ? 'Widerruf' : 'Withdrawal'}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
