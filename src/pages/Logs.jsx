import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Search, Clock } from 'lucide-react';

export default function Logs() {
  const { logs, isAdmin } = useApp();
  const [search, setSearch] = useState('');

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-xl text-red-500">Acesso Negado</h2>
      </div>
    );
  }

  const filteredLogs = useMemo(() => {
    return logs
      .filter(l => {
        const q = search.toLowerCase();
        if (q && !l.action.toLowerCase().includes(q) && !l.user.toLowerCase().includes(q) && !l.details.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Auditoria & Logs</h2>
          <p className="text-slate-400 text-sm mt-1">Histórico completo de ações do sistema</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 max-w-sm">
        <Search size={16} className="text-slate-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por ação, usuário ou detalhes..."
          className="bg-transparent text-slate-200 text-sm outline-none w-full placeholder:text-slate-500"/>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText size={18} className="text-zinc-400"/> Histórico
          </h3>
          <span className="text-slate-400 text-xs">{filteredLogs.length} registro(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Data/Hora','Usuário','Ação','Detalhes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredLogs.map((l) => (
                <tr key={l.id || l.timestamp} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-sm flex items-center gap-1.5">
                      <Clock size={13}/>
                      {new Date(l.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200 text-sm">{l.user}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-zinc-500/20 text-zinc-300 border border-zinc-500/30 rounded-lg text-xs font-medium">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{l.details}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr><td colSpan={4} className="text-center text-slate-500 py-10 text-sm">Nenhum log encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
