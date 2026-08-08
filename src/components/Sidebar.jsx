// src/components/Sidebar.jsx
import { Bus, LayoutDashboard, FileText, Palmtree, Database, Radio, BarChart2, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'dashboard_gerencial', label: 'Dashboard',       icon: BarChart2,      color: 'from-violet-500 to-purple-600' },
  { id: 'escala',              label: 'Escala (Excel)',   icon: LayoutDashboard, color: 'from-blue-500 to-cyan-600' },
  { id: 'atestados',           label: 'Atestados',        icon: FileText,        color: 'from-red-500 to-orange-600' },
  { id: 'ferias',              label: 'Férias',           icon: Palmtree,        color: 'from-emerald-500 to-teal-600' },
  { id: 'motoristas',          label: 'Banco de Dados',   icon: Database,        color: 'from-amber-500 to-yellow-600' },
  { id: 'tokguarda',           label: 'Tok do Guarda',    icon: Radio,           color: 'from-pink-500 to-rose-600' },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const { isFirebaseConfigured, isAdmin } = useApp();

  return (
    <aside className="no-print w-64 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col border-r border-slate-700/50 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bus size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">ScalaOp</h1>
            <p className="text-slate-400 text-xs">Gestão de Motoristas</p>
          </div>
        </div>

        {/* Firebase status */}
        <div className={`mt-3 flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${
          isFirebaseConfigured
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-amber-500/10 text-amber-400'
        }`}>
          {isFirebaseConfigured
            ? <><Wifi size={12} className="animate-pulse" /> Firebase Online</>
            : <><WifiOff size={12} /> Modo Offline</>
          }
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative overflow-hidden
                ${isActive
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/50 rounded-r-full" />
              )}
              <Icon size={17} className={`shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
              <span>{label}</span>
              {id === 'tokguarda' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </button>
          );
        })}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Administração</p>
            <button
              onClick={() => onTabChange('logs')}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative overflow-hidden
                ${activeTab === 'logs'
                  ? `bg-gradient-to-r from-zinc-600 to-zinc-700 text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }
              `}
            >
              <FileText size={17} className={`shrink-0 transition-transform duration-200 ${activeTab !== 'logs' && 'group-hover:scale-110'}`} />
              <span>Auditoria & Logs</span>
            </button>
            <button
              onClick={() => onTabChange('import_excel')}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative overflow-hidden
                ${activeTab === 'import_excel'
                  ? `bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }
              `}
            >
              <Database size={17} className={`shrink-0 transition-transform duration-200 ${activeTab !== 'import_excel' && 'group-hover:scale-110'}`} />
              <span>Importar Excel</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <p className="text-slate-500 text-xs text-center">escala-f2f7f · v2.0</p>
      </div>
    </aside>
  );
}
