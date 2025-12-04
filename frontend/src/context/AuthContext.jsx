import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();
const STORAGE_KEY = 'tutor_support_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function initAuth() {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed.user);
          setToken(parsed.token);
          setAuthToken(parsed.token);
          setLoading(false);
          return;
        } catch (err) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      try {
        const res = await api.post('/auth/refresh');
        const { token: jwt, user: refreshedUser } = res.data.data;
        setUser(refreshedUser);
        setToken(jwt);
        setAuthToken(jwt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: jwt, user: refreshedUser }));
      } catch (err) {
        // no refresh token or invalid
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (username, password) => {
    setError('');
    const res = await api.post('/auth/login', { username, password });
    const { token: jwt, user: loggedUser } = res.data.data;
    setUser(loggedUser);
    setToken(jwt);
    setAuthToken(jwt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: jwt, user: loggedUser }));
    return loggedUser;
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, token, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
