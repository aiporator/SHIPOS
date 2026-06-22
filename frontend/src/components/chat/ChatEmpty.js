import { MessageSquareText } from 'lucide-react';

const SUGGESTIONS_DE = [
  'Hilf mir, eine schwierige Botschaft überzeugend zu vermitteln',
  'Wie delegiere ich effektiver?',
  'Mein Team ist demotiviert · was kann ich tun?',
  'Wie zeige ich mehr Empathie als Führungskraft?',
  'Ich muss eine unpopuläre Entscheidung durchsetzen',
  'Coach mich für mein nächstes Feedbackgespräch',
];

const SUGGESTIONS_EN = [
  'Help me deliver a difficult message persuasively',
  'How do I delegate more effectively?',
  'My team is demotivated · what can I do?',
  'How do I show more empathy as a leader?',
  'I need to push through an unpopular decision',
  'Coach me for my next feedback conversation',
];

export const ChatEmpty = ({ setInput, lang, de }) => {
  // lang preserved for parity with caller; reads from `de` for switch.
  void lang;
  const suggestions = de ? SUGGESTIONS_DE : SUGGESTIONS_EN;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20" data-testid="chat-empty">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] flex items-center justify-center mb-5 shadow-xl shadow-black/10">
        <MessageSquareText size={28} className="text-white" />
      </div>
      <h3 className="text-xl font-black mb-2">{de ? 'Worüber willst du sprechen?' : 'What do you want to talk about?'}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {de
          ? 'Frag WladBot alles rund um Leadership, Kommunikation, Team-Dynamik und Entscheidungen. Je konkreter du fragst, desto besser kann er helfen.'
          : 'Ask WladBot anything about leadership, communication, team dynamics, and decisions. The more specific you are, the better he can help.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full px-4">
        {suggestions.map((s, idx) => (
          <button
            key={`suggestion-${idx}`}
            onClick={() => setInput?.(s)}
            className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-card hover:border-[#BFFF00]/40 hover:shadow-md transition-all text-left"
            data-testid={`suggestion-btn-${idx}`}
          >
            <p className="text-[12px] font-medium leading-snug">{s}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
