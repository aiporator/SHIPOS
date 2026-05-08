import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { VoiceRecorder } from '../shared/VoiceRecorder';
import { WladBotAvatar } from '../shared/WladBotAvatar';
import { ArrowLeft, Send } from 'lucide-react';
import { PlaybookChatMessage } from './PlaybookChatMessage';

const ProgressBar = ({ steps, currentStep }) => (
  <div className="flex items-center gap-2 mt-1">
    {steps?.map((_, stepIdx) => {
      let cls = 'bg-gray-200 dark:bg-muted';
      if (stepIdx < currentStep) cls = 'bg-[#BFFF00]';
      else if (stepIdx === currentStep) cls = 'bg-[#BFFF00]/60';
      return <div key={`progress-${stepIdx}`} className={`w-5 h-1 rounded-full transition-all ${cls}`} />;
    })}
    <span className="text-[10px] text-muted-foreground font-medium ml-1">{currentStep + 1}/{steps?.length}</span>
  </div>
);

const TypingDots = () => (
  <div className="flex items-start gap-3 animate-fade-in">
    <WladBotAvatar size={28} />
    <div className="chat-bubble-bot px-4 py-3">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 typing-dot" />
      </div>
    </div>
  </div>
);

export const PlaybookChatView = ({
  activePlaybook, currentStep, chatMessages, input, setInput,
  loading, completed, adviceReport, generatingReport, generatingPDF,
  scrollRef, onReset, onSend, onVoice, onGenerateReport, onDownloadPDF, de,
}) => (
  <div className="flex flex-col h-[calc(100vh-0px)] bg-gradient-mesh" data-testid="playbook-chat">
    {generatingPDF && (
      <div className="pdf-loading-overlay">
        <div className="text-center space-y-4">
          <div className="pdf-spinner mx-auto" />
          <p className="text-white font-bold text-lg">{de ? 'PDF wird erstellt...' : 'Generating PDF...'}</p>
          <p className="text-white/60 text-sm">{de ? 'Dein Premium Leadership Report' : 'Your Premium Leadership Report'}</p>
        </div>
      </div>
    )}

    <div className="border-b border-black/[0.04] dark:border-white/[0.04] bg-white/80 dark:bg-card/80 backdrop-blur-xl px-5 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 w-8 p-0" data-testid="back-to-playbooks-btn">
            <ArrowLeft size={16} />
          </Button>
          <WladBotAvatar size={32} />
          <div>
            <h2 className="text-[14px] font-bold leading-none">{activePlaybook.title}</h2>
            <ProgressBar steps={activePlaybook.steps} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-4 py-5" ref={scrollRef}>
      <div className="max-w-2xl mx-auto space-y-4">
        {chatMessages.map((msg, i) => (
          <PlaybookChatMessage
            key={`pb-msg-${msg.from}-${i}`}
            msg={msg}
            adviceReport={adviceReport}
            onGenerateReport={onGenerateReport}
            generatingReport={generatingReport}
            onDownloadPDF={onDownloadPDF}
            generatingPDF={generatingPDF}
            de={de}
          />
        ))}
        {loading && !generatingReport && <TypingDots />}
      </div>
    </div>

    {!completed && (
      <div className="border-t border-black/[0.04] dark:border-white/[0.04] bg-white/80 dark:bg-card/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <VoiceRecorder onResult={onVoice} />
          <Textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder={de ? 'Beschreibe deine Situation...' : 'Describe your situation...'}
            className="flex-1 resize-none min-h-[42px] max-h-28 bg-gray-50 dark:bg-muted/20 border-black/[0.05] dark:border-white/[0.05] rounded-xl text-[13px]"
            rows={1} data-testid="playbook-chat-input" />
          <Button onClick={onSend} disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] h-[42px] w-[42px] p-0 shrink-0 shadow-sm" data-testid="playbook-send-btn">
            <Send size={16} />
          </Button>
        </div>
      </div>
    )}
  </div>
);
