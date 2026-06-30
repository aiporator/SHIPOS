import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { parseAuthError } from '../lib/authErrors';
import { Globe, WifiOff, KeyRound, Sparkles } from 'lucide-react';
import { LoginBrandPanel } from '../components/auth/LoginBrandPanel';
import { WladMark } from '../components/brand/WladMark';
import { AuthForm } from '../components/auth/AuthForm';
import { TrustBadges, ModeSwitch } from '../components/auth/LoginExtras';
import { MagicLinkForm } from '../components/auth/MagicLinkForm';
import { OAuthProviderStack } from '../components/auth/OAuthButtons';
import { ContinueAsCard, useContinueAs } from '../components/auth/ContinueAsCard';
import { useAuthProviders } from '../lib/authProviders';
import { getLastLogin, forgetLogin, displayEmail } from '../lib/recentLogins';

const getFeatures = (de) => (de ? [
  { t: '30-Tage KI-Leadership Sprint', s: '300 Fragen, tägliche Challenges, AI Roleplays' },
  { t: '16 Video-Missionen mit KI-Analyse', s: 'Kamera an, Rede halten, sofort KI-Bewertung' },
  { t: 'Persönlicher KI-Coach · 24/7', s: 'Dein WladBot kennt Wlads Methodik in- und auswendig' },
  { t: 'Täglich KI-Business Briefing', s: 'Trends, Leader-Zitate, strategische Insights' },
] : [
  { t: '30-Day AI Leadership Sprint', s: '300 questions, daily challenges, AI roleplays' },
  { t: '16 Video Missions with AI Analysis', s: 'Camera on, give speech, instant AI scoring' },
  { t: 'Personal AI Coach · 24/7', s: 'Your WladBot knows Wlad\'s methodology inside out' },
  { t: 'Daily AI Business Briefing', s: 'Trends, leader quotes, strategic insights' },
]);

