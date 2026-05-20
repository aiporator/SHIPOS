import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as Sentry from '@sentry/react';
import api from '../lib/api';
import logger from '../lib/logger';
import { identifyByUser, resetIdentity } from '../lib/analytics';
import { rememberLogin, forgetAllLogins } from '../lib/recentLogins';

/**
 * Identify the current user in Sentry using the canonical MongoDB user_id.
 * Sentry's User object accepts `id` as the primary identifier; email/name
 * are searchable properties. This keeps error grouping stable across email
 * changes and OAuth provider re-links.
 */
const setSentryUser = (user) => {
  if (!user || !user.user_id) return Sentry.setUser(null);
  Sentry.setUser({
    id: user.user_id,
    email: user.email ? String(user.email).trim().toLowerCase() : undefined,
    username: user.name || undefined,
  });
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
      identifyByUser(res.data);
      setSentryUser(res.data);
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

  const login = useCallback((userData, method = 'email') => {
    setUser(userData);
    setNetworkError(false);
    sessionStorage.setItem('wladbot_user', JSON.stringify(userData));
    rememberLogin(userData, method);
    identifyByUser(userData);
    setSentryUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (err) {
      logger.error('Logout request failed:', err?.message || err);
    }
    sessionStorage.removeItem('wladbot_user');
    // NOTE: We do NOT call forgetAllLogins() on a normal logout — the user
    // likely wants "Continue as me" on next visit. Only clear on explicit
    // "Forget all accounts" action from the security tab.
    setUser(null);
    resetIdentity();
    setSentryUser(null);
  }, []);

  const forgetAllAccounts = useCallback(() => {
    forgetAllLogins();
  }, []);

  const value = useMemo(
    () => ({ user, loading, networkError, login, logout, setUser, checkAuth, forgetAllAccounts }),
    [user, loading, networkError, login, logout, checkAuth, forgetAllAccounts]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
