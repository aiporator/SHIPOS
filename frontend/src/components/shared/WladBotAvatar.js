import { useState } from 'react';
import { Zap } from 'lucide-react';
import { WLADBOT_AVATAR } from '../../lib/brandAssets';

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
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Zap size={Math.max(10, Math.round(size * 0.45))} className="text-[#0A0A0A]" strokeWidth={2.5} />
      )}
    </div>
  );
};
