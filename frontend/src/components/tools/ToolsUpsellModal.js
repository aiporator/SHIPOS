import { Button } from '../ui/button';
import { X, Star, ArrowRight } from 'lucide-react';

export const ToolsUpsellModal = ({ onClose, de }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
    <div className="relative w-full max-w-lg mx-4 animate-slide-up">
      <div className="upsell-border">
        <div className="p-8 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <Star size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">{de ? 'Erweiterte Workflows freischalten' : 'Unlock Advanced Workflows'}</h2>
          <p className="text-muted-foreground mb-4">{de ? 'Erhalte Experten-KI-Analysen, personalisierte Coaching-Pläne und prioritären Support.' : 'Get expert-level AI analysis, personalized coaching plans, and priority support.'}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl font-black gradient-text">4.977</span>
            <span className="text-lg text-muted-foreground">EUR</span>
          </div>
          <Button className="w-full bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] text-white font-bold h-12 shadow-lg shadow-blue-500/25" onClick={() => window.location.href='/coaching'}>
            {de ? 'Vollzugang erhalten' : 'Get Full Access'} <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);
