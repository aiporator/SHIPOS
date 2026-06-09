import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

/**
 * Choose between 2× 550€ or 12× 99€ installment plans for Leadership OS.
 */
const PLANS = [
  {
    id: 'leadership_os_2x',
    title: '2× Rate',
    headlinePrice: '2× 550€',
    total: 1100,
    extra: 103,
    description: 'Erste Rate jetzt, zweite Rate in 30 Tagen',
    badge: 'KLEINER AUFSCHLAG',
  },
  {
    id: 'leadership_os_12x',
    title: '12× Rate',
    headlinePrice: '12× 99€',
    total: 1188,
    extra: 191,
    description: 'Erste Rate jetzt, dann 11× monatlich',
    badge: 'FLEXIBEL',
  },
];

export const LeadershipOSInstallmentModal = ({ open, onClose, onConfirm, checkoutLoading, de = true }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-2xl" data-testid="installment-modal-os">
      <DialogHeader>
        <DialogTitle className="text-2xl font-black">
          {de ? 'Ratenzahlung wählen' : 'Choose installment'}
        </DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground -mt-2">
        {de
          ? 'Du erhältst sofort vollen Zugang. Folge-Raten werden automatisch fällig.'
          : 'You get full access immediately. Follow-up installments are due automatically.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {PLANS.map((plan) => {
          const loading = checkoutLoading === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onConfirm(plan.id)}
              disabled={Boolean(checkoutLoading)}
              data-testid={`installment-plan-${plan.id}`}
              className="text-left p-5 rounded-2xl border-2 border-[#BFFF00]/30 hover:border-[#BFFF00] bg-gradient-to-b from-white to-[#FAFFE5] dark:from-[#1A1A1A] dark:to-[#0F1408] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black tracking-widest text-[#6B8A00] dark:text-[#BFFF00]">{plan.badge}</span>
                {loading && <Loader2 size={14} className="animate-spin text-[#BFFF00]" />}
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{plan.title}</p>
              <p className="text-3xl font-black mb-2">{plan.headlinePrice}</p>
              <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
              <div className="border-t border-[#BFFF00]/15 pt-3 space-y-1">
                <p className="text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#6B8A00] dark:text-[#BFFF00]" />
                  {de ? 'Sofortiger Vollzugang' : 'Instant full access'}
                </p>
                <p className="text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#6B8A00] dark:text-[#BFFF00]" />
                  {de ? `Gesamt: ${plan.total}€ (+${plan.extra}€)` : `Total: €${plan.total} (+€${plan.extra})`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
        <p className="text-[11px] text-muted-foreground">
          {de ? 'Einmalzahlung 997€ ohne Aufschlag verfügbar' : 'One-time 997€ without surcharge available'}
        </p>
        <Button variant="outline" onClick={onClose} data-testid="installment-modal-close">
          {de ? 'Schließen' : 'Close'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
