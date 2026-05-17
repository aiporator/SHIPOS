import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as Sentry from '@sentry/react';
import api from '../lib/api';
import logger from '../lib/logger';
import { identifyByEmail, resetIdentity } from '../lib/analytics';

const setSentryUser = (email) => {
  if (!email) return Sentry.setUser(null);
  Sentry.setUser({ email: String(email).trim().toLowerCase() });
};

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setNetworkError(false);
      sessionStorage.setItem('wladbot_user', JSON.stringify(res.data));
      identifyByEmail(res.data?.email);
      setSentryUser(res.data?.email);
    } catch (err) {
      // Network error (backend unreachable, CORS blocked, offline) ≠ unauthorized.
      // Don't clear cached user on network errors — let them keep browsing cached state.
      if (!err?.response) {
        logger.warn('Network error during auth check — assuming offline, keeping cached user');
        setNetworkError(true);
      } else {
        logger.info('Auth check: no valid session');
        sessionStorage.removeItem('wladbot_user');
        setUser(null);
        setNetworkError(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    // Show cached user immediately while verifying in background
    const storedUser = sessionStorage.getItem('wladbot_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } catch {
        sessionStorage.removeItem('wladbot_user');
      }
    }
    checkAuth();
  }, [checkAuth]);

  // Listen for global network errors → surface reachability banner
  useEffect(() => {
    const handler = () => setNetworkError(true);
    window.addEventListener('wladbot:network-error', handler);
    return () => window.removeEventListener('wladbot:network-error', handler);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    setNetworkError(false);
    sessionStorage.setItem('wladbot_user', JSON.stringify(userData));
    identifyByEmail(userData?.email);
    setSentryUser(userData?.email);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (err) {
      logger.error('Logout request failed:', err?.message || err);
    }
    sessionStorage.removeItem('wladbot_user');
    setUser(null);
    resetIdentity();
    setSentryUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, networkError, login, logout, setUser, checkAuth }),
    [user, loading, networkError, login, logout, checkAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
