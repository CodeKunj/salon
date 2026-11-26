// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getPermissions } from '../utils/adminRouter';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aura_auth_token'));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('aura_auth_token')));

  const clearSession = useCallback(() => {
    localStorage.removeItem('aura_auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    api.logout().catch(() => {});
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (!active) return;
          if (res?.data?.user) {
            setUser(res.data.user);
          } else {
            clearSession();
          }
        } catch {
          if (!active) return;
          clearSession();
        }
      }
      if (active) setLoading(false);
    };
    checkAuth();
    return () => {
      active = false;
    };
  }, [token, clearSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };
    window.addEventListener('aura:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('aura:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res?.data?.token) {
      localStorage.setItem('aura_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Login response missing token');
  };

  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  }, [user]);

  const permissions = getPermissions(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        hasRole,
        permissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
