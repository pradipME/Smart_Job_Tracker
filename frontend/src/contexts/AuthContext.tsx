import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const VALID_ROLES: UserRole[] = ['ADMIN', 'CANDIDATE'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isValidJwt(token: string): boolean {
  if (!token || token.length < 10) return false;
  const parts = token.split('.');
  return parts.length === 3;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('token');
    if (stored && isValidJwt(stored)) return stored;
    localStorage.removeItem('token');
    return null;
  });

  const [role, setRole] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem('role');
    if (stored && VALID_ROLES.includes(stored as UserRole)) return stored as UserRole;
    localStorage.removeItem('role');
    return null;
  });

  const isAuthenticated = !!token && !!role;

  const login = useCallback((newToken: string, newRole: UserRole) => {
    const clean = newToken.replace(/^Bearer\s+/i, '').trim();
    if (!isValidJwt(clean)) {
      console.error('Attempted to store invalid JWT');
      return;
    }
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
        if (!e.newValue || !isValidJwt(e.newValue)) {
          setToken(null);
          localStorage.removeItem('token');
        } else {
          setToken(e.newValue);
        }
      }
      if (e.key === 'role') {
        if (!e.newValue || !VALID_ROLES.includes(e.newValue as UserRole)) {
          setRole(null);
          localStorage.removeItem('role');
        } else {
          setRole(e.newValue as UserRole);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
