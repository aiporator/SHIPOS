import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import api from '../lib/api';
import logger from '../lib/logger';

const CreditContext = createContext({ balance: 50, isPremium: false, totalUsed: 0, softPause: false, reload: () => {}, dismissPause: () => {} });

export const useCredits = () => useContext(CreditContext);

export const CreditProvider = ({ children }) => {
  const [data, setData] = useState({ balance: 50, isPremium: false, totalUsed: 0, softPause: false });

  const reload = useCallback(async () => {
    try {
      const res = await api.get('/credits');
      setData({
        balance: res.data.balance,
        isPremium: res.data.is_premium,
        totalUsed: res.data.total_used,
        softPause: res.data.soft_pause || false,
      });
    } catch (err) { logger.error('Credit fetch failed:', err); }
  }, []);

  const dismissPause = useCallback(async () => {
    try {
      await api.post('/credits/dismiss-pause');
      setData(prev => ({ ...prev, softPause: false }));
    } catch (err) { logger.error('Dismiss pause failed:', err); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => ({ ...data, reload, dismissPause }), [data, reload, dismissPause]);

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};
