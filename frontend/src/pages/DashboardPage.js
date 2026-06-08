import { useEffect, useState, useCallback } from 'react';
import logger from '../lib/logger';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { OnboardingTour } from '../components/shared/OnboardingTour';
import { AnimatedNumber } from '../components/dashboard/AnimatedNumber';
import { StatCardsRow, QuickActionsGrid } from '../components/dashboard/StatCards';
import { WladHubDiagnosisCard } from '../components/dashboard/WladHubCard';
import { EventReminderBanner } from '../components/dashboard/EventReminder';
import { WladMotivationCard } from '../components/dashboard/WladMotivationCard';
import { FolderWorkspaceCards } from '../components/dashboard/FolderWorkspaceCards';
import api from '../lib/api';
import { useCredits } from '../contexts/CreditContext';
import { WeekCalendarCard } from '../components/dashboard/WeekCalendarCard';
import { TierBadge } from '../components/shared/TierBadge';
import { useTier } from '../contexts/TierContext';
import {
  Zap, ArrowRight, Flame, ChevronRight,
  MessageSquareText, Sparkles, CheckCircle2, Star, Gift,
  Share2, Copy, Play, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePricing } from '../contexts/PricingContext';
import { toast } from 'sonner';

const WLAD_AVATAR = 'https://customer-assets.emergentagent.com/job_dd3457c0-3be5-4c4c-bc34-5b0e823b9278/artifacts/4knvn6cs_WladProfilbild.jpg';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { open: openPricing } = usePricing();
  const de = lang === 'de';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { balance, isPremium } = useCredits();

  const loadDashboard = useCallback(async () => {
    try {
      const [dashRes, refRes] = await Promise.all([
        api.get('/dashboard-v4').catch(() => api.get('/dashboard')),
        api.get('/referral/code').catch(() => ({ data: {} })),
      ]);
      setData(dashRes.data);
      setReferralCode(refRes.data?.code || '');
    } catch (err) { logger.error('Dashboard load error:', err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('wladbot_onboarding_done')) setShowOnboarding(true);
    loadDashboard();
  }, [loadDashboard]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return de ? 'Guten Morgen' : 'Good Morning';
    if (h < 17) return de ? 'Guten Tag' : 'Good Afternoon';
    return de ? 'Guten Abend' : 'Good Evening';
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://leader-check.de?ref=${referralCode}`);
    toast.success(de ? 'Referral-Link kopiert!' : 'Referral link copied!');
  };

  const ud = data?.user || user || {};
  const tierInfo = useTier();
  const xpInfo = data?.xp_info || {};
  const ls = data?.leader_score || {};
  const streak = data?.streak || { days: 0 };
  const c30 = data?.challenge30 || {};
  const xpCurrent = xpInfo.xp ?? ud.xp ?? 0;
  const levelName = xpInfo.level || ud.level || 'Teamplayer';
  const levelLabel = de ? (xpInfo.level_label_de || 'Grundlagen entdecken') : (xpInfo.level_label_en || 'Discovering fundamentals');
  const levelIndex = xpInfo.level_index ?? 0;
  const levelProgress = xpInfo.progress_pct ?? 0;
  const nextLevel = xpInfo.next_level;
  const xpToNext = xpInfo.xp_to_next || 0;
  const aiReadiness = ls.composite || 0;
  const learningPct = c30.progress_pct || 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 lg:p-14 max-w-6xl mx-auto" data-testid="dashboard-loading">
          <div className="space-y-4">{[1,2,3,4].map(i => <div key={`sk-${i}`} className="h-28 rounded-xl skeleton-pulse" />)}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 lg:p-14 max-w-6xl mx-auto min-h-screen cascade premium-bg" data-testid="dashboard-page">
        {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}

        {/* ── Greeting ── */}
        <div className="flex items-end justify-between mb-12 lg:mb-16 gap-6" data-anim="dash-header">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-[#BFFF00]/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {de ? 'WILLKOMMEN ZURÜCK' : 'WELCOME BACK'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
              {getGreeting()}, <em className="not-italic text-brand">{ud.name || 'Leader'}</em>
            </h1>
            <div className="flex items-center gap-2 mt-6">
              <TierBadge size="sm" />
              {tierInfo?.inGracePeriod && (
                <button onClick={() => openPricing('leadership_os_plus')} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 hover:bg-rose-500/25 transition-colors" data-testid="grace-badge">
                  {de ? 'Jetzt verlängern' : 'Renew now'}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/chat')} className="font-semibold text-xs h-9 gap-1.5" data-testid="talk-coach-btn">
              <MessageSquareText size={14} strokeWidth={1.5} /> {de ? 'KI-Coach' : 'AI Coach'}
            </Button>
            {!isPremium && balance >= 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card" data-testid="credit-badge">
                <Zap size={12} strokeWidth={1.5} className="text-brand" />
                <span className="text-[11px] font-bold">{balance}</span>
                <span className="text-[10px] text-muted-foreground">Credits</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#BFFF00]/20 bg-[#BFFF00]/[0.06]" data-testid="streak-bar">
              <Flame size={13} strokeWidth={1.5} className="text-brand" />
              <span className="text-[12px] font-bold"><AnimatedNumber value={streak?.days || 0} duration={500} /></span>
              <span className="text-[10px] text-muted-foreground font-medium">{de ? 'Tage' : 'days'}</span>
            </div>
          </div>
        </div>

        {/* ── Event Reminder ── */}
        <EventReminderBanner de={de} />

        {/* Wlad's Daily Motivation — click to hear Wlad speak via ElevenLabs */}
        <div className="mb-5">
          <WladMotivationCard de={de} />
        </div>

        {/* ── Stat Cards Row ── */}
        <StatCardsRow aiReadiness={aiReadiness} learningPct={learningPct} c30={c30} de={de} />

        {/* ── YOUR NEXT STEP (DOMINANT) ── */}
        <Card className="surface-card card-lift mb-8 overflow-hidden" data-testid="next-step-cta" data-anim="dash-cta">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <img src={WLAD_AVATAR} alt="Wlad" className="w-14 h-14 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                  {de ? 'Dein nächster Schritt' : 'Your Next Step'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-light leading-relaxed">
                  {!c30.started
                    ? (de ? 'Starte deinen 30-Tage KI-Leadership Sprint und lerne die Grundlagen.' : 'Start your 30-day AI Leadership sprint and learn the fundamentals.')
                    : (de ? `Mache weiter mit Tag ${c30.current_day} deiner Challenge — 10 interaktive Fragen warten.` : `Continue with Day ${c30.current_day} of your challenge — 10 interactive questions await.`)
                  }
                </p>
              </div>
              <Button onClick={() => navigate('/challenge')} className="bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#D4FF4D] font-bold h-11 px-5 shrink-0" data-testid="next-step-btn">
                <Play size={14} strokeWidth={1.5} className="mr-1.5" /> {!c30.started ? (de ? 'Challenge starten' : 'Start Challenge') : (de ? 'Weitermachen' : 'Continue')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Workspaces ── briefing + open for each folder the user has built. */}
        <div className="mb-8" data-anim="dash-widget">
          <FolderWorkspaceCards de={de} />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Actions + Quick Access */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Actions */}
            <QuickActionsGrid de={de} navigate={navigate} />

            {/* XP + Level Progress */}
            <Card className="surface-card overflow-hidden" data-testid="level-progress" data-anim="dash-widget">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-[#BFFF00]/60" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{de ? 'DEIN LEADERSHIP-LEVEL' : 'YOUR LEADERSHIP LEVEL'}</h3>
                  </div>
                  <Badge className="text-[10px] font-bold bg-[#BFFF00]/15 text-brand border-0">
                    LVL {levelIndex + 1} / 5
                  </Badge>
                </div>

                {/* Level name + descriptive label */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-[#BFFF00] flex items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-[#0A0A0A]">{levelIndex + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl tracking-tight truncate" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>{levelName}</p>
                    <p className="text-[12px] text-muted-foreground font-light truncate mt-0.5">{levelLabel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl leading-none" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}><AnimatedNumber value={xpCurrent} /></p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-[0.15em]">XP</p>
                  </div>
                </div>

                {/* Progress to next */}
                <div className="space-y-2">
                  <div className="h-1.5 rounded-full bg-foreground/[0.08] overflow-hidden">
                    <div className="h-full rounded-full bg-[#BFFF00] transition-all duration-1000"
                      style={{ width: `${Math.min(100, levelProgress)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-muted-foreground">{levelProgress}% {de ? 'zum nächsten Level' : 'to next level'}</span>
                    {nextLevel ? (
                      <span className="text-brand">
                        {xpToNext > 0 ? `${xpToNext} XP → ${nextLevel}` : nextLevel}
                      </span>
                    ) : (
                      <span className="text-brand">{de ? 'MAX LEVEL' : 'MAX LEVEL'}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upsell Banner */}
            <Card className="surface-card gradient-border-anim overflow-hidden" data-testid="upsell-banner" data-anim="dash-widget">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#BFFF00]/10 border border-[#BFFF00]/20 flex items-center justify-center shrink-0">
                    <Sparkles size={20} strokeWidth={1.5} className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                      {de ? 'Schalte dein volles KI-Potenzial frei' : 'Unlock your full AI potential'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-light leading-relaxed">{de ? 'Alle 16 Missionen, 10 Workflows und persönliches Coaching.' : 'All 16 missions, 10 workflows and personal coaching.'}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-2 font-light">{de ? '500+ Leader haben ihre Arbeitsweise transformiert' : '500+ leaders have transformed how they work'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button onClick={() => openPricing('leadership_os')} className="bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#D4FF4D] font-bold text-xs h-9 px-4 btn-revolut" data-testid="dashboard-upgrade-btn">
                      {de ? 'Direkt kaufen' : 'Buy Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8">

            {/* This Week Calendar */}
            <WeekCalendarCard de={de} onNavigate={navigate} />

            {/* Referral Card */}
            <Card className="surface-card card-lift" data-testid="referral-upsell-card" data-anim="dash-widget">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#BFFF00]/10 border border-[#BFFF00]/20 flex items-center justify-center"><Gift size={14} strokeWidth={1.5} className="text-brand" /></div>
                  <div>
                    <p className="text-sm font-semibold">{de ? 'Freunde einladen' : 'Invite friends'}</p>
                    <p className="text-[10px] text-muted-foreground font-light">{de ? 'Verdiene Rewards' : 'Earn rewards'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/referral')} size="sm" className="flex-1 bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#D4FF4D] text-[10px] font-bold h-8" data-testid="referral-share-btn">
                    <Share2 size={10} strokeWidth={1.5} className="mr-1" /> TEILEN
                  </Button>
                  {referralCode && (
                    <Button onClick={copyReferral} size="sm" variant="outline" className="border-border text-foreground hover:bg-foreground/5 text-[10px] h-8" data-testid="referral-copy-btn">
                      <Copy size={10} strokeWidth={1.5} className="mr-1" /> {referralCode}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* WladHub Diagnosis */}
            <WladHubDiagnosisCard wladhubScores={ud.wladhub_scores} de={de} onNavigate={navigate} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
