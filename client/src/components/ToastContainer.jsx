import { useToast } from '../context/ToastContext';

const TOAST_ICONS = {
  info: 'fa-circle-info text-gdg-blue',
  success: 'fa-circle-check text-emerald-400',
  error: 'fa-circle-exclamation text-gdg-red',
  warning: 'fa-triangle-exclamation text-gdg-yellow',
};

const TOAST_BORDERS = {
  info: 'border-slate-700',
  success: 'border-emerald-500/40',
  error: 'border-red-500/40',
  warning: 'border-yellow-500/40',
};

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div id="toast-container" className="fixed bottom-5 left-5 z-[60] flex flex-col gap-2 no-print">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-slate-800/95 text-white border ${TOAST_BORDERS[toast.type]} px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 backdrop-blur-md z-50 ${
            toast.leaving ? 'opacity-0 translate-y-2.5' : 'opacity-100 translate-y-0'
          }`}
        >
          <i className={`fa-solid ${TOAST_ICONS[toast.type]} text-base shrink-0`}></i>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
