import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('suraksha_token'));
  const [loading, setLoading] = useState(true);

  const saveSession = (tkn, usr) => {
    localStorage.setItem('suraksha_token', tkn);
    localStorage.setItem('suraksha_user', JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem('suraksha_token');
    localStorage.removeItem('suraksha_user');
    setToken(null);
    setUser(null);
  }, []);

  // Rehydrate from localStorage
  useEffect(() => {
    const init = async () => {
      const cached = localStorage.getItem('suraksha_user');
      if (cached) setUser(JSON.parse(cached));

      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          localStorage.setItem('suraksha_user', JSON.stringify(data.user));
        } catch {
          clearSession();
        }
      }
      setLoading(false);
    };
    init();
  }, [token, clearSession]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = () => clearSession();

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('suraksha_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
