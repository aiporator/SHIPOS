import { Button } from '../ui/button';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

export const PaywallBlur = ({ children, title, description, ctaText, onUnlock }) => {
  return (
    <div className="relative" data-testid="paywall-blur">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
        <div className="text-center max-w-sm p-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--cyan)]/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={20} className="text-[var(--cyan)]" />
          </div>
          <h3 className="text-base font-extrabold mb-1">{title || 'Unlock Full Analysis'}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description || 'Get the complete leadership report and personalized recommendations.'}</p>
          <Button
            onClick={onUnlock}
            className="bg-[var(--cyan)] text-black hover:opacity-90 font-semibold"
            data-testid="paywall-unlock-btn"
          >
            <Sparkles size={14} className="mr-1.5" />
            {ctaText || 'Unlock Full System (14 days free)'}
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2">No credit card required</p>
        </div>
      </div>
    </div>
  );
};
