import { useNavigate } from 'react-router-dom';
import { Phone, PlayCircle, HelpCircle, Mail } from 'lucide-react';

export const CoachingRightPanel = ({ de, onCheckout }) => {
  const navigate = useNavigate();
  return (
    <div className="p-5 space-y-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {de ? 'Schnellzugriff' : 'Quick Actions'}
      </h3>

      <div className="space-y-2">
        <button onClick={() => onCheckout('accelerator')} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-purple-50/50 dark:hover:bg-[#7B3FE4]/5 transition-colors text-left" data-testid="quick-book-call">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-500 flex items-center justify-center shrink-0">
            <Phone size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold">{de ? 'Call buchen' : 'Book Call'}</p>
            <p className="text-[10px] text-muted-foreground">{de ? '15 Min. kostenlos' : '15 min free'}</p>
          </div>
        </button>
        <button onClick={() => navigate('/simulations')} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors text-left" data-testid="quick-simulation">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <PlayCircle size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold">{de ? 'Simulation starten' : 'Start Simulation'}</p>
            <p className="text-[10px] text-muted-foreground">{de ? '12 Szenarien' : '12 scenarios'}</p>
          </div>
        </button>
      </div>

      <div className="pt-3 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {de ? 'Hilfe & Support' : 'Help & Support'}
        </h3>
        <div className="space-y-2">
          <button onClick={() => window.open('mailto:support@leader-os.de')} className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors" data-testid="support-faq">
            <HelpCircle size={13} className="text-muted-foreground" />
            <span className="text-xs">{de ? 'FAQ & Support' : 'FAQ & Support'}</span>
          </button>
          <button onClick={() => window.open('mailto:support@leader-os.de')} className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors" data-testid="support-email">
            <Mail size={13} className="text-muted-foreground" />
            <span className="text-xs">support@leader-os.de</span>
          </button>
        </div>
      </div>
    </div>
  );
};
