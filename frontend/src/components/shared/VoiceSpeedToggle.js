/**
 * VoiceSpeedToggle · premium pill toggle (0.75x · 1x · 1.25x · 1.5x).
 * Stored globally via lib/ttsSpeed.js so every <audio> across the app honors it.
 */
import { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { getTtsSpeed, setTtsSpeed, TTS_SPEEDS } from '../../lib/ttsSpeed';

export const VoiceSpeedToggle = ({ className = '', testId = 'voice-speed-toggle' }) => {
  const [speed, setSpeed] = useState(getTtsSpeed());

  useEffect(() => {
    const onChange = (e) => setSpeed(e.detail);
    window.addEventListener('wladbot:tts-speed', onChange);
    return () => window.removeEventListener('wladbot:tts-speed', onChange);
  }, []);

  const change = (next) => {
    setTtsSpeed(next);
    setSpeed(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Voice playback speed"
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm p-0.5 ${className}`}
      data-testid={testId}
    >
      <span className="inline-flex items-center pl-2 pr-1 text-white/40">
        <Gauge size={11} />
      </span>
      {TTS_SPEEDS.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={speed === s}
          onClick={() => change(s)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tabular-nums transition-all ${
            speed === s
              ? 'bg-[#BFFF00] text-[#0A0A0A] shadow-sm'
              : 'text-white/55 hover:text-white/85'
          }`}
          data-testid={`${testId}-${s}`}
        >
          {s === 1 ? '1×' : `${s}×`}
        </button>
      ))}
    </div>
  );
};
