// src/pages/Atestados.jsx — Compatível com AppContext v2 (usa 'linhas' em vez de 'schedules')

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText, AlertTriangle, UserCheck, Calendar,
  ChevronRight, X, CheckCircle, Lightbulb,
} from 'lucide-react';

function LeaveCard({ leave, onCancel, onApplySubstitute }) {
  const suggestions = leave.suggestions || [];

  return (
    <div className="bg-slate-800/60 border border-red-500/20 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white font-semibold text-sm">{leave.driverName}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {leave.startDate} → {leave.endDate}
            {leave.cid && <span className="ml-2 text-slate-500">CID: {leave.cid}</span>}
          </p>
          {leave.obs && <p className="text-slate-500 text-xs mt-0.5 italic">{leave.obs}</p>}
        </div>
        <button
          onClick={() => onCancel(leave.id)}
          className="text-slate-500 hover:text-red-400 transition-colors"
          title="Cancelar atestado"
        >
          <X size={16}/>
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <Lightbulb size={13}/> Sugestão de substitutos:
          </p>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-slate-700/40 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-slate-300 text-xs font-medium">
                  {s.schedule?.lineId || s.schedule?.lineCode || s.schedule?.id} · {s.schedule?.horario}
                </p>
                <p className="text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                  <UserCheck size={12}/> {s.substitute?.name}
                  <span className="text-slate-500 ml-1">({s.substitute?.categoria})</span>
                </p>
              </div>
              <button
                onClick={() => onApplySubstitute(s.schedule?.id, s.substitute?.name)}
                className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                Alocar <ChevronRight size={12}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle size={13}/> Nenhum reserva disponível encontrado.
        </p>
      )}
    </div>
  );
}

export default function Atestados() {
  const { drivers, atestados, registerMedicalLeave, cancelMedicalLeave, applySubstitute } = useApp();

  const [form, setForm] = useState({
    driverName: '',
    startDate:  '',
    endDate:    '',
    cid:        '',
    obs:        '',
  });

  // Drivers que podem ser afastados (não estão já em atestado)
  const selectableDrivers = useMemo(
    () => drivers
      .filter(d => d.status !== 'Atestado')
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [drivers]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.driverName || !form.startDate || !form.endDate) return;
    await registerMedicalLeave(form);
    setForm({ driverName: '', startDate: '', endDate: '', cid: '', obs: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Módulo de Atestados e Substituições</h2>
        <p className="text-slate-400 text-sm mt-1">
          Registre afastamentos e gerencie substituições automaticamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Formulário ── */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText size={18} className="text-red-400"/>
            Lançar Atestado Médico
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Motorista *</label>
              <select
                value={form.driverName}
                onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))}
                required
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors"
              >
                <option value="">Selecione o motorista...</option>
                {selectableDrivers.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.categoria})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Data Início *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Data Fim *</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">CID (opcional)</label>
              <input
                type="text"
                value={form.cid}
                onChange={e => setForm(p => ({ ...p, cid: e.target.value }))}
                placeholder="Ex: Z96.0"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Observações</label>
              <textarea
                value={form.obs}
                onChange={e => setForm(p => ({ ...p, obs: e.target.value }))}
                placeholder="Detalhes adicionais..."
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <AlertTriangle size={16}/>
              Lançar Atestado
            </button>
          </form>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-blue-300 text-xs flex items-start gap-2">
              <Lightbulb size={13} className="mt-0.5 shrink-0"/>
              Ao lançar, o sistema remove o motorista da escala, altera seu status para "Atestado" e sugere automaticamente um motorista <strong>Reserva</strong> disponível no mesmo horário.
            </p>
          </div>
        </div>

        {/* ── Atestados ativos ── */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-amber-400"/>
            Atestados Ativos
            <span className="ml-auto text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
              {atestados.length}
            </span>
          </h3>

          {atestados.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-8 text-center">
              <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3"/>
              <p className="text-slate-400 text-sm">Nenhum atestado ativo no momento.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {atestados.map(leave => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  onCancel={cancelMedicalLeave}
                  onApplySubstitute={applySubstitute}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
