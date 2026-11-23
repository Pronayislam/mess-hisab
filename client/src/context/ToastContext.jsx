import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setToasts((list) => {
        const now = Date.now();
        const next = list.filter((t) => now - t.createdAt < t.ttl);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const add = useCallback((toast) => {
    const id = nextId++;
    const entry = {
      id,
      createdAt: Date.now(),
      ttl: toast.ttl ?? 4000,
      variant: toast.variant ?? "success",
      title: toast.title,
      message: toast.message,
      ...toast,
    };
    setToasts((list) => [entry, ...list]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <ToastList toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function ToastList({ toasts, onRemove }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const isError = toast.variant === "error";
  const icon = isError ? "⚠" : "✓";

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-soft text-slate-900 font-medium min-w-[300px] animate-[slideUp_0.3s_ease-out] ${
        isError
          ? "border-red-200 text-red-700 bg-red-50"
          : "border-brand-200 text-brand-700 bg-brand-50"
      }`}
    >
      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isError ? "bg-red-100" : "bg-brand-100"} text-xs font-bold`}>
        {icon}
      </div>
      <div className="flex-1">
        {toast.title && (
          <div className="text-sm font-semibold leading-tight">{toast.title}</div>
        )}
        {toast.message && (
          <div className={`text-xs ${isError ? "text-red-600" : "text-brand-600"} leading-relaxed mt-0.5`}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}