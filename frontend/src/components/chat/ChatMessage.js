import { Badge } from '../ui/badge';
import { Lightbulb, Target, ListChecks, CheckCircle2 } from 'lucide-react';
import { WladRichText } from './WladRichText';

const UserMessage = ({ content }) => (
  <div className="flex justify-end mb-4 animate-fade-in" data-testid="chat-user-message">
    <div className="max-w-[70%] bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
      <p className="text-sm text-white whitespace-pre-wrap">{content}</p>
    </div>
  </div>
);

const PlainAssistantMessage = ({ content }) => (
  <div className="flex mb-4 animate-fade-in" data-testid="chat-ai-message">
    <div className="max-w-[80%] surface-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  </div>
);

export const ChatMessage = ({ msg, de }) => {
  if (msg.role === 'user') return <UserMessage content={msg.content} />;

  let parsed = msg.parsed;
  if (!parsed && typeof msg.content === 'string') {
    try { parsed = JSON.parse(msg.content); } catch { parsed = null; }
  }
  if (!parsed) return <PlainAssistantMessage content={msg.content} />;

  return (
    <div className="flex mb-6 animate-fade-in" data-testid="chat-ai-message">
      <div className="max-w-[85%] space-y-2.5">
        {parsed.agent_used && (
          <Badge className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] text-white text-[10px] font-semibold border-0">
            {parsed.agent_used}
          </Badge>
        )}
        {parsed.insight && (
          <div className="surface-card rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{de ? 'Leadership-Erkenntnis' : 'Leadership Insight'}</span>
            </div>
            <WladRichText text={parsed.insight} testId="msg-insight" />
          </div>
        )}
        {parsed.strategy && (
          <div className="surface-card gradient-border-anim rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-brand" />
              <span className="text-[10px] font-bold text-brand/80 uppercase tracking-wider">{de ? 'Strategie' : 'Strategy'}</span>
            </div>
            <WladRichText text={parsed.strategy} testId="msg-strategy" />
          </div>
        )}
        {parsed.action_steps?.length > 0 && (
          <div className="surface-card rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={14} className="text-brand" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{de ? 'Nächste Schritte' : 'Action Steps'}</span>
            </div>
            <ol className="text-sm space-y-2">
              {parsed.action_steps.map((s, i) => (
                <li key={`step-${s.slice(0, 15)}-${i}`} className="flex gap-3 items-start">
                  <span
                    className="w-5 h-5 rounded-full bg-brand text-[#0A0A0A] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_-2px_rgba(191,255,0,0.45)]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 leading-snug">
                    <WladRichText text={s} testId={`msg-step-${i}`} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        {parsed.reflection && (
          <div className="surface-card rounded-2xl px-4 py-3 border-l-2 border-l-amber-500/60">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400/90 block mb-1">
              {de ? 'Reflexion' : 'Reflection'}
            </span>
            <div className="italic text-muted-foreground">
              <WladRichText text={parsed.reflection} testId="msg-reflection" />
            </div>
          </div>
        )}
        {parsed.tasks?.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 size={12} className="text-green-500" />
            <span className="text-[11px] text-muted-foreground font-medium">{parsed.tasks.length} {de ? 'Aufgabe(n) erstellt' : 'task(s) created'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
