import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, ArrowRight, Square, Loader2 } from 'lucide-react';
import { RatingConfig } from './RatingConfig';

const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const RecordingControls = ({ recording, recorded, analyzing, onStart, onStop, onReset, onSubmit, de }) => {
  if (analyzing) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] flex items-center justify-center mx-auto mb-4 shadow-lg animate-breathe">
          <Loader2 size={24} className="text-white animate-spin" />
        </div>
        <p className="text-base font-bold">{de ? 'Deine Delivery wird analysiert...' : 'Analyzing your leadership delivery...'}</p>
        <p className="text-sm text-muted-foreground mt-1">{de ? 'Klarheit, Selbstvertrauen, Empathie & Struktur werden bewertet' : 'Evaluating clarity, confidence, empathy & structure'}</p>
      </div>
    );
  }
  if (recording) {
    return (
      <Button onClick={onStop} variant="outline" className="border-red-300 dark:border-red-500/30 text-red-500 px-8 h-12 font-bold" data-testid="stop-recording-btn">
        <Square size={16} className="mr-2" /> {de ? 'Aufnahme stoppen' : 'Stop Recording'}
      </Button>
    );
  }
  if (recorded) {
    return (
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="font-semibold" data-testid="re-record-btn">{de ? 'Nochmal aufnehmen' : 'Re-record'}</Button>
        <Button onClick={onSubmit} className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] hover:from-blue-700 hover:to-violet-700 text-white font-bold px-8 h-12 shadow-lg shadow-black/10" data-testid="submit-video-btn">
          {de ? 'Zur Analyse einreichen' : 'Submit for Analysis'} <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    );
  }
  return (
    <Button onClick={onStart} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-8 h-12 shadow-lg shadow-red-500/20" data-testid="start-recording-btn">
      <div className="w-3 h-3 rounded-full bg-white mr-2" /> {de ? 'Aufnahme starten' : 'Start Recording'}
    </Button>
  );
};

export const RecordingStudio = ({
  activeChallenge, recording, recorded, analyzing, timer,
  videoRef, ratingConfig, onSaveRatingConfig,
  onCancel, onStartRecording, onStopRecording, onReset, onSubmit, lang,
}) => {
  const de = lang === 'de';
  const progressPct = Math.min(100, (timer / activeChallenge.time_limit) * 100);
  const progressCls = timer / activeChallenge.time_limit > 0.8
    ? 'bg-red-500'
    : 'bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E]';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel} className="font-semibold" data-testid="cancel-video-btn">
          <ArrowLeft size={16} className="mr-1" /> {de ? 'Abbrechen' : 'Cancel'}
        </Button>
        {recording && <Badge className="bg-red-500 text-white border-0 text-xs font-bold px-3 py-1 animate-pulse">AUFNAHME</Badge>}
      </div>

      <div className="text-center mb-2">
        <h2 className="text-xl font-black">{activeChallenge.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{activeChallenge.description}</p>
      </div>

      {!recording && !recorded && !analyzing && (
        <RatingConfig config={ratingConfig} onChange={onSaveRatingConfig} de={de} compact />
      )}

      <Card className="overflow-hidden border-black/[0.06] dark:border-white/[0.06] shadow-xl">
        <CardContent className="p-0 relative">
          <video ref={videoRef} autoPlay playsInline className="w-full aspect-video bg-black rounded-xl" style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {recording && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
            <span className={`px-3 py-1.5 rounded-full text-sm font-mono font-bold ${recording ? 'bg-red-500/90 text-white' : 'bg-black/60 text-white backdrop-blur-sm'}`}>
              {formatTime(timer)} / {formatTime(activeChallenge.time_limit)}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div className={`h-full transition-all duration-1000 ${progressCls}`} style={{ width: `${progressPct}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <RecordingControls
          recording={recording} recorded={recorded} analyzing={analyzing}
          onStart={onStartRecording} onStop={onStopRecording}
          onReset={onReset} onSubmit={onSubmit} de={de}
        />
      </div>
    </div>
  );
};
