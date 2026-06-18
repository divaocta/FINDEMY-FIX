import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--warning)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--accent-primary)" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <span className="toast-icon">{getIcon(toast.type)}</span>
            <p className="toast-message">{toast.message}</p>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 380px;
          width: calc(100% - 40px);
        }

        .toast-card {
          background: #ffffff;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .toast-card::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 3px;
          width: 100%;
          transform-origin: left;
          animation: shrinkProgress 4s linear forwards;
        }

        .toast-success::after { background-color: var(--success); }
        .toast-error::after { background-color: var(--danger); }
        .toast-warning::after { background-color: var(--warning); }
        .toast-info::after { background-color: var(--accent-primary); }

        .toast-card.toast-success { border-left: 4px solid var(--success); }
        .toast-card.toast-error { border-left: 4px solid var(--danger); }
        .toast-card.toast-warning { border-left: 4px solid var(--warning); }
        .toast-card.toast-info { border-left: 4px solid var(--accent-primary); }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-message {
          color: #334155;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.4;
          flex-grow: 1;
        }

        .toast-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .toast-close-btn:hover {
          color: #334155;
          background-color: rgba(0, 0, 0, 0.05);
        }

        @keyframes shrinkProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
