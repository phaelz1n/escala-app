// src/components/PrintButton.jsx
import { Printer } from 'lucide-react';

export default function PrintButton({ label = 'Imprimir Relatório', className = '' }) {
  return (
    <button
      onClick={() => window.print()}
      className={`no-print flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors border border-slate-600 ${className}`}
    >
      <Printer size={16} />
      {label}
    </button>
  );
}
