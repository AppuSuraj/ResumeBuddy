import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, action?: ToastAction) => void;
  success: (title: string, message?: string, action?: ToastAction) => void;
  error: (title: string, message?: string, action?: ToastAction) => void;
  info: (title: string, message?: string, action?: ToastAction) => void;
  warning: (title: string, message?: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, action?: ToastAction) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { id, type, title, message, action };
    
    setToasts((prev) => [...prev.slice(-3), newToast]); // Keep maximum 4 toasts visible

    const duration = action ? 5500 : 3500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string, action?: ToastAction) => showToast('success', title, message, action), [showToast]);
  const error = useCallback((title: string, message?: string, action?: ToastAction) => showToast('error', title, message, action), [showToast]);
  const info = useCallback((title: string, message?: string, action?: ToastAction) => showToast('info', title, message, action), [showToast]);
  const warning = useCallback((title: string, message?: string, action?: ToastAction) => showToast('warning', title, message, action), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-200'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/40 text-rose-200'
                  : isWarning
                  ? 'bg-slate-900/95 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900/95 border-blue-500/40 text-blue-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isError && <XCircle className="w-4 h-4 text-rose-400" />}
                {isWarning && <AlertCircle className="w-4 h-4 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-white leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
                )}
                {toast.action && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition cursor-pointer"
                    >
                      <span>{toast.action.label}</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
