/**
 * Global TTS playback speed — used by VoicePlayButton + voice overlays.
 * Persisted in localStorage so the user's pace preference survives reloads.
 */
const KEY = 'wladbot_tts_speed_v1';
const DEFAULT = 1.25;
const ALLOWED = [0.75, 1, 1.25, 1.5];

const read = () => {
  try {
    const raw = parseFloat(localStorage.getItem(KEY));
    return ALLOWED.includes(raw) ? raw : DEFAULT;
  } catch { return DEFAULT; }
};

export const getTtsSpeed = () => read();

export const setTtsSpeed = (speed) => {
  if (!ALLOWED.includes(speed)) return;
  try { localStorage.setItem(KEY, String(speed)); } catch { /* ignore */ }
  // Notify any mounted <audio> tags so they update in-flight.
  try { window.dispatchEvent(new CustomEvent('wladbot:tts-speed', { detail: speed })); } catch { /* ignore */ }
};

export const TTS_SPEEDS = ALLOWED;
