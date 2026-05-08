import { FlaskConical, ArrowRight, Loader2 } from 'lucide-react';

// Test accounts — shown in quick-login panel. Emails match /app/memory/test_credentials.md
const TEST_ACCOUNTS = [
  { label: 'Free',                email: 'free@wladbot.test',              tier: 'FREE',        color: 'bg-slate-500' },
  { label: 'Leadership OS €997',  email: 'standard@wladbot.test',          tier: 'STANDARD',    color: 'bg-gradient-to-r from-[#BFFF00] to-[#9ACC00]' },
  { label: 'OS PLUS €4.447',      email: 'accelerator@wladbot.test',       tier: 'ACCELERATOR', color: 'bg-[#0A0A0A] border border-[#BFFF00]/40' },
  { label: 'OS Raten 3/12',       email: 'accelerator-raten@wladbot.test', tier: 'RATEN',       color: 'bg-[#1a1a2e] border border-[#BFFF00]/30' },
];

const QuickLoginRow = ({ acc, isLoading, disabled, onLogin }) => {
  const marker = (acc.tier === 'ACCELERATOR' || acc.tier === 'RATEN')
    ? <span className="text-[#BFFF00]">★</span>
    : acc.tier.charAt(0);
  const rightIcon = isLoading
    ? <Loader2 size={12} className="text-[#BFFF00] animate-spin shrink-0" />
    : <ArrowRight size={12} className="text-white/20 shrink-0" />;

  return (
    <button
      type="button"
      onClick={() => onLogin(acc.email)}
      disabled={disabled}
      data-testid={`quick-login-${acc.tier.toLowerCase()}`}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[#BFFF00]/20 text-left transition-all disabled:opacity-40"
    >
      <div className={`w-7 h-7 rounded-md ${acc.color} flex items-center justify-center text-[8px] font-black text-[#0A0A0A] shrink-0`}>
        {marker}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white/90">{acc.label}</p>
        <p className="text-[9px] text-white/40 truncate">{acc.email}</p>
      </div>
      {rightIcon}
    </button>
  );
};

export const QuickLoginList = ({ quickLoadingEmail, onQuickLogin, de }) => (
  <div className="mt-6 pt-6 border-t border-white/[0.06]" data-testid="quick-login-panel">
    <div className="flex items-center gap-2 mb-3">
      <FlaskConical size={12} className="text-amber-400" />
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/80">
        {de ? 'QA Test-Accounts · 1-Klick Login' : 'QA Test Accounts · 1-Click Login'}
      </p>
    </div>
    <div className="grid grid-cols-1 gap-1.5">
      {TEST_ACCOUNTS.map(acc => (
        <QuickLoginRow
          key={acc.email}
          acc={acc}
          isLoading={quickLoadingEmail === acc.email}
          disabled={Boolean(quickLoadingEmail)}
          onLogin={onQuickLogin}
        />
      ))}
    </div>
    <p className="text-[9px] text-white/25 mt-2 text-center">
      {de ? 'Passwort für alle: ' : 'Password for all: '}<span className="font-mono text-white/40">test123</span>
    </p>
  </div>
);
