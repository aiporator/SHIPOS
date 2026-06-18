import { Mic, Loader2, Volume2 } from 'lucide-react';
import { VOICE_STATES } from '../../hooks/useVoiceMode';

const ORB_SIZE = 240;

const orbBackground = (state) => state === VOICE_STATES.THINKING
  ? 'radial-gradient(circle at 30% 30%, #BFFF00 0%, #6B8A00 45%, #1A1A1A 100%)'
  : 'radial-gradient(circle at 30% 30%, #DFFF6A 0%, #BFFF00 35%, #4A5E00 100%)';

const orbShadow = (state) => state === VOICE_STATES.LISTENING
  ? '0 0 80px rgba(191,255,0,0.55), 0 0 140px rgba(191,255,0,0.25)'
  : '0 0 60px rgba(191,255,0,0.35)';

const orbIcon = (state) => {
  if (state === VOICE_STATES.THINKING) return <Loader2 size={48} className="text-[#0A0A0A] animate-spin" />;
  if (state === VOICE_STATES.SPEAKING) return <Volume2 size={56} className="text-[#0A0A0A]" />;
  return <Mic size={56} className="text-[#0A0A0A]" />;
};

export const VoiceOrb = ({ state, level, onTap, ariaLabel }) => {
  const scale = state === VOICE_STATES.LISTENING
    ? 1 + Math.min(level * 6, 0.45)
    : (state === VOICE_STATES.SPEAKING ? 1.12 : 1);

  return (
    <button onClick={onTap} data-testid="voice-mode-orb" className="relative outline-none" aria-label={ariaLabel}>
      <div
        className={`absolute inset-0 rounded-full ${state === VOICE_STATES.LISTENING ? 'animate-ping bg-[#BFFF00]/20' : ''}`}
        style={{ width: ORB_SIZE, height: ORB_SIZE, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      {state === VOICE_STATES.SPEAKING && (
        <div
          className="absolute rounded-full bg-[#BFFF00]/15 animate-pulse"
          style={{ width: ORB_SIZE + 40, height: ORB_SIZE + 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}
      <div
        className="relative rounded-full transition-transform duration-150 ease-out flex items-center justify-center"
        style={{
          width: ORB_SIZE, height: ORB_SIZE,
          transform: `scale(${scale})`,
          background: orbBackground(state),
          boxShadow: orbShadow(state),
        }}
      >
        {orbIcon(state)}
      </div>
    </button>
  );
};
