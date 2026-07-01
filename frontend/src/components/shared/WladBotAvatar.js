import { useState } from 'react';
import { Zap } from 'lucide-react';
import { WLADBOT_AVATAR, WLADBOT_AVATAR_FALLBACKS } from '../../lib/brandAssets';

/**
 * WladBot-Avatar · Chat- und Bot-Kontext (NICHT auf Sales-/Coaching-Seiten).
 *
 * Bevorzugt den Pixar-Style 3D-Render von WladBot (siehe WLADBOT_PIXAR_SRC).
 * Solange kein Render-Asset hinterlegt ist — oder wenn das Bild nicht lädt —
 * fällt der Avatar sauber auf das Lime-Brand-Glyph (Zap) zurück. So bleibt
 * der Build grün und es entstehen keine 404s, bevor das Bild geliefert ist.
 *
 * Sobald der Render in public/wlad/ liegt, hier EINE Zeile setzen:
 *   const WLADBOT_PIXAR_SRC = '/wlad/wladbot-pixar.png';
 * → der neue Avatar erscheint überall im Chat (PlaybookChatView,
 *   PlaybookChatMessage, LandingChatPod …).
 */
const WLADBOT_PIXAR_SRC = WLADBOT_AVATAR;

export const WladBotAvatar = ({
  size = 28,
  className = '',
  ringColor = '#BFFF00',
  src = WLADBOT_PIXAR_SRC,
}) => {
  const [failed, setFailed] = useState(false);
  const useImage = Boolean(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden rounded-full shrink-0 shadow-lg flex items-center justify-center ${
        useImage ? 'bg-[#0A0A0A]' : 'bg-gradient-to-br from-[#BFFF00] to-[#9ACC00]'
      } ${className}`}
      style={{ width: size, height: size, boxShadow: `0 0 0 1.5px ${ringColor}` }}
    >
      {useImage ? (
        <img
          src={src}
          alt="WladBot · dein KI-Coach"
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[50%_18%]"
          onError={(e) => {
            // Chain: CDN render → real portrait (webp, jpg) → Zap glyph.
            const el = e.currentTarget;
            const i = Number(el.dataset.fb || 0);
            if (i < WLADBOT_AVATAR_FALLBACKS.length) {
              el.dataset.fb = String(i + 1);
              el.src = WLADBOT_AVATAR_FALLBACKS[i];
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <Zap size={Math.max(10, Math.round(size * 0.45))} className="text-[#0A0A0A]" strokeWidth={2.5} />
      )}
    </div>
  );
};
