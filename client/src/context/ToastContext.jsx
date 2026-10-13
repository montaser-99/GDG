import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, message, type, leaving: false }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
