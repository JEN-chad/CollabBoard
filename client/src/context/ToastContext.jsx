import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300',
          iconColor: 'text-emerald-400',
          icon: CheckCircle2,
          title: 'Success',
        };
      case 'error':
        return {
          bg: 'bg-red-950/20 border-red-500/30 text-red-300',
          iconColor: 'text-red-400',
          icon: AlertCircle,
          title: 'Error',
        };
      case 'warning':
      case 'conflict':
        return {
          bg: 'bg-amber-950/20 border-amber-500/30 text-amber-300',
          iconColor: 'text-amber-400',
          icon: AlertTriangle,
          title: type === 'conflict' ? 'Conflict Detected' : 'Warning',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-950/20 border-blue-500/30 text-blue-300',
          iconColor: 'text-blue-400',
          icon: Info,
          title: 'Notification',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          const Icon = styles.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full rounded-xl border backdrop-blur-md p-4 shadow-2xl flex items-start gap-3 transition-all duration-350 transform translate-y-0 scale-100 animate-slide-in ${styles.bg}`}
              role="alert"
            >
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
              <div className="flex-1">
                <h5 className="font-bold text-sm leading-none text-white opacity-95">{styles.title}</h5>
                <p className="text-xs mt-1.5 leading-relaxed opacity-85 font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
