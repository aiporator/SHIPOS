import { Zap } from 'lucide-react';

/**
 * Brand-konsistentes WladBot-Visual — ersetzt das echte Wlad-Foto
 * im Chat- und Bot-Kontext (NICHT auf Sales-/Coaching-Seiten).
 */
export const WladBotAvatar = ({ size = 28, className = '', ringColor = '#BFFF00' }) => (
  <div
    className={`rounded-full bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] flex items-center justify-center shrink-0 shadow-lg ${className}`}
    style={{ width: size, height: size, boxShadow: `0 0 0 1px ${ringColor}33` }}
  >
    <Zap size={Math.max(10, Math.round(size * 0.45))} className="text-[#0A0A0A]" strokeWidth={2.5} />
  </div>
);
