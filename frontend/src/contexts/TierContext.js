import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import logger from '../lib/logger';
import { useAuth } from './AuthContext';

const TierContext = createContext({
  tier: 'free',
  tierName: 'Free',
  active: true,
  inGracePeriod: false,
  expiresAt: null,
  daysRemaining: null,
  badgeColor: '#64748B',
  installmentInfo: null,
  features: {},
  loading: true,
  refresh: () => {},
});

const DEFAULTS = {
  tier: 'free', tier_name: 'Free', active: true, in_grace_period: false,
  expires_at: null, days_remaining: null, badge_color: '#64748B',
  installment_info: null,
  features: {
    ai_coach: false, video_analysis: false, video_missions: false,
    workflows: false, playbooks: false, one_on_one_calls: 0,
    challenge_30_week1: true, challenge_30_full: false, credits_monthly: 10,
  },
};

export const TierProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setData(DEFAULTS); setLoading(false); return; }
    try {
      const res = await api.get('/user/tier');
      setData(res.data || DEFAULTS);
    } catch (err) {
      logger.error('Tier fetch failed:', err);
      setData(DEFAULTS);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = {
    tier: data.tier,
    tierName: data.tier_name,
    active: data.active,
    inGracePeriod: data.in_grace_period,
    expiresAt: data.expires_at,
    daysRemaining: data.days_remaining,
    badgeColor: data.badge_color,
    installmentInfo: data.installment_info,
    features: data.features || {},
    isFree: data.tier === 'free',
    isStarter: data.tier === 'starter',
    isStandard: data.tier === 'standard',
    isAccelerator: data.tier === 'accelerator',
    isPaid: ['starter', 'standard', 'accelerator'].includes(data.tier),
    hasFeature: (k) => Boolean(data.features?.[k]),
    loading,
    refresh,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
};

export const useTier = () => useContext(TierContext);
