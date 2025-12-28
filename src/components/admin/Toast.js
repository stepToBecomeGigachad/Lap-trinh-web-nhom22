"use client";
import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { ...toast, id }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, toast.duration || 4000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return {
        success: (message, description) => context.addToast({ type: 'success', message, description }),
        error: (message, description) => context.addToast({ type: 'error', message, description }),
        warning: (message, description) => context.addToast({ type: 'warning', message, description }),
        info: (message, description) => context.addToast({ type: 'info', message, description }),
    };
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
};

function Toast({ type = 'info', message, description, onClose }) {
    const Icon = icons[type];

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up ${styles[type]}`}>
            <Icon className={`h-5 w-5 mt-0.5 ${iconStyles[type]}`} />
            <div className="flex-1 min-w-0">
                <p className="font-medium">{message}</p>
                {description && <p className="text-sm opacity-80 mt-0.5">{description}</p>}
            </div>
            <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
