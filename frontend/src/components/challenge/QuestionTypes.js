import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, MessageSquareText, CheckCircle2, Zap, Wrench } from 'lucide-react';

export const CoachQuestion = ({ q, currentQ, answers, selectAnswer, de }) => (
  <>
    <Badge className="bg-[#7B3FE4]/10 text-[#6B21A8] dark:bg-[#7B3FE4]/10 dark:text-[#A78BFA] border-0 text-[10px] font-bold">
      <Brain size={10} className="mr-1" /> KI-COACH AUFGABE
    </Badge>
    <h3 className="text-base font-bold leading-relaxed">{q.q}</h3>
    <div className="p-4 rounded-xl bg-gradient-to-r from-[#BFFF00]/[0.04] to-[#BFFF00]/[0.06] dark:from-[#BFFF00]/[0.04] dark:to-[#BFFF00]/5 border border-[#BFFF00]/15 space-y-3">
      <p className="text-sm text-muted-foreground">{de ? 'Öffne den KI-Coach in einem neuen Tab und führe die Aufgabe durch. Komm danach hierher zurück.' : 'Open the AI Coach in a new tab and complete the task. Come back here after.'}</p>
      <div className="flex gap-2">
        <Button onClick={() => window.open(q.path, '_blank')}
          className="flex-1 bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] font-bold" data-testid="coach-task-btn">
          <MessageSquareText size={14} className="mr-1.5" /> {de ? 'KI-Coach öffnen' : 'Open AI Coach'}
        </Button>
        <Button onClick={() => selectAnswer(currentQ, 1)} variant="outline" className="font-bold" data-testid="coach-done-btn">
          {de ? 'Erledigt' : 'Done'}
        </Button>
      </div>
      {answers[currentQ] !== undefined && (
        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {de ? 'Aufgabe als erledigt markiert!' : 'Task marked as done!'}</p>
      )}
    </div>
  </>
);

export const ActionQuestion = ({ q, currentQ, answers, selectAnswer, de }) => (
  <>
    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-0 text-[10px] font-bold">
      <Zap size={10} className="mr-1" /> PRAXIS-AUFGABE
    </Badge>
    <h3 className="text-base font-bold leading-relaxed">{q.q}</h3>
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200/30 space-y-3">
      <p className="text-sm text-muted-foreground">{de ? 'Öffne das Tool in einem neuen Tab. Komm danach zurück und markiere als erledigt.' : 'Open the tool in a new tab. Come back and mark as done.'}</p>
      <div className="flex gap-2">
        <Button onClick={() => window.open(q.path, '_blank')}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold" data-testid="action-task-btn">
          <Wrench size={14} className="mr-1.5" /> {de ? 'Tool öffnen' : 'Open Tool'}
        </Button>
        <Button onClick={() => selectAnswer(currentQ, 1)} variant="outline" className="font-bold" data-testid="action-done-btn">
          {de ? 'Erledigt' : 'Done'}
        </Button>
      </div>
      {answers[currentQ] !== undefined && (
        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {de ? 'Aufgabe als erledigt markiert!' : 'Task marked as done!'}</p>
      )}
    </div>
  </>
);

export const MultipleChoiceQuestion = ({ q, currentQ, answers, selectAnswer }) => (
  <>
    <h3 className="text-base font-bold leading-relaxed">{q.q}</h3>
    <div className="space-y-2">
      {q.options?.map((opt, optIdx) => (
        <button key={`q${currentQ}-opt${optIdx}`} onClick={() => selectAnswer(currentQ, optIdx)}
          className={`w-full p-4 rounded-xl text-sm font-medium text-left transition-all border ${
            answers[currentQ] === optIdx
              ? 'bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/10 border-[#BFFF00]/30 dark:border-[#BFFF00]/20 text-[#4A6200] dark:text-[#BFFF00] shadow-sm'
              : 'bg-white dark:bg-card border-black/[0.06] dark:border-white/[0.06] hover:border-[#BFFF00]/30 dark:hover:border-[#BFFF00]/20'
          }`} data-testid={`quiz-option-${optIdx}`}>
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              answers[currentQ] === optIdx ? 'bg-[#BFFF00] text-black' : 'bg-gray-100 dark:bg-white/[0.06] text-muted-foreground'
            }`}>{String.fromCharCode(65 + optIdx)}</div>
            {opt}
          </div>
        </button>
      ))}
    </div>
  </>
);
