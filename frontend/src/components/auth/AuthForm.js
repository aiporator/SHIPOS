import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export const AuthForm = ({ mode, form, setForm, showPw, setShowPw, loading, onSubmit, de }) => {
  const submitLabel = loading
    ? '...'
    : (mode === 'register' ? (de ? 'Account erstellen' : 'Create Account') : (de ? 'Anmelden' : 'Sign In'));

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {mode === 'register' && (
        <div>
          <label className="block mb-2 text-sm font-medium text-white/70">{de ? 'Vollständiger Name' : 'Full Name'}</label>
          <input
            data-testid="register-name-input"
            type="text"
            placeholder="Max Mustermann"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/20 px-4 text-sm transition-all outline-none focus:border-[#BFFF00]/50 focus:ring-1 focus:ring-[#BFFF00]/20 focus:bg-white/[0.05]"
          />
        </div>
      )}
      <div>
        <label className="block mb-2 text-sm font-medium text-white/70">E-Mail</label>
        <input
          data-testid={mode === 'register' ? 'register-email-input' : 'login-email-input'}
          type="email"
          placeholder="name@firma.de"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/20 px-4 text-sm transition-all outline-none focus:border-[#BFFF00]/50 focus:ring-1 focus:ring-[#BFFF00]/20 focus:bg-white/[0.05]"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-white/70">{de ? 'Passwort' : 'Password'}</label>
        <div className="relative">
          <input
            data-testid={mode === 'register' ? 'register-password-input' : 'login-password-input'}
            type={showPw ? 'text' : 'password'}
            placeholder={de ? 'Min. 6 Zeichen' : 'Min. 6 characters'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/20 px-4 pr-11 text-sm transition-all outline-none focus:border-[#BFFF00]/50 focus:ring-1 focus:ring-[#BFFF00]/20 focus:bg-white/[0.05]"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        data-testid={mode === 'register' ? 'register-submit-btn' : 'login-submit-btn'}
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-[#BFFF00] text-[#0A0A0A] font-bold text-sm hover:bg-[#D4FF4D] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(191,255,0,0.15)] hover:shadow-[0_0_25px_rgba(191,255,0,0.3)] disabled:opacity-50"
      >
        {loading
          ? submitLabel
          : <>{submitLabel}<ArrowRight size={16} /></>}
      </button>
    </form>
  );
};
