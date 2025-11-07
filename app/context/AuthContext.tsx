'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

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

  const loadUser = async () => {
    console.log('[AuthContext] loadUser called');
    try {
      const token = Cookies.get('token');
      console.log('[AuthContext] Token from cookie:', token ? 'exists' : 'missing');
      
      if (!token) {
        console.log('[AuthContext] No token, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        // Decode JWT token client-side
        const decoded = jwtDecode<{
          id: string;
          email: string;
          role: string;
          name: string;
        }>(token);
        
        console.log('[AuthContext] Token decoded successfully, user:', decoded.email, 'role:', decoded.role);
        setUser({ ...decoded, token });
        console.log('[AuthContext] User state set');
      } catch (decodeError) {
        console.error('[AuthContext] Error decoding token:', decodeError);
        Cookies.remove('token', { path: '/' });
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error in loadUser:', error);
      Cookies.remove('token', { path: '/' });
      setUser(null);
    } finally {
      console.log('[AuthContext] Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login...');
      
      // Clear any existing cookies and state before login
      Cookies.remove('token', { path: '/' });
      setUser(null);
      
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

      // Store the token in cookie for immediate access
      Cookies.set('token', data.token, { 
        expires: 7,
        path: '/',
        sameSite: 'lax'
      });
      console.log('Token stored in cookie, value:', Cookies.get('token') ? 'exists' : 'missing');

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
      
      // Use window.location for a hard redirect to ensure middleware runs
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear cookie and state first
      Cookies.remove('token', { path: '/' });
      setUser(null);
      
      // Call logout API
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Hard redirect to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, still redirect
      window.location.href = '/';
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
