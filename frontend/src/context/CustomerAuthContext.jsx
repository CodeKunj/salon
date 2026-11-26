// frontend/src/context/CustomerAuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customerUser, setCustomerUser] = useState(null);
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('ritiverse_customer_token'));
  const [customerLoading, setCustomerLoading] = useState(true);

  const clearCustomerSession = useCallback(() => {
    localStorage.removeItem('ritiverse_customer_token');
    setCustomerToken(null);
    setCustomerUser(null);
  }, []);

  const customerLogout = useCallback(() => {
    clearCustomerSession();
  }, [clearCustomerSession]);

  const refreshCustomerProfile = useCallback(async () => {
    if (!customerToken) return null;
    const res = await api.customerGetMe();
    if (res?.data?.user) {
      setCustomerUser(res.data.user);
      return res.data.user;
    }
    return null;
  }, [customerToken]);

  useEffect(() => {
    let active = true;
    const verifyCustomer = async () => {
      if (customerToken) {
        try {
          const res = await api.customerGetMe();
          if (!active) return;
          if (res?.data?.user) {
            setCustomerUser(res.data.user);
          } else {
            clearCustomerSession();
          }
        } catch {
          if (!active) return;
          clearCustomerSession();
        }
      }
      if (active) setCustomerLoading(false);
    };
    verifyCustomer();
    return () => {
      active = false;
    };
  }, [customerToken, clearCustomerSession]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearCustomerSession();
    };
    window.addEventListener('ritiverse:customer-unauthorized', onUnauthorized);
    return () => window.removeEventListener('ritiverse:customer-unauthorized', onUnauthorized);
  }, [clearCustomerSession]);

  const customerLogin = async (email, password) => {
    const res = await api.customerLogin(email, password);
    if (res?.data?.token) {
      localStorage.setItem('ritiverse_customer_token', res.data.token);
      setCustomerToken(res.data.token);
      setCustomerUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Sign in failed: missing session token');
  };

  const customerRegister = async (payload) => {
    const res = await api.customerRegister(payload);
    if (res?.data?.token) {
      localStorage.setItem('ritiverse_customer_token', res.data.token);
      setCustomerToken(res.data.token);
      setCustomerUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Registration failed: missing session token');
  };

  const customerUpdateProfile = async (payload) => {
    const res = await api.customerUpdateProfile(payload);
    if (res?.data?.user) {
      setCustomerUser(res.data.user);
      return res.data.user;
    }
    return null;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        customerToken,
        isCustomerAuthenticated: !!customerUser,
        customerLoading,
        customerLogin,
        customerRegister,
        customerLogout,
        customerUpdateProfile,
        refreshCustomerProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
};