export default function LoginPage() {
  const { login } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  // Default to 'login', most traffic is returning users in pre-launch phase.
  // New users see a clear "Account erstellen" link to switch into register mode.
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [lastAccount, setLastAccount] = useState(getLastLogin());
  const { data: providers } = useAuthProviders();
  const de = lang === 'de';

  // If a previous login exists, default to "login" mode so the Continue-as card shows
  useEffect(() => {
    if (lastAccount && mode === 'register') setMode('login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOAuthSuccess = (user, method) => {
    login(user, method);
    toast.success(de ? `Willkommen zurück, ${user.name || user.email}!` : `Welcome back, ${user.name || user.email}!`);
    navigate('/dashboard');
  };

  const handleOAuthError = (msg) => {
    setError(msg);
  };

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
      login(res.data.user, 'email');
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError(de
          ? 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.'
          : 'Cannot reach server. Please check your connection.');
      } else {
        setError(parseAuthError(err, de ? 'Fehler aufgetreten' : 'An error occurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    // Always clear password, security & avoids browser auto-filling the login
    // password into a register form. Drop `name` when leaving register since
    // it's only collected there.
    setForm(f => ({
      ...f,
      password: '',
      name: newMode === 'register' ? f.name : '',
    }));
  };

  const { trigger: triggerContinue, loading: continueLoading } = useContinueAs(lastAccount, {
    de,
    onPrefill: (email, provider) => {
      // Full email is no longer cached in localStorage (PII protection).
      // For OAuth providers, switch mode to 'login' so the buttons are visible
      // then ask user to click the provider button (one-tap auto-prompts if available).
      if (provider === 'magic_link') {
        setMode('magic');
        toast.info(de
          ? 'Bitte gib deine E-Mail-Adresse ein, um einen Login-Link zu erhalten.'
          : 'Please enter your email to receive a login link.');
      } else if (provider) {
        setMode('login');
        toast.info(de
          ? `Klicke unten auf "Mit ${provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : 'Microsoft'} fortfahren"`
          : `Click "Continue with ${provider}" below`);
      } else {
        setMode('login');
      }
    },
    onError: setError,
  });

  const handleForget = (entry) => {
    forgetLogin(entry);
    setLastAccount(getLastLogin());
    toast.success(de ? 'Konto entfernt.' : 'Account removed.');
  };

  const isMagic = mode === 'magic';
  const isRegister = mode === 'register';
  const showContinueAs = !!lastAccount && !isRegister && !isMagic;

  const heading = useMemo(() => {
    if (isMagic) return de ? 'Login ohne Passwort' : 'Sign in without a password';
    if (isRegister) return de ? 'Account erstellen' : 'Create account';
    return de ? 'Willkommen zurück' : 'Welcome back';
  }, [isMagic, isRegister, de]);

  const subheading = useMemo(() => {
    if (isMagic) return de ? 'Gib deine E-Mail ein, wir senden dir einen sicheren 1-Klick-Link.' : 'Enter your email, we\'ll send a secure 1-click link.';
    if (isRegister) return de ? 'Starte deinen KI-Leadership Sprint · 3 Sessions kostenlos.' : 'Start your AI Leadership sprint · 3 sessions free.';
    return de ? 'Schön dich wiederzusehen.' : 'Good to see you again.';
  }, [isMagic, isRegister, de]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden" data-testid="login-page">
      {/* Lime accent · Nike DNA, dezent in der rechten Ecke */}
      <div aria-hidden className="pointer-events-none absolute inset-0 lg:left-1/2">
        <div className="absolute top-1/4 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-brand/[0.18] blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] h-[28rem] w-[28rem] rounded-full bg-brand/[0.08] blur-[130px]" />
      </div>

      <button
        onClick={toggleLang}
        className="fixed top-4 right-4 lg:top-8 lg:right-10 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black text-black hover:bg-brand transition-colors text-[10.5px] font-bold uppercase tracking-[0.18em] font-mono"
        data-testid="login-lang-toggle"
      >
        <Globe size={11} /> {de ? 'DE' : 'EN'}
      </button>

      <LoginBrandPanel features={getFeatures(de)} de={de} />

      <div className="flex-1 flex items-start lg:items-center justify-center px-5 pt-16 pb-8 sm:px-8 lg:p-12 relative z-10">
        <div data-testid="login-mobile-header" className="absolute top-4 left-4 flex items-center gap-2 lg:hidden">
          <WladMark size={32} animated />
          <div className="flex flex-col leading-none">
            <span className="font-black text-[13px] text-black" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              Leader<span className="text-brand-strong mx-0.5">·</span>OS
            </span>
            <span className="text-[8.5px] text-brand-strong font-bold tracking-[0.22em] uppercase mt-[2px] font-mono">Powered by WladBot</span>
          </div>
        </div>

        <div className="w-full max-w-md lg:max-w-[440px]">
          <div className="mb-7 lg:mb-9">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-3 font-mono">
              ▸ LOGIN · DEIN ZUGANG
            </p>
            <h2
              className="text-[40px] sm:text-[52px] leading-[0.92] tracking-[-0.035em] text-black"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
            >
              {heading.replace(/\.$/, '')}<span className="text-brand not-italic">.</span>
            </h2>
            <p className="text-[14px] text-black/65 mt-4 leading-relaxed max-w-sm">{subheading}</p>
          </div>

          {/* "Continue as", only when a previous login is cached */}
          {showContinueAs && (
            <div className="mb-5">
              <ContinueAsCard
                account={lastAccount}
                onClick={triggerContinue}
                onForget={handleForget}
                loading={continueLoading}
                de={de}
              />
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px flex-1 bg-black/10" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-black/45 font-bold font-mono">
                  {de ? 'oder anderer Account' : 'or another account'}
                </span>
                <span className="h-px flex-1 bg-black/10" />
              </div>
            </div>
          )}

          {/* Auth method tabs (only in non-register mode) */}
          {!isRegister && (
            <div
              className="mb-5 inline-flex p-1 bg-black/[0.04] border-2 border-black"
              role="tablist"
              data-testid="auth-mode-tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all ${
                  mode === 'login' ? 'bg-black text-white' : 'text-black/55 hover:text-black'
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
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all ${
                  isMagic ? 'bg-brand text-black' : 'text-black/55 hover:text-black'
                }`}
                data-testid="tab-magic-link"
              >
                <Sparkles size={12} /> Magic Link
              </button>
            </div>
          )}

          {/* OAuth providers · PROMINENT first thing wenn nicht magic */}
          {!isMagic && providers && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/55 mb-3 font-mono">
                ▸ SCHNELL-LOGIN · 1 KLICK
              </p>
              <OAuthProviderStack
                providers={providers}
                onSuccess={handleOAuthSuccess}
                onError={handleOAuthError}
                de={de}
              />
            </div>
          )}

          {!isMagic && providers?.providers && (providers.providers.google || providers.providers.apple || providers.providers.microsoft) && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-black/[0.10]" /></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] text-black/55 uppercase tracking-[0.22em] font-bold font-mono">
                  {de ? '· oder per E-Mail ·' : '· or with email ·'}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div data-testid="auth-error" className="mb-5 p-3 bg-red-50 border-2 border-red-600 text-red-700 text-[13px] font-medium flex items-start gap-2">
              <WifiOff size={14} className="mt-0.5 shrink-0 opacity-70" />
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
                  className="mt-3 w-full text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black/55 hover:text-brand-strong transition-colors font-mono"
                  data-testid="switch-to-magic-link"
                >
                  {de ? 'Passwort vergessen? · Magic Link nutzen' : 'Forgot password? · Use a Magic Link'}
                </button>
              )}
            </>
          )}

          <div className="mt-7 lg:mt-9 text-center">
            <ModeSwitch
              mode={isMagic ? 'login' : mode}
              onSwitchMode={switchMode}
              de={de}
            />
          </div>

          <TrustBadges />
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55 font-mono" data-testid="legal-footer">
            <a href="/impressum" className="hover:text-brand-strong transition-colors" data-testid="footer-impressum">Impressum</a>
            <span className="opacity-30">·</span>
            <a href="/datenschutz" className="hover:text-brand-strong transition-colors" data-testid="footer-datenschutz">{de ? 'Datenschutz' : 'Privacy'}</a>
            <span className="opacity-30">·</span>
            <a href="/agb" className="hover:text-brand-strong transition-colors" data-testid="footer-agb">AGB</a>
            <span className="opacity-30">·</span>
            <a href="/widerruf" className="hover:text-brand-strong transition-colors" data-testid="footer-widerruf">{de ? 'Widerruf' : 'Withdrawal'}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
