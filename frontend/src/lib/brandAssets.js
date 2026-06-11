/**
 * brandAssets — zentrale Quelle für Wlad-Portrait & Co.
 *
 * Vor diesem File hatten 8 Komponenten denselben Emergent-Asset-Hash
 * hardcoded — jede Asset-Rotation hätte 8 Edits gebraucht und ein
 * vergessener wäre garantiert gewesen. Jetzt ein Import.
 *
 * Reihenfolge der Quellen (Erster gewinnt):
 *   1) /wlad/wlad-portrait.jpg   — lokales CDN-Asset (sobald Studio
 *                                 die Originale geliefert hat).
 *   2) /landing/hf-04.png        — Specimen-Mockup mit Wlad-Thumb
 *                                 als Notnagel.
 *   3) Emergent-CDN              — Legacy-Hash. Wird beim nächsten
 *                                 Asset-Push komplett deaktiviert.
 *
 * Die Helfer-Funktion `withFallback(...)` setzt `onError` so, dass
 * fehlschlagende Bilder still durchrotieren — kein gebrochenes
 * <img>-Frame, kein Console-Spam.
 */

const LOCAL_PORTRAIT = '/wlad/wlad-portrait.jpg';
const LOCAL_STAGE = '/wlad/wlad-stage.jpg';
const MOCKUP_PORTRAIT = '/landing/hf-04.png';

// Legacy — wird gelöscht sobald die echten Wlad-Originale im /wlad/
// Verzeichnis liegen. Nur als Fallback bis dahin.
const LEGACY_EMERGENT_WLAD =
  'https://customer-assets.emergentagent.com/job_dd3457c0-3be5-4c4c-bc34-5b0e823b9278/artifacts/4knvn6cs_WladProfilbild.jpg';

export const WLAD_AVATAR = LOCAL_PORTRAIT;
export const WLAD_AVATAR_FALLBACKS = [MOCKUP_PORTRAIT, LEGACY_EMERGENT_WLAD];

export const WLAD_STAGE = LOCAL_STAGE;
export const WLAD_STAGE_FALLBACKS = [MOCKUP_PORTRAIT];

/**
 * onError-Handler für <img>-Tags, der automatisch durch die
 * Fallback-Liste rotiert. Einsatz: `onError={withFallback(WLAD_AVATAR_FALLBACKS)}`.
 */
export const withFallback = (chain) => (event) => {
  const img = event?.currentTarget;
  if (!img) return;
  const tried = Number(img.dataset.fallbackIdx || 0);
  if (tried >= chain.length) return;
  img.dataset.fallbackIdx = String(tried + 1);
  img.src = chain[tried];
};
