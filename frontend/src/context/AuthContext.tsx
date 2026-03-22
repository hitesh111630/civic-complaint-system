import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthCtx {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('civic_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('civic_token'));

  const persist = (t: string, u: User) => {
    setToken(t); setUser(u);
    localStorage.setItem('civic_token', t);
    localStorage.setItem('civic_user', JSON.stringify(u));
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    persist(data.access_token, data.user);
  }, []);

  const register = useCallback(async (formData: object) => {
    const { data } = await authAPI.register(formData);
    persist(data.access_token, data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null); setUser(null);
    localStorage.removeItem('civic_token');
    localStorage.removeItem('civic_user');
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.me();
    setUser(data);
    localStorage.setItem('civic_user', JSON.stringify(data));
  }, []);

  return (
    <Ctx.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
