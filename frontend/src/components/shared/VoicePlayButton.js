import { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import logger from '../../lib/logger';

/**
 * VoicePlayButton — triggers ElevenLabs TTS synthesis + inline <audio> playback.
 * @param {string} text - Text to speak (max 800 chars)
 * @param {string} persona - One of: wlad, bezos, musk, oprah, jobs, branson, sandberg, page, hastings
 * @param {string} size - xs | sm | md (default: sm)
 * @param {string} variant - primary | ghost | pill (default: ghost)
 * @param {string} label - Optional label override (default: "Anhören")
 * @param {() => void} onStart - Optional callback when synthesis starts
 * @param {() => void} onEnd - Optional callback when audio finishes
 */
export default function VoicePlayButton({
  text, persona, size = 'sm', variant = 'ghost', label,
  onStart, onEnd, className = '', testId,
}) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'h-8 px-3 text-[11px]',
    md: 'h-9 px-4 text-xs',
  };

  const variantClasses = {
    primary: 'bg-[#BFFF00] hover:bg-[#D4FF4D] text-[#0A0A0A] font-black shadow-md shadow-[#BFFF00]/10',
    ghost: 'bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-foreground border border-black/[0.06] dark:border-white/[0.06]',
    pill: 'bg-black/90 hover:bg-black text-white font-bold',
  };

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';  // release data-URL
      audioRef.current = null;
    }
    setPlaying(false);
    if (onEnd) onEnd();
  }, [onEnd]);

  // Cleanup when component unmounts or persona changes — prevents ghost audio
  // when user navigates away mid-playback.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [persona]);

  const speak = useCallback(async () => {
    if (playing) { stop(); return; }
    if (!text || !persona) return;
    setLoading(true);
    if (onStart) onStart();
    try {
      const res = await api.post('/voice/tts', { text: text.slice(0, 800), persona });
      const audio = new Audio(res.data.audio_url);
      audioRef.current = audio;
      audio.onended = () => { setPlaying(false); if (onEnd) onEnd(); };
      audio.onerror = () => { setPlaying(false); setLoading(false); };
      audio.onplay = () => { setLoading(false); setPlaying(true); };
      await audio.play();
    } catch (err) {
      logger.error('Voice TTS failed:', err);
      setLoading(false);
      setPlaying(false);
    }
  }, [text, persona, playing, stop, onStart, onEnd]);

  // Icon-only (xs) variant
  if (size === 'xs') {
    return (
      <button
        onClick={speak}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-full transition-all ${sizeClasses.xs} ${variantClasses[variant]} ${className} ${playing ? 'ring-2 ring-[#BFFF00]/40' : ''}`}
        aria-label={playing ? 'Stop' : 'Speak'}
        data-testid={testId || `voice-play-${persona}`}
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : playing ? <VolumeX size={10} /> : <Volume2 size={10} />}
      </button>
    );
  }

  return (
    <button
      onClick={speak}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${playing ? 'ring-2 ring-[#BFFF00]/40' : ''}`}
      data-testid={testId || `voice-play-${persona}`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : playing ? <VolumeX size={12} /> : <Volume2 size={12} />}
      <span className="font-bold">{playing ? (loading ? '...' : 'Stop') : (label || 'Anhören')}</span>
    </button>
  );
}
