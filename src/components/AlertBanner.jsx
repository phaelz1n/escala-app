// src/components/AlertBanner.jsx
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = {
  success: <CheckCircle size={18} className="text-emerald-400" />,
  warning: <AlertTriangle size={18} className="text-amber-400" />,
  error:   <XCircle size={18} className="text-red-400" />,
  info:    <Info size={18} className="text-blue-400" />,
};

const styles = {
  success: 'border-emerald-500/40 bg-emerald-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
  error:   'border-red-500/40 bg-red-500/10',
  info:    'border-blue-500/40 bg-blue-500/10',
};

export default function AlertBanner() {
  const { alerts, dismissAlert } = useApp();

  if (!alerts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {alerts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
            shadow-xl animate-slide-in ${styles[type] || styles.info}
          `}
        >
          <span className="mt-0.5 shrink-0">{icons[type] || icons.info}</span>
          <p className="text-sm text-slate-200 flex-1 leading-snug">{message}</p>
          <button
            onClick={() => dismissAlert(id)}
            className="text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
