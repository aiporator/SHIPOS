import { useState, useRef, useCallback } from 'react';
import logger from '../../lib/logger';
import { Button } from '../ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export const VoiceRecorder = ({ onTranscription, disabled }) => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('file', blob, 'recording.webm');
          const res = await api.post('/voice/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data.text) onTranscription(res.data.text);
        } catch (err) {
          logger.error('Transcription failed:', err);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      logger.error('Microphone access denied:', err);
    }
  }, [onTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  if (transcribing) {
    return (
      <Button disabled size="icon" variant="outline" className="shrink-0" data-testid="voice-transcribing">
        <Loader2 size={16} className="animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant={recording ? 'destructive' : 'outline'}
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled}
      className={`shrink-0 ${recording ? 'animate-pulse-glow' : ''}`}
      data-testid="voice-record-btn"
      title={recording ? 'Stop recording' : 'Start voice input'}
    >
      {recording ? <Square size={16} /> : <Mic size={16} />}
    </Button>
  );
};
