import { MessageSquareText } from 'lucide-react';
import { FIVE_ROLES } from './chatRoles';

export const ChatEmpty = ({ setSelectedAgent, lang, de }) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-20">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] flex items-center justify-center mb-5 shadow-xl shadow-black/10">
      <MessageSquareText size={28} className="text-white" />
    </div>
    <h3 className="text-xl font-black mb-2">{de ? 'Die 5 Rollen der idealen Führungskraft' : 'The 5 Roles of the Ideal Leader'}</h3>
    <p className="text-sm text-muted-foreground max-w-md mb-6">{de ? 'Wähle eine Rolle oben, oder frag mich einfach. Je mehr Kontext du gibst, desto besser kann ich helfen.' : 'Select a role above, or just ask me anything about leadership.'}</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-xl">
      {FIVE_ROLES.map((role) => (
        <button key={role.value} onClick={() => setSelectedAgent(role.value)}
          className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-card hover:shadow-md transition-all text-left group"
          data-testid={`role-card-${role.value.toLowerCase()}`}>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
            <role.icon size={14} className="text-white" />
          </div>
          <p className="text-xs font-bold">{role.label[lang] || role.label.en}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{role.desc[lang] || role.desc.en}</p>
        </button>
      ))}
    </div>
  </div>
);
