import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Video, Play, Mic } from 'lucide-react';
import { RatingConfig } from './RatingConfig';

const DIFF_CONFIG = {
  easy: { gradient: 'from-green-500 to-emerald-500', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  medium: { gradient: 'from-amber-500 to-orange-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  hard: { gradient: 'from-red-500 to-pink-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
};

const DIFF_LABEL_DE = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

export const ChallengeList = ({ challenges, ratingConfig, onSaveRatingConfig, onStartChallenge, lang }) => {
  const de = lang === 'de';
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] flex items-center justify-center shadow-lg shadow-[#7B3FE4]/20">
          <Video size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{de ? 'Video Analyse' : 'Video Analysis'}</h1>
          <p className="text-sm text-muted-foreground font-medium">{de ? 'Nimm dich selbst auf, wie du schwierige Szenarien meisterst. KI bewertet deine Performance.' : 'Record yourself tackling tough scenarios. AI scores your delivery.'}</p>
        </div>
      </div>

      <RatingConfig config={ratingConfig} onChange={onSaveRatingConfig} de={de} compact />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => {
          const diff = DIFF_CONFIG[c.difficulty] || DIFF_CONFIG.medium;
          const diffLabel = de ? (DIFF_LABEL_DE[c.difficulty] || c.difficulty) : c.difficulty;
          return (
            <Card key={c.challenge_id}
              className="cursor-pointer hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-0.5 transition-all duration-300 group border-black/[0.04] dark:border-white/[0.06]"
              data-testid={`video-challenge-${c.challenge_id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${diff.gradient} flex items-center justify-center shadow-sm`}>
                    <Video size={18} className="text-white" />
                  </div>
                  <Badge className={`${diff.bg} ${diff.text} text-[10px] font-bold border-0`}>{diffLabel}</Badge>
                </div>
                <h3 className="text-[15px] font-bold mb-1">{c.title}</h3>
                <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mic size={10} /> {Math.floor(c.time_limit / 60)} min</p>
                  <Button size="sm" onClick={() => onStartChallenge(c)}
                    className="bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] hover:brightness-110 text-[#0A0A0A] font-semibold text-xs h-8 shadow-sm"
                    data-testid={`start-video-${c.challenge_id}`}>
                    <Play size={12} className="mr-1" /> {de ? 'Mission starten' : 'Start Mission'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
