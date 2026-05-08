import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquareText, Building, Plus, Lightbulb } from 'lucide-react';
import { FIVE_ROLES } from './chatRoles';

const ContextPanel = ({ userContext, setUserContext, de }) => (
  <div className="flex gap-2 pb-3 animate-fade-in" data-testid="context-panel">
    <Input value={userContext.role} onChange={e => setUserContext(p => ({ ...p, role: e.target.value }))}
      placeholder={de ? 'Deine Rolle (z.B. Team Lead)' : 'Your Role'} className="h-8 text-xs bg-gray-50 dark:bg-muted/30" data-testid="context-role" />
    <Input value={userContext.company} onChange={e => setUserContext(p => ({ ...p, company: e.target.value }))}
      placeholder={de ? 'Unternehmen' : 'Company'} className="h-8 text-xs bg-gray-50 dark:bg-muted/30" data-testid="context-company" />
    <Input value={userContext.industry} onChange={e => setUserContext(p => ({ ...p, industry: e.target.value }))}
      placeholder={de ? 'Branche' : 'Industry'} className="h-8 text-xs bg-gray-50 dark:bg-muted/30" data-testid="context-industry" />
  </div>
);

const RoleTabs = ({ selectedAgent, setSelectedAgent, lang }) => (
  <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide" data-testid="agent-tabs">
    <button onClick={() => setSelectedAgent('auto')}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
        !selectedAgent || selectedAgent === 'auto'
          ? 'bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] text-white shadow-sm shadow-black/10'
          : 'bg-gray-100 dark:bg-muted text-muted-foreground hover:text-foreground'
      }`} data-testid="agent-tab-auto">
      <Lightbulb size={13} /> Auto
    </button>
    {FIVE_ROLES.map((role) => (
      <button key={role.value} onClick={() => setSelectedAgent(role.value)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
          selectedAgent === role.value
            ? `bg-gradient-to-r ${role.gradient} text-white shadow-sm`
            : 'bg-gray-100 dark:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid={`agent-tab-${role.value.toLowerCase()}`}>
        <role.icon size={13} /> {role.label[lang] || role.label.en}
      </button>
    ))}
  </div>
);

const ActiveRolePanel = ({ activeRole, lang, setInput, de }) => (
  <div className={`px-5 py-3 border-t border-black/[0.04] dark:border-white/[0.04] ${activeRole.bg}`}>
    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{activeRole.desc[lang] || activeRole.desc.en}</p>
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{de ? 'Typische Szenarien' : 'Common Scenarios'}</p>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {(activeRole.scenarios[lang] || activeRole.scenarios.en).map((sc, idx) => (
        <button key={`scenario-${sc.slice(0, 20)}-${idx}`} onClick={() => setInput(sc)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/70 dark:bg-background/40 border border-black/[0.06] dark:border-white/[0.06] hover:border-sky-300 dark:hover:border-sky-500/20 transition-colors whitespace-nowrap"
          data-testid={`scenario-btn-${idx}`}>
          {sc}
        </button>
      ))}
    </div>
  </div>
);

export const ChatRolesHeader = ({
  showContext, setShowContext, userContext, setUserContext,
  selectedAgent, setSelectedAgent, onNewSession, activeRole,
  setInput, lang, de,
}) => (
  <div className="border-b border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-card/80 backdrop-blur-xl">
    <div className="px-5 pt-4 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] flex items-center justify-center shadow-sm">
            <MessageSquareText size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black">{de ? 'KI Leadership Coach' : 'AI Leadership Coach'}</h2>
            <p className="text-[11px] text-muted-foreground font-medium">{de ? 'Die 5 Rollen der idealen Führungskraft' : 'The 5 Roles of the Ideal Leader'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowContext(!showContext)}
            className={`text-xs font-semibold h-8 border-black/10 dark:border-white/10 ${showContext ? 'bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/10 border-[#BFFF00]/30' : ''}`}
            data-testid="context-toggle-btn">
            <Building size={12} className="mr-1" /> {de ? 'Kontext' : 'Context'}
          </Button>
          <Button variant="outline" size="sm" onClick={onNewSession} className="text-xs font-semibold h-8 border-black/10 dark:border-white/10" data-testid="new-chat-session-btn">
            <Plus size={12} className="mr-1" /> {de ? 'Neuer Chat' : 'New Chat'}
          </Button>
        </div>
      </div>

      {showContext && <ContextPanel userContext={userContext} setUserContext={setUserContext} de={de} />}

      <RoleTabs selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} lang={lang} />
    </div>

    {activeRole && <ActiveRolePanel activeRole={activeRole} lang={lang} setInput={setInput} de={de} />}
  </div>
);
