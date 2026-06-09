import { useEffect, useState } from 'react';
import api from './api';

// Cache the providers config in-memory across the SPA session.
let _cache = null;
let _inflight = null;

export const fetchProviders = async () => {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  _inflight = api.get('/auth/providers')
    .then(res => { _cache = res.data; return _cache; })
    .catch(() => ({
      providers: { google: false, apple: false, microsoft: false, magic_link: true },
      google_client_id: '',
      apple_service_id: '',
      microsoft_client_id: '',
      microsoft_tenant: 'common',
    }))
    .finally(() => { _inflight = null; });
  return _inflight;
};

export const useAuthProviders = () => {
  const [data, setData] = useState(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    let cancelled = false;
    fetchProviders().then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
};
