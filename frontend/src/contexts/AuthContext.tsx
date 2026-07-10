import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem('role') as UserRole | null);

  const isAuthenticated = !!token;

  const login = useCallback((newToken: string, newRole: UserRole) => {
    const clean = newToken.replace(/^Bearer\s+/i, '').trim();
    localStorage.setItem('token', clean);
    localStorage.setItem('role', newRole);
    setToken(clean);
    setRole(newRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          setToken(null);
        } else if (e.newValue !== token) {
          setToken(e.newValue);
        }
      }
      if (e.key === 'role') {
        if (!e.newValue) {
          setRole(null);
        } else if (e.newValue !== role) {
          setRole(e.newValue as UserRole);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, role]);

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
