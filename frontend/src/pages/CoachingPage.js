import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LayerCard } from '../components/coaching/LayerCard';
import { FAQItem } from '../components/coaching/FAQItem';
import { PremiumProgram } from '../components/coaching/PremiumProgram';
import { TierPricingGrid } from '../components/coaching/TierPricingGrid';
import { CoachingRightPanel } from '../components/coaching/CoachingRightPanel';
import { CoachingPathCard } from '../components/coaching/CoachingPathCard';
import { getLayers, getCoachingPaths, getFaqs, WLAD_AVATAR } from '../components/coaching/coachingData';
import api from '../lib/api';
import logger from '../lib/logger';
import { openStrategyCall } from '../lib/calendly';
import {
  Users, TrendingUp, Calendar, Sparkles, ExternalLink,
  Award, Phone, Star
} from 'lucide-react';

export default function CoachingPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const de = lang === 'de';
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleStripeCheckout = async (packageId) => {
    setCheckoutLoading(packageId);
    try {
      const endpoint = packageId === 'accelerator_installment_followup'
        ? '/payments/installment/next'
        : '/payments/checkout';
      const res = await api.post(endpoint, { package_id: packageId, origin_url: window.location.origin });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      logger.error('Checkout error:', err);
      alert(de ? 'Checkout fehlgeschlagen. Bitte versuche es erneut.' : 'Checkout failed. Please try again.');
    } finally { setCheckoutLoading(false); }
  };

  // Auto-start installment checkout if ?installment=next query param present (from email link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('installment') === 'next') {
      handleStripeCheckout('accelerator_installment_followup');
      const url = new URL(window.location.href);
      url.searchParams.delete('installment');
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const layers = getLayers(de);
  const coachingPaths = getCoachingPaths(de, navigate, handleStripeCheckout);
  const faqs = getFaqs(de);
  const stats = [
    { icon: Users, value: '2.500+', label: de ? 'Leader gecoacht' : 'Leaders coached' },
    { icon: Star, value: '4.9/5', label: de ? 'Bewertung' : 'Rating' },
    { icon: TrendingUp, value: '87%', label: de ? 'Befoerderungsrate' : 'Promotion rate' },
    { icon: Award, value: '12+', label: de ? 'Jahre Erfahrung' : 'Years experience' },
  ];

  return (
    <DashboardLayout rightPanel={<CoachingRightPanel de={de} onCheckout={handleStripeCheckout} />}>
      <div className="p-8 lg:p-14 max-w-6xl space-y-12" data-testid="coaching-page">

        {/* Hero */}
        <div className="flex flex-col lg:flex-row items-center gap-10 mb-12 lg:mb-16 animate-fade-in">
          <div className="relative shrink-0">
            <img src={WLAD_AVATAR} alt="Wlad Jachtchenko"
              className="w-28 h-28 rounded-2xl object-cover ring-1 ring-white/10" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#BFFF00] flex items-center justify-center">
              <Sparkles size={18} strokeWidth={1.5} className="text-[#0A0A0A]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-[#BFFF00]/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                {de ? 'DEIN COACHING HUB' : 'YOUR COACHING HUB'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
              {de ? 'Dein Coaching ' : 'Your Coaching '}<em className="not-italic text-[#BFFF00]">Hub</em>
            </h1>
            <p className="text-base sm:text-lg text-white/50 mt-6 max-w-xl leading-relaxed font-light">
              {de
                ? 'Drei Wege zum KI-nativen Leader: Leadership OS für Solo-Leader (€997/Jahr), OS PLUS mit 12× 1:1 Coaching durch Argumentorik-Coaches (€4.447/Jahr), oder Enterprise mit bis zu 50% Volume-Discount für Teams.'
                : 'Three paths to AI-native leadership: Leadership OS for solo leaders (€997/year), OS PLUS with 12× 1:1 coaching by Argumentorik coaches (€4,447/year), or Enterprise with up to 50% volume discount for teams.'}
            </p>
          </div>
        </div>

        {/* 3-Layer Model */}
        <div className="animate-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#BFFF00]/60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{de ? 'DAS 3-LAYER-MODELL' : 'THE 3-LAYER MODEL'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layers.map((layer) => <LayerCard key={layer.number} {...layer} />)}
          </div>
        </div>

        {/* Coaching Paths */}
        <div className="animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#BFFF00]/60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{de ? 'DEIN WEG' : 'YOUR PATH'}</span>
          </div>
          <div className="space-y-4">
            {coachingPaths.map((path) => <CoachingPathCard key={path.id} path={path} />)}
          </div>
        </div>

        {/* NEW: 3-Tier Pricing (replaces old PremiumProgram — keeps old for back-compat below) */}
        <TierPricingGrid onCheckout={handleStripeCheckout} checkoutLoading={checkoutLoading} de={de} />

        {/* Booking */}
        <Card className="border border-white/[0.07] bg-white/[0.02] rounded-xl overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors animate-fade-in stagger-5" data-testid="booking-section">
          <CardContent className="p-0">
            <div className="p-6 border-b border-white/[0.06]">
              <h3 className="text-2xl tracking-tight flex items-center gap-3" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                <Calendar size={20} strokeWidth={1.5} className="text-[#BFFF00]" />
                {de ? 'Strategiegespräch buchen' : 'Book Strategy Call'}
              </h3>
              <p className="text-sm text-white/50 mt-2 font-light leading-relaxed">{de ? '15 Minuten. Kostenlos. Unverbindlich.' : '15 minutes. Free. No obligation.'}</p>
            </div>
            <div className="p-10 flex items-center justify-center">
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-[#BFFF00] flex items-center justify-center mx-auto"><Phone size={26} strokeWidth={1.5} className="text-[#0A0A0A]" /></div>
                <p className="text-sm text-white/50 max-w-sm font-light leading-relaxed">{de ? 'Wlads Head Coach analysiert deine aktuelle Situation und zeigt dir, wie du in 90 Tagen messbare Ergebnisse erzielst.' : 'Wlad\'s Head Coach analyzes your situation and shows how to achieve measurable results in 90 days.'}</p>
                <Button className="bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#D4FF4D] font-bold h-11 px-6"
                  onClick={() => openStrategyCall('coaching-page')} data-testid="book-call-btn">
                  <Calendar size={14} strokeWidth={1.5} className="mr-2" />{de ? 'Strategiegespräch buchen' : 'Book Strategy Call'} <ExternalLink size={12} strokeWidth={1.5} className="ml-1.5 opacity-70" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in stagger-5">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-white/[0.07] bg-white/[0.02] rounded-xl hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#BFFF00]/10 border border-[#BFFF00]/20 flex items-center justify-center mx-auto mb-3"><stat.icon size={18} strokeWidth={1.5} className="text-[#BFFF00]" /></div>
                <p className="text-3xl leading-none" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>{stat.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="border border-white/[0.07] bg-white/[0.02] rounded-xl hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors animate-fade-in stagger-6" data-testid="faq-section">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-[#BFFF00]/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{de ? 'HÄUFIGE FRAGEN' : 'FAQ'}</span>
            </div>
            <div>{faqs.map((faq) => <FAQItem key={faq.q} question={faq.q} answer={faq.a} />)}</div>
          </CardContent>
        </Card>

        {/* Support Footer */}
        <div className="text-center py-4 animate-fade-in stagger-6">
          <p className="text-sm text-white/50 font-light">
            {de ? 'Noch Fragen? ' : 'Questions? '}
            <button onClick={() => window.open('mailto:support@leader-os.de')} className="text-[#BFFF00] font-semibold hover:underline" data-testid="support-link">{de ? 'Support kontaktieren' : 'Contact Support'}</button>
            {de ? ' oder schreib uns an ' : ' or email us at '}
            <a href="mailto:support@leader-os.de" className="text-[#BFFF00] font-semibold hover:underline">support@leader-os.de</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
