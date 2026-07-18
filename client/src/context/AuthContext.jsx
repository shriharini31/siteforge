import { useEffect, useMemo, useState } from 'react';
import { apiUrl, setApiToken } from '../api/client.js';
import { AuthContext } from './authContext.js';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Login failed');

    setUser(payload.data.user);
    setAccessToken(payload.data.accessToken);
    return payload.data;
  };

  const register = async (name, email, password, role = 'client-viewer') => {
    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Registration failed');

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
        const response = await fetch(apiUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        });

        const payload = await response.json();
        if (!response.ok || !payload.data?.accessToken) {
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

