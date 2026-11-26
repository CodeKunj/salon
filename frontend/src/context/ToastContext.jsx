// frontend/src/context/ToastContext.jsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((type, message, durationMs) => {
    const cleanMsg = String(message || '').trim();
    if (!cleanMsg) return null;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timeout = durationMs ?? (type === 'error' ? 6000 : 4000);

    setToasts((prev) => [...prev.slice(-3), { id, type, message: cleanMsg }]);

    if (timeout > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, timeout);
    }

    return id;
  }, []);

  const notifySuccess = useCallback((msg, duration) => pushToast('success', msg, duration), [pushToast]);
  const notifyError = useCallback((msg, duration) => pushToast('error', msg, duration), [pushToast]);
  const notifyInfo = useCallback((msg, duration) => pushToast('info', msg, duration), [pushToast]);

  return (
    <ToastContext.Provider value={{ notifySuccess, notifyError, notifyInfo, dismissToast }}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-[140] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
        >
          {toasts.map((t) => {
            const isError = t.type === 'error';
            const isSuccess = t.type === 'success';
            const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Info;
            return (
              <div
                key={t.id}
                role={isError ? 'alert' : 'status'}
                className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md flex items-start gap-2.5 text-xs ${
                  isError
                    ? 'bg-red-50/95 border-red-200 text-red-900'
                    : isSuccess
                    ? 'bg-[#ECFDF5]/95 border-emerald-200 text-emerald-900'
                    : 'bg-[#FFFDF8]/95 border-[#B4563E]/30 text-[#1A1614]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isError ? 'text-red-600' : isSuccess ? 'text-emerald-600' : 'text-[#B4563E]'
                  }`}
                />
                <span className="flex-1 leading-relaxed font-medium break-words">{t.message}</span>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  className="p-0.5 rounded-md opacity-70 hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

const NOOP_TOAST = {
  notifySuccess: () => {},
  notifyError: () => {},
  notifyInfo: () => {},
  dismissToast: () => {},
};

export function useToast() {
  return useContext(ToastContext) || NOOP_TOAST;
}
