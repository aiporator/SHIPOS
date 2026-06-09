import { Volume2, Pause, Play } from 'lucide-react';

export const VoiceControls = ({ paused, muted, onTogglePause, onToggleMute, de }) => {
  const pauseLabel = paused ? (de ? 'Fortsetzen' : 'Resume') : (de ? 'Pause' : 'Pause');
  const muteLabel = muted ? (de ? 'Ton aus' : 'Muted') : (de ? 'Ton an' : 'Sound on');

  return (
    <div className="w-full max-w-2xl flex items-center justify-center gap-4">
      <button
        onClick={onTogglePause}
        data-testid="voice-mode-pause"
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-sm font-medium transition-colors border border-white/10"
      >
        {paused ? <Play size={16} /> : <Pause size={16} />}
        {pauseLabel}
      </button>
      <button
        onClick={onToggleMute}
        data-testid="voice-mode-mute"
        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-colors border ${
          muted
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.12]'
        }`}
      >
        <Volume2 size={16} />
        {muteLabel}
      </button>
    </div>
  );
};
