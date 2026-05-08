import { useEffect, useRef } from 'react';
import logger from '../lib/logger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        navigate('/login');
        return;
      }

      try {
        const res = await api.post('/auth/google-session', { session_id: sessionId });
        login(res.data.user);
        navigate('/dashboard', { replace: true, state: { user: res.data.user } });
      } catch (err) {
        logger.error('Google auth callback failed:', err);
        navigate('/login');
      }
    };

    processSession();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-[var(--cyan)] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <span className="text-xl font-bold text-black">W</span>
        </div>
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
}
