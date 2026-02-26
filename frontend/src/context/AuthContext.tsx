"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  division_id?: number | null;
  division?: { id: number; name: string; code: string };
  roles: { name: string; display_name?: string }[];
  permissions: { name: string }[];
  signature_path?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get('/me');
          setUser(res.data);
        } catch (err) {
          window.localStorage.removeItem('auth_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    const { access_token, user } = res.data;
    window.localStorage.setItem('auth_token', access_token);
    setToken(access_token);
    setUser(user);
    router.push('/dashboard');
  };

  const logout = () => {
    api.post('/logout').finally(() => {
      window.localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      router.push('/login');
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
