// src/pages/Ferias.jsx — Compatível com AppContext v2 (usa 'linhas', 'vacations')

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Palmtree, UserCheck, Calendar, X, CheckCircle, ChevronRight } from 'lucide-react';

function VacationCard({ vac, onCancel }) {
  return (
    <div className="bg-slate-800/60 border border-purple-500/20 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-white font-semibold text-sm">{vac.driverName}</p>
          <p className="text-slate-400 text-xs">
            <Calendar size={12} className="inline mr-1 text-purple-400"/>
            {vac.startDate} → {vac.endDate}
          </p>
          {vac.substitutoName && (
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <UserCheck size={12}/> Ferista: <strong>{vac.substitutoName}</strong>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {vac.status}
          </span>
          <button onClick={() => onCancel(vac.id)} className="text-slate-500 hover:text-red-400 transition-colors">
            <X size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Ferias() {
  const { drivers, vacations, registerVacation, cancelVacation } = useApp();

  const [form, setForm] = useState({
    driverId:          '',
    driverName:        '',
    startDate:         '',
    endDate:           '',
    substitutoDriverId:'',
    substitutoName:    '',
  });

  const titulares = useMemo(
    () => drivers
      .filter(d => d.status === 'Ativo' && d.categoria === 'Titular')
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [drivers]
  );

  const feristas = useMemo(
    () => drivers
      .filter(d => d.status === 'Ativo' && (d.categoria === 'Ferista' || d.categoria === 'Reserva'))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [drivers]
  );

  const handleDriverChange = (e) => {
    const d = drivers.find(dr => dr.id === e.target.value || String(dr.id) === e.target.value);
    setForm(p => ({ ...p, driverId: d?.id || '', driverName: d?.name || '' }));
  };

  const handleSubChange = (e) => {
    const d = drivers.find(dr => dr.id === e.target.value || String(dr.id) === e.target.value);
    setForm(p => ({ ...p, substitutoDriverId: d?.id || '', substitutoName: d?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.driverId || !form.startDate || !form.endDate) return;
    await registerVacation(form);
    setForm({ driverId: '', driverName: '', startDate: '', endDate: '', substitutoDriverId: '', substitutoName: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Módulo de Férias</h2>
        <p className="text-slate-400 text-sm mt-1">Programe férias e aloque motoristas feristas automaticamente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Formulário ── */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Palmtree size={18} className="text-purple-400"/>
            Programar Férias
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Motorista Titular *</label>
              <select
                value={form.driverId}
                onChange={handleDriverChange}
                required
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500/60 transition-colors"
              >
                <option value="">Selecione o titular...</option>
                {titulares.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Início *</label>
                <input type="date" value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500/60 transition-colors"/>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Retorno *</label>
                <input type="date" value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500/60 transition-colors"/>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Motorista Ferista <span className="text-slate-500">(assume toda a grade)</span>
              </label>
              <select
                value={form.substitutoDriverId}
                onChange={handleSubChange}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500/60 transition-colors"
              >
                <option value="">Sem substituto definido</option>
                {feristas.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.categoria})</option>
                ))}
              </select>
            </div>

            {form.driverName && form.substitutoName && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                <p className="text-purple-300 text-xs flex items-center gap-2">
                  <ChevronRight size={13}/>
                  <strong>{form.substitutoName}</strong> assumirá todas as linhas de{' '}
                  <strong>{form.driverName}</strong> no período.
                </p>
              </div>
            )}

            <button type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
              <Palmtree size={16}/>
              Programar Férias
            </button>
          </form>
        </div>

        {/* ── Férias agendadas ── */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-purple-400"/>
            Férias Programadas
            <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
              {vacations.length}
            </span>
          </h3>

          {vacations.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-8 text-center">
              <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3"/>
              <p className="text-slate-400 text-sm">Nenhuma férias programada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vacations.map(vac => (
                <VacationCard key={vac.id} vac={vac} onCancel={cancelVacation}/>
              ))}
            </div>
          )}

          {/* Motoristas em férias */}
          {drivers.filter(d => d.status === 'Férias').length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
              <h4 className="text-slate-400 text-xs font-semibold uppercase mb-3">Atualmente em Férias</h4>
              <div className="space-y-2">
                {drivers.filter(d => d.status === 'Férias').map(d => (
                  <div key={d.id} className="flex items-center gap-2 text-xs text-slate-300">
                    <Palmtree size={12} className="text-purple-400"/>
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
