import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { CoachQuestion, ActionQuestion, MultipleChoiceQuestion } from './QuestionTypes';
import { ArrowLeft, ArrowRight, Clock, Sparkles } from 'lucide-react';

const catColors = {
  awareness: 'from-[#00AAFF] to-[#0088DD]',
  methoden: 'from-[#BFFF00] to-[#9ACC00]',
  praxis: 'from-amber-500 to-orange-500',
  dominance: 'from-red-500 to-pink-600',
};

export const QuizView = ({
  quizMode, currentQ, setCurrentQ, answers, selectAnswer,
  submitQuiz, submitting, de, setQuizMode
}) => {
  const q = quizMode.questions[currentQ];
  const total = quizMode.questions.length;
  const allAnswered = Object.keys(answers).length >= total;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-2xl mx-auto min-h-screen" data-testid="quiz-mode">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setQuizMode(null)} className="font-semibold">
            <ArrowLeft size={14} className="mr-1" /> {de ? 'Zurück' : 'Back'}
          </Button>
          <div className="flex-1">
            <div className="h-2 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] rounded-full transition-all" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs font-bold text-muted-foreground">{currentQ + 1}/{total}</span>
          <Badge variant="outline" className="text-[10px] font-bold"><Clock size={10} className="mr-1" /> 10 Min</Badge>
        </div>

        <div className="text-center mb-2">
          <Badge className={`bg-gradient-to-r ${catColors[quizMode.challenge?.category] || 'from-[#00AAFF] to-[#0088DD]'} text-white border-0 text-[10px] font-bold`}>
            {de ? `Tag ${quizMode.day}` : `Day ${quizMode.day}`} — {quizMode.challenge?.agent}
          </Badge>
        </div>

        {q && (
          <Card className="animate-fade-in" key={`quiz-q-${currentQ}`}>
            <CardContent className="p-6 space-y-5">
              {q.type === 'coach' ? (
                <CoachQuestion q={q} currentQ={currentQ} answers={answers} selectAnswer={selectAnswer} de={de} />
              ) : q.type === 'action' ? (
                <ActionQuestion q={q} currentQ={currentQ} answers={answers} selectAnswer={selectAnswer} de={de} />
              ) : (
                <MultipleChoiceQuestion q={q} currentQ={currentQ} answers={answers} selectAnswer={selectAnswer} />
              )}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                  <ArrowLeft size={14} className="mr-1" /> {de ? 'Zurück' : 'Previous'}
                </Button>
                {currentQ < total - 1 ? (
                  <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={answers[currentQ] === undefined}
                    className="bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] font-bold" data-testid="quiz-next-btn">
                    {de ? 'Weiter' : 'Next'} <ArrowRight size={14} className="ml-1" />
                  </Button>
                ) : (
                  <Button onClick={submitQuiz} disabled={!allAnswered || submitting}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold" data-testid="quiz-submit-btn">
                    <Sparkles size={14} className="mr-1" /> {de ? 'Auswerten' : 'Submit'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: total }).map((_, dotIdx) => (
            <button key={`dot-${dotIdx}`} onClick={() => setCurrentQ(dotIdx)}
              className={`w-3 h-3 rounded-full transition-all ${
                dotIdx === currentQ ? 'bg-[#BFFF00] scale-125' : answers[dotIdx] !== undefined ? 'bg-[#BFFF00]/60' : 'bg-gray-200 dark:bg-muted'
              }`} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
