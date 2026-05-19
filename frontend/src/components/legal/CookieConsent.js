/**
 * Cookie & Tracking Consent — GDPR-compliant banner.
 *
 * Persisted in localStorage under key `lo_consent_v1`. Bump the suffix when
 * the catalog of trackers changes so old consent is re-prompted.
 *
 * Three options:
 *   - Accept all   → essential + analytics + session-replay
 *   - Essential only → only Sentry error tracking (legitimate interest,
 *     Art. 6(1)(f) — no PII, no replay, no PostHog)
 *   - Customize    → granular toggles
 */
import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const CONSENT_KEY = 'lo_consent_v1';

export const CONSENT_DEFAULTS = {
  essential: true,         // always on — login session cookie, JWT
  analytics: false,        // PostHog event capture
  session_replay: false,   // Sentry replay + PostHog recordings
};

export const readConsent = () => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.v === 1 ? parsed : null;
  } catch {
    return null;
  }
};

const writeConsent = (consent) => {
  const payload = { v: 1, ts: new Date().toISOString(), ...consent };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  // Broadcast so other tabs / trackers can react immediately.
  window.dispatchEvent(new CustomEvent('lo:consent', { detail: payload }));
};

export const CookieConsent = () => {
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [show, setShow] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [opts, setOpts] = useState(CONSENT_DEFAULTS);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setShow(true);
  }, []);

  if (!show) return null;

  const acceptAll = () => {
    writeConsent({ essential: true, analytics: true, session_replay: true });
    setShow(false);
  };
  const essentialOnly = () => {
    writeConsent({ essential: true, analytics: false, session_replay: false });
    setShow(false);
  };
  const saveCustom = () => {
    writeConsent({ ...opts, essential: true });
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6 pointer-events-none" data-testid="cookie-consent-banner">
      <div className="mx-auto max-w-3xl pointer-events-auto rounded-2xl bg-[#0A0A0A] border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#BFFF00] flex items-center justify-center shrink-0 text-[#0A0A0A] font-black text-lg">🍪</div>
            <div>
              <h3 className="text-white font-black text-base mb-1">
                {de ? 'Datenschutz & Cookies' : 'Privacy & Cookies'}
              </h3>
              <p className="text-white/70 text-[12px] leading-relaxed">
                {de
                  ? 'Wir nutzen technisch notwendige Cookies für deinen Login. Optional helfen uns Analyse-Tools, die App besser zu machen. Du entscheidest.'
                  : 'We use strictly necessary cookies for your login. Optional analytics tools help us improve. Your choice.'}
                {' '}
                <a href="/datenschutz" className="text-[#BFFF00] underline hover:no-underline">{de ? 'Datenschutzerklärung' : 'Privacy policy'}</a>
              </p>
            </div>
          </div>

          {customizing && (
            <div className="space-y-2 mb-4 bg-white/[0.03] rounded-xl p-3" data-testid="consent-customize-panel">
              {[
                { k: 'essential', t_de: 'Technisch notwendig', t_en: 'Strictly necessary', desc_de: 'Login, Session — kann nicht deaktiviert werden', desc_en: 'Login, session — cannot be disabled', locked: true },
                { k: 'analytics', t_de: 'Analyse (PostHog)', t_en: 'Analytics (PostHog)', desc_de: 'Anonyme Nutzungs-Statistiken', desc_en: 'Anonymous usage stats' },
                { k: 'session_replay', t_de: 'Session-Replay (Sentry)', t_en: 'Session replay (Sentry)', desc_de: 'Für gezielte Fehler-Reproduktion', desc_en: 'For targeted bug repro' },
              ].map(({ k, t_de, t_en, desc_de, desc_en, locked }) => (
                <label key={k} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opts[k]}
                    disabled={locked}
                    onChange={(e) => setOpts(prev => ({ ...prev, [k]: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 accent-[#BFFF00]"
                    data-testid={`consent-toggle-${k}`}
                  />
                  <div className="flex-1">
                    <p className="text-white text-[12px] font-bold leading-tight">{de ? t_de : t_en}</p>
                    <p className="text-white/50 text-[10px] leading-tight">{de ? desc_de : desc_en}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!customizing ? (
              <>
                <button onClick={acceptAll} className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-[#BFFF00] text-[#0A0A0A] text-[12px] font-black hover:brightness-110 transition" data-testid="consent-accept-all">
                  {de ? 'Alle akzeptieren' : 'Accept all'}
                </button>
                <button onClick={essentialOnly} className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 transition" data-testid="consent-essential-only">
                  {de ? 'Nur notwendige' : 'Essential only'}
                </button>
                <button onClick={() => setCustomizing(true)} className="flex-1 min-w-[100px] py-2.5 rounded-xl border border-white/20 text-white text-[12px] font-bold hover:bg-white/5 transition" data-testid="consent-customize">
                  {de ? 'Anpassen' : 'Customize'}
                </button>
              </>
            ) : (
              <>
                <button onClick={saveCustom} className="flex-1 py-2.5 rounded-xl bg-[#BFFF00] text-[#0A0A0A] text-[12px] font-black hover:brightness-110 transition" data-testid="consent-save-custom">
                  {de ? 'Auswahl speichern' : 'Save selection'}
                </button>
                <button onClick={() => setCustomizing(false)} className="py-2.5 px-4 rounded-xl text-white/60 text-[12px] hover:text-white transition" data-testid="consent-back">
                  {de ? 'Zurück' : 'Back'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
