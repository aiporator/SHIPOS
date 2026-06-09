import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { CheckCircle2, Star, XCircle, ArrowRight } from 'lucide-react';

export const QuizResult = ({ quizResult, setQuizResult, setQuizMode, setCurrentQ, setAnswers, de }) => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-2xl mx-auto min-h-screen" data-testid="quiz-result">
        <Card className="animate-fade-in">
          <CardContent className="p-6 text-center space-y-5">
            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-xl ${quizResult.passed ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/20' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20'}`}>
              {quizResult.passed ? <CheckCircle2 size={36} className="text-white" /> : <Star size={36} className="text-white" />}
            </div>
            <div>
              <p className="text-4xl font-black">{quizResult.score}%</p>
              <p className="text-sm text-muted-foreground">{quizResult.correct}/{quizResult.total} {de ? 'richtig' : 'correct'}</p>
            </div>
            <Badge className={`${quizResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} border-0 text-xs font-bold`}>
              {quizResult.passed ? (de ? 'BESTANDEN' : 'PASSED') : (de ? 'WIEDERHOLEN EMPFOHLEN' : 'RETRY RECOMMENDED')} — +{quizResult.xp_earned} XP
            </Badge>
          </CardContent>
        </Card>

        {/* Explanations */}
        <div className="space-y-2 mt-5">
          {quizResult.results?.map((r, rIdx) => (
            <Card key={`res-${r.question?.slice(0, 20) || rIdx}`} className={`${r.correct ? 'border-emerald-200/30 dark:border-emerald-500/10' : 'border-red-200/30 dark:border-red-500/10'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${r.correct ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
                    {r.correct ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1">{r.question}</p>
                    <p className="text-[11px] text-muted-foreground">{r.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          {!quizResult.passed && (
            <Button onClick={() => { setQuizResult(null); setCurrentQ(0); setAnswers({}); }} variant="outline" className="flex-1 font-semibold">
              {de ? 'Nochmal versuchen' : 'Try Again'}
            </Button>
          )}
          <Button onClick={() => { setQuizMode(null); setQuizResult(null); }} className="flex-1 bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] font-bold">
            {de ? 'Weiter zum Plan' : 'Continue'} <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};
