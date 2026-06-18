import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { getPremiumFeatures } from './coachingData';

export const PremiumProgram = ({ de, checkoutLoading, onCheckout }) => {
  const features = getPremiumFeatures(de);
  return (
    <div className="animate-fade-in stagger-4">
      <Card className="overflow-hidden border-[#BFFF00]/20/50 dark:border-[#BFFF00]/15 relative" data-testid="premium-program-card">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] text-[10px] font-bold px-4 py-2 rounded-bl-xl">
          {de ? 'BELIEBTESTE WAHL' : 'MOST POPULAR'}
        </div>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <Badge className="bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] border-0 text-[10px] font-bold px-3 py-1 mb-3">
                {de ? '12-WOCHEN-PROGRAMM' : '12-WEEK PROGRAM'}
              </Badge>
              <h2 className="text-2xl font-black mb-2">
                {de ? 'Premium Leadership Programm' : 'Premium Leadership Program'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {de ? 'Die komplette Transformation: Von der Führungskraft zur unverzichtbaren Schlüsselperson. Mit persönlicher Begleitung von Wlad.' : 'Complete transformation: From manager to indispensable key person. With personal guidance from Wlad.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-64 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-[#BFFF00]/[0.06] to-[#BFFF00]/[0.04] dark:from-[#BFFF00]/[0.04] dark:to-[#BFFF00]/[0.03] border border-[#BFFF00]/20 dark:border-[#BFFF00]/10">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black gradient-text">6.970</span>
                <span className="text-lg text-muted-foreground font-bold">EUR</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{de ? 'Einmalige Investition' : 'One-time investment'}</p>
              <Button className="w-full bg-gradient-to-r from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A] font-bold h-12 shadow-xl shadow-[#BFFF00]/15"
                onClick={() => onCheckout('fast_track')} disabled={checkoutLoading} data-testid="apply-premium-btn">
                {checkoutLoading ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> {de ? 'Wird geladen...' : 'Loading...'}</> : <>{de ? 'Jetzt kaufen' : 'Buy Now'} <ArrowRight size={14} className="ml-1.5" /></>}
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">{de ? 'Sichere Zahlung via Stripe' : 'Secure payment via Stripe'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
