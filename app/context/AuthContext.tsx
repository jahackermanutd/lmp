'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const fetchCurrentUser = async () => {
    const meResponse = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (meResponse.ok) {
      const data = await meResponse.json();
      setUser(data.user);
      return true;
    }

    if (meResponse.status === 401) {
      const refreshResponse = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });

      if (refreshResponse.ok) {
        const retryResponse = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          setUser(data.user);
          return true;
        }
      }
    }

    setUser(null);
    return false;
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      await fetchCurrentUser();
    } catch (error) {
      console.error('[AuthContext] Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login...');

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);

      // Determine redirect URL based on role
      let redirectUrl = '/';
      switch (data.user.role) {
        case 'admin':
          redirectUrl = '/admin';
          break;
        case 'office-manager':
          redirectUrl = '/office-manager';
          break;
        case 'seo':
          redirectUrl = '/seo';
          break;
      }

      console.log('Redirecting to:', redirectUrl);
      router.replace(redirectUrl);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser }}>
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
