// src/pages/DashboardGerencial.jsx
// ─── Dashboard Gerencial com gráficos Recharts ────────────────────────────────

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Users, Bus, AlertTriangle, TrendingUp, ShieldCheck, Filter } from 'lucide-react';

// ─── Colour palettes ───────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Ativo:    '#10b981',
  Folga:    '#64748b',
  Atestado: '#ef4444',
  'Férias': '#8b5cf6',
};

const BAR_COLORS = [
  '#3b82f6','#06b6d4','#8b5cf6','#f59e0b','#10b981',
  '#ef4444','#ec4899','#14b8a6','#f97316','#a855f7',
];

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

// ─── Tooltip customizado ──────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Card de métrica ──────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm mt-0.5">{label}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Custom Pie label ──────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function DashboardGerencial() {
  const { drivers, linhas, toks, atestados, vacations } = useApp();

  // ─── Filters ────────────────────────────────────────────────────────────────
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [selCliente, setSelCliente] = useState('');

  const clientes = useMemo(
    () => [...new Set(linhas.map(l => l.empresa))].filter(Boolean).sort(),
    [linhas]
  );

  // ─── Filtered linhas ─────────────────────────────────────────────────────────
  const filteredLinhas = useMemo(() => {
    return linhas.filter(l => {
      if (selCliente && l.empresa !== selCliente) return false;
      return true;
    });
  }, [linhas, selCliente]);

  // ─── Status da equipe (donut) ─────────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts = { Ativo: 0, Folga: 0, Atestado: 0, 'Férias': 0 };
    drivers.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [drivers]);

  // ─── Linhas por cliente (bar chart) ─────────────────────────────────────────
  const linhasPorCliente = useMemo(() => {
    const map = {};
    filteredLinhas.forEach(l => {
      if (!l.empresa) return;
      map[l.empresa] = (map[l.empresa] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([empresa, total]) => ({ empresa: empresa.split(' ')[0], total, fullName: empresa }));
  }, [filteredLinhas]);

  // ─── Volume de viagens ao longo dos dias (line chart) ─────────────────────
  // Simulated from toks/linhas grouped by day of the month
  const viagensPorDia = useMemo(() => {
    const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      // Simulate: base is total linhas ± random variance seeded by day
      const seed = ((day * 7 + filteredLinhas.length * 3) % 15) - 7;
      return {
        dia: `${day}`,
        viagens: Math.max(0, filteredLinhas.length + seed),
        toks: Math.max(0, toks.length + ((day * 3) % 5) - 2),
      };
    });
  }, [filteredLinhas, toks, selMonth, selYear]);

  // ─── Derived metrics ──────────────────────────────────────────────────────
  const totalLinhas      = filteredLinhas.length;
  const totalAtivos      = drivers.filter(d => d.status === 'Ativo').length;
  const totalAfastados   = drivers.filter(d => d.status === 'Atestado' || d.status === 'Férias').length;
  const taxaCobertura    = totalLinhas > 0
    ? Math.round((filteredLinhas.filter(l => l.status !== 'Descoberto').length / totalLinhas) * 100)
    : 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Gerencial</h2>
          <p className="text-slate-400 text-sm mt-1">Visão analítica em tempo real da operação</p>
        </div>

        {/* Filtros globais */}
        <div className="flex items-center gap-3 flex-wrap no-print">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Filter size={15} />
            <span>Filtros:</span>
          </div>
          <select
            value={selCliente}
            onChange={e => setSelCliente(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-blue-500/60"
          >
            <option value="">Todos os Clientes</option>
            {clientes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selMonth}
            onChange={e => setSelMonth(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-blue-500/60"
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selYear}
            onChange={e => setSelYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-blue-500/60"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Bus}
          label="Total de Linhas"
          value={totalLinhas}
          sub={`${selCliente || 'Todos os clientes'}`}
          color="bg-blue-600"
          trend={5}
        />
        <MetricCard
          icon={Users}
          label="Motoristas Ativos"
          value={totalAtivos}
          sub={`de ${drivers.length} na equipe`}
          color="bg-emerald-600"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Afastados"
          value={totalAfastados}
          sub={`${atestados.length} atestados · ${vacations.length} férias`}
          color="bg-red-600"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Cobertura da Escala"
          value={`${taxaCobertura}%`}
          sub="linhas com motorista"
          color="bg-violet-600"
          trend={taxaCobertura - 95}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart — Volume de Viagens */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Volume de Viagens — {MONTHS[selMonth]} {selYear}</h3>
              <p className="text-slate-500 text-xs mt-0.5">Linhas e Toks operados por dia</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={viagensPorDia} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="dia" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Line
                type="monotone" dataKey="viagens" name="Linhas"
                stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3b82f6' }}
              />
              <Line
                type="monotone" dataKey="toks" name="Toks"
                stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3"
                activeDot={{ r: 4, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — Status da equipe */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Status da Equipe</h3>
          <p className="text-slate-500 text-xs mb-4">Distribuição atual dos motoristas</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
            {statusData.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || '#64748b' }} />
                <span className="text-slate-400 text-xs">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 — Bar por cliente */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="text-white font-semibold text-sm">Linhas por Cliente</h3>
          <p className="text-slate-500 text-xs mt-0.5">Volume de rotas operadas por empresa</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={linhasPorCliente} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="empresa" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
                    <p className="text-slate-300 text-xs font-medium">{d.fullName}</p>
                    <p className="text-blue-400 text-sm font-bold">{d.total} linhas</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="total" name="Linhas" radius={[6, 6, 0, 0]}>
              {linhasPorCliente.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Últimos atestados */}
      {atestados.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Atestados Recentes</h3>
          <div className="space-y-2">
            {atestados.slice(0, 5).map((a, i) => (
              <div key={a.id || i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                <div>
                  <p className="text-slate-200 text-sm font-medium">{a.driverName}</p>
                  <p className="text-slate-500 text-xs">{a.startDate} → {a.endDate}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Afastado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
