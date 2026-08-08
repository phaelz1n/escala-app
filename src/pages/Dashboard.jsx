// src/pages/Dashboard.jsx
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users, Bus, AlertTriangle, CheckCircle, Clock,
  Radio, TrendingUp, BarChart2, Search, Filter,
} from 'lucide-react';

const statusColors = {
  'Escalado':          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Descoberto':        'bg-red-500/20 text-red-300 border-red-500/30',
  'Substituído':       'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Férias/Substituído':'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const pontoColors = {
  'Linha':   'bg-amber-500/20 text-amber-300',
  'Garagem': 'bg-slate-500/20 text-slate-300',
};

const turnoColors = {
  'Madrugada': 'text-indigo-400',
  'Manhã':     'text-amber-400',
  'Tarde':     'text-orange-400',
  'Noite':     'text-blue-400',
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-600 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { schedules, drivers, dashboardStats } = useApp();
  const [search, setSearch] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPonto, setFilterPonto] = useState('');

  const empresas = useMemo(
    () => [...new Set(schedules.map(s => s.empresa))].sort(),
    [schedules]
  );

  const filtered = useMemo(() => {
    return schedules
      .filter(s => {
        const q = search.toLowerCase();
        if (q && !s.descricao.toLowerCase().includes(q) && !s.motorista?.toLowerCase().includes(q) && !s.empresa.toLowerCase().includes(q)) return false;
        if (filterEmpresa && s.empresa !== filterEmpresa) return false;
        if (filterStatus && s.status !== filterStatus) return false;
        if (filterPonto && s.pontoInicio !== filterPonto) return false;
        return true;
      })
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }, [schedules, search, filterEmpresa, filterStatus, filterPonto]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Visão Geral da Escala</h2>
        <p className="text-slate-400 text-sm mt-1">Escala de operação – {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Motoristas Ativos"  value={dashboardStats.motoristaAtivos}    color="bg-emerald-600" sub={`de ${dashboardStats.totalMotoristas} totais`} />
        <StatCard icon={AlertTriangle} label="Em Atestado"         value={dashboardStats.motoristaAfastados} color="bg-red-600"     sub="afastados hoje" />
        <StatCard icon={Bus}           label="Linhas Escaladas"    value={dashboardStats.linhasEscaladas}    color="bg-blue-600"    sub={`de ${dashboardStats.totalLinhas} linhas`} />
        <StatCard icon={Radio}         label="Tok do Guarda"       value={dashboardStats.tokDoGuarda}        color="bg-amber-600"   sub="saídas diretas" />
      </div>

      {/* Filters */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar linha, motorista, empresa..."
              className="bg-transparent text-slate-200 text-sm outline-none w-full placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterEmpresa}
            onChange={e => setFilterEmpresa(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none"
          >
            <option value="">Todas as Empresas</option>
            {empresas.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none"
          >
            <option value="">Todos os Status</option>
            <option value="Escalado">Escalado</option>
            <option value="Descoberto">Descoberto</option>
            <option value="Substituído">Substituído</option>
          </select>
          <select
            value={filterPonto}
            onChange={e => setFilterPonto(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none"
          >
            <option value="">Todos os Pontos</option>
            <option value="Linha">Linha (Tok)</option>
            <option value="Garagem">Garagem</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-400" />
            Tabela de Escalas
          </h3>
          <span className="text-slate-400 text-xs">{filtered.length} linha(s) encontrada(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Horário', 'Turno', 'Empresa', 'Descrição', 'Motorista', 'Ponto Início', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-400" />
                      <span className="text-white font-mono font-semibold text-sm">{s.horario}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${turnoColors[s.turno] || 'text-slate-400'}`}>{s.turno}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300 text-sm font-medium">{s.empresa}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-slate-400 text-xs line-clamp-2">{s.descricao}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.motorista
                      ? <span className="text-slate-200 text-sm font-medium">{s.motorista}</span>
                      : <span className="text-red-400 text-sm italic flex items-center gap-1"><AlertTriangle size={14}/> Vago</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${pontoColors[s.pontoInicio]}`}>
                      {s.pontoInicio}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[s.status] || statusColors['Escalado']}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-10 text-sm">
                    Nenhuma linha encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
