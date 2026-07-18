import { useEffect, useMemo, useState } from 'react';
import { request, setApiToken } from '../api/client.js';
import { AuthContext } from './authContext.js';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const payload = await request('/api/auth/login', { method: 'POST', body: { email, password } });

    setUser(payload.data.user);
    setAccessToken(payload.data.accessToken);
    return payload.data;
  };

  const register = async (name, email, password, role = 'client-viewer') => {
    const payload = await request('/api/auth/register', { method: 'POST', body: { name, email, password, role } });

    setUser(payload.data.user);
    setAccessToken(payload.data.accessToken);
    return payload.data;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const payload = await request('/api/auth/refresh', { method: 'POST' });
        if (!payload.data?.accessToken) {
          setUser(null);
          setAccessToken(null);
          return;
        }

        setAccessToken(payload.data.accessToken);
        setUser(payload.data.user || null);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(() => ({ user, accessToken, loading, login, register, logout }), [user, accessToken, loading]);

  useEffect(() => {
    setApiToken(accessToken);
    return () => setApiToken(null);
  }, [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

