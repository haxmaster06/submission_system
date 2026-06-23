"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { updateEchoAuth } from '@/lib/echo';

interface User {
  id: number;
  name: string;
  email: string;
  division_id?: number | null;
  division?: { id: number; name: string; code: string };
  roles: { name: string; display_name?: string }[];
  permissions: { name: string }[];
  signature_path?: string;
  is_simulating?: boolean;
  simulated_role?: string;
  original_role?: string;
  simulated_division?: { id: number; name: string; code?: string };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  activateSimulation: (roleName: string, divisionId?: number) => Promise<void>;
  deactivateSimulation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get('/me');
          setUser(res.data);
          updateEchoAuth(storedToken);
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
    updateEchoAuth(access_token);
    router.push('/dashboard');
  };

  const logout = () => {
    api.post('/logout').finally(() => {
      window.localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      updateEchoAuth('');
      router.push('/login');
    });
  };

  const activateSimulation = async (roleName: string, divisionId?: number) => {
    try {
      await api.post('/simulation/activate', {
        role_name: roleName,
        division_id: divisionId || null,
      });
      await refreshUser();
    } catch (err: any) {
      console.error('Simulation activation failed', err);
      throw err;
    }
  };

  const deactivateSimulation = async () => {
    try {
      await api.post('/simulation/deactivate');
      await refreshUser();
    } catch (err: any) {
      console.error('Simulation deactivation failed', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout, isAuthenticated: !!user,
      refreshUser, activateSimulation, deactivateSimulation
    }}>
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
