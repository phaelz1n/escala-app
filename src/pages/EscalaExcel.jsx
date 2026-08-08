// src/pages/EscalaExcel.jsx
// ─── Tabela de Escala estilo Excel ─────────────────────────────────────────────
// Linhas de ônibus nas linhas, dias do mês (1-31) nas colunas.
// Edição inline em cada célula, salva no Firestore instantaneamente.

import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import PrintButton from '../components/PrintButton';
import {
  Plus, Trash2, Save, X, ChevronLeft, ChevronRight,
  AlertTriangle, Search, Filter, RefreshCw,
} from 'lucide-react';

const MESES = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
];

const TURNOS = ['Madrugada','Manhã','Tarde','Noite'];

const STATUS_CELL = {
  'Escalado':          'bg-emerald-500/20 text-emerald-300',
  'Descoberto':        'bg-red-500/20 text-red-300',
  'Substituído':       'bg-blue-500/20 text-blue-300',
  'Férias/Substituído':'bg-purple-500/20 text-purple-300',
  'default':           'bg-slate-700/40 text-slate-300',
};

// ─── Célula editável ───────────────────────────────────────────────────────────
function EditableCell({ value, onChange, placeholder = '—', className = '' }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');
  const inputRef = useRef(null);

  const commit = () => {
    setEditing(false);
    if (val !== value) onChange(val);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value||''); setEditing(false); } }}
        className="w-full bg-blue-500/20 border border-blue-400 text-white text-xs px-1.5 py-1 rounded outline-none min-w-16"
      />
    );
  }

  return (
    <span
      onClick={() => { setVal(value||''); setEditing(true); }}
      title="Clique para editar"
      className={`cursor-pointer hover:bg-slate-600/40 px-1.5 py-1 rounded transition-colors block truncate text-xs ${
        value ? 'text-slate-200' : 'text-slate-600'
      } ${className}`}
    >
      {value || placeholder}
    </span>
  );
}

// ─── Linha da tabela ───────────────────────────────────────────────────────────
function LinhaRow({ linha, days, drivers, onUpdate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // driver cells: each day-slot has a motorista key like `dia_1`, `dia_2`, etc.
  // We store them in the linha.dias object
  const getDia = (d) => linha.dias?.[`d${d}`] || '';
  const setDia = (d, val) => onUpdate(linha.id, { dias: { ...(linha.dias || {}), [`d${d}`]: val } });

  return (
    <tr className="border-b border-slate-700/30 hover:bg-slate-800/40 group">
      {/* Linha info cols */}
      <td className="sticky left-0 z-10 bg-slate-900 border-r border-slate-700/50 px-2 py-1.5 min-w-[130px]">
        <div className="flex items-center gap-1">
          <EditableCell value={linha.empresa} onChange={v => onUpdate(linha.id, { empresa: v })} placeholder="Empresa" />
        </div>
      </td>
      <td className="sticky left-[130px] z-10 bg-slate-900 border-r border-slate-700/50 px-2 py-1.5 min-w-[60px]">
        <EditableCell value={linha.horario} onChange={v => onUpdate(linha.id, { horario: v })} placeholder="HH:MM" />
      </td>
      <td className="sticky left-[190px] z-10 bg-slate-900 border-r border-slate-700/50 px-2 py-1.5 min-w-[180px] max-w-[180px]">
        <EditableCell value={linha.descricao || linha.lineCode} onChange={v => onUpdate(linha.id, { descricao: v })} placeholder="Descrição da linha" />
      </td>
      <td className="border-r border-slate-700/50 px-2 py-1.5 min-w-[110px]">
        <EditableCell value={linha.motoristaTitularName} onChange={v => onUpdate(linha.id, { motoristaTitularName: v })} placeholder="Titular" />
      </td>

      {/* Day cells */}
      {days.map(d => (
        <td key={d} className="border-r border-slate-700/20 px-1 py-1 min-w-[90px]">
          <EditableCell value={getDia(d)} onChange={v => setDia(d, v)} placeholder="—" />
        </td>
      ))}

      {/* Delete */}
      <td className="px-2 py-1.5 no-print">
        {confirmDelete ? (
          <div className="flex gap-1">
            <button onClick={() => onDelete(linha.id)} className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 border border-red-400/40 rounded">OK</button>
            <button onClick={() => setConfirmDelete(false)} className="text-slate-400 text-xs px-1.5 py-0.5 border border-slate-600 rounded"><X size={10}/></button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}

export default function EscalaExcel() {
  const { linhas, drivers, updateLinha, addLinha, deleteLinha } = useApp();

  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [search, setSearch]     = useState('');
  const [filterTurno, setFilterTurno] = useState('');
  const [showAddRow, setShowAddRow]   = useState(false);
  const [newLinha, setNewLinha] = useState({ empresa: '', horario: '', descricao: '', turno: 'Noite', pontoInicio: 'Garagem' });

  // Days in selected month
  const daysInMonth = useMemo(
    () => new Date(selYear, selMonth + 1, 0).getDate(),
    [selMonth, selYear]
  );
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Today's day number
  const todayDay = now.getDate();
  const isCurrentMonth = now.getMonth() === selMonth && now.getFullYear() === selYear;

  const filtered = useMemo(() => {
    return linhas.filter(l => {
      const q = search.toLowerCase();
      if (q && !l.empresa?.toLowerCase().includes(q) && !l.descricao?.toLowerCase().includes(q) && !l.motoristaTitularName?.toLowerCase().includes(q)) return false;
      if (filterTurno && l.turno !== filterTurno) return false;
      return true;
    }).sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
  }, [linhas, search, filterTurno]);

  const prevMonth = () => {
    if (selMonth === 0) { setSelMonth(11); setSelYear(y => y - 1); }
    else setSelMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selMonth === 11) { setSelMonth(0); setSelYear(y => y + 1); }
    else setSelMonth(m => m + 1);
  };

  const handleAddLinha = async () => {
    if (!newLinha.empresa || !newLinha.horario) return;
    await addLinha({ ...newLinha, status: 'Escalado', motoristaTitularName: '', dias: {} });
    setNewLinha({ empresa: '', horario: '', descricao: '', turno: 'Noite', pontoInicio: 'Garagem' });
    setShowAddRow(false);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Escala Mensal — Estilo Excel</h2>
          <p className="text-slate-400 text-sm mt-0.5">Edite qualquer célula diretamente. Salva automaticamente no Firebase.</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <PrintButton />
          <button
            onClick={() => setShowAddRow(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 to-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} /> Nova Linha
          </button>
        </div>
      </div>

      {/* Month nav + filters */}
      <div className="flex items-center gap-4 flex-wrap no-print">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
          <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><ChevronLeft size={16}/></button>
          <span className="text-white text-sm font-semibold px-2 min-w-28 text-center">{MESES[selMonth]} {selYear}</span>
          <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><ChevronRight size={16}/></button>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 flex-1 max-w-60">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar linhas..."
            className="bg-transparent text-slate-200 text-sm outline-none w-full placeholder:text-slate-500"
          />
        </div>
        <select
          value={filterTurno}
          onChange={e => setFilterTurno(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none"
        >
          <option value="">Todos os Turnos</option>
          {TURNOS.map(t => <option key={t}>{t}</option>)}
        </select>

        <span className="text-slate-500 text-xs ml-auto">{filtered.length} linhas</span>
      </div>

      {/* Add row form */}
      {showAddRow && (
        <div className="bg-slate-800/80 border border-blue-500/30 rounded-2xl p-4 flex flex-wrap gap-3 items-end no-print">
          <div className="flex-1 min-w-32">
            <label className="text-slate-400 text-xs block mb-1">Empresa *</label>
            <input value={newLinha.empresa} onChange={e => setNewLinha(p=>({...p, empresa: e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" placeholder="SHOPEE STA RITA" />
          </div>
          <div className="w-24">
            <label className="text-slate-400 text-xs block mb-1">Horário *</label>
            <input value={newLinha.horario} onChange={e => setNewLinha(p=>({...p, horario: e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" placeholder="19:00" />
          </div>
          <div className="flex-1 min-w-40">
            <label className="text-slate-400 text-xs block mb-1">Descrição</label>
            <input value={newLinha.descricao} onChange={e => setNewLinha(p=>({...p, descricao: e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" placeholder="101 - MATHIAS VELHO..." />
          </div>
          <div className="w-32">
            <label className="text-slate-400 text-xs block mb-1">Turno</label>
            <select value={newLinha.turno} onChange={e => setNewLinha(p=>({...p, turno: e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none">
              {TURNOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="text-slate-400 text-xs block mb-1">Ponto Início</label>
            <select value={newLinha.pontoInicio} onChange={e => setNewLinha(p=>({...p, pontoInicio: e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none">
              <option>Garagem</option>
              <option>Linha</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddLinha} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
              <Save size={14}/> Salvar
            </button>
            <button onClick={() => setShowAddRow(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors">
              <X size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* Excel table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <table className="border-collapse text-xs w-full" style={{ minWidth: `${370 + days.length * 90}px` }}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-900 border-b-2 border-slate-700">
                <th className="sticky left-0 z-30 bg-slate-900 border-r border-slate-700 px-3 py-2.5 text-left text-slate-400 font-semibold uppercase tracking-wide min-w-[130px]">Empresa</th>
                <th className="sticky left-[130px] z-30 bg-slate-900 border-r border-slate-700 px-2 py-2.5 text-left text-slate-400 font-semibold uppercase tracking-wide min-w-[60px]">Hora</th>
                <th className="sticky left-[190px] z-30 bg-slate-900 border-r border-slate-700 px-2 py-2.5 text-left text-slate-400 font-semibold uppercase tracking-wide min-w-[180px]">Linha / Descrição</th>
                <th className="border-r border-slate-700 px-2 py-2.5 text-left text-slate-400 font-semibold uppercase tracking-wide min-w-[110px]">Titular</th>
                {days.map(d => (
                  <th
                    key={d}
                    className={`border-r border-slate-700/50 px-1 py-2.5 text-center font-semibold min-w-[90px] ${
                      isCurrentMonth && d === todayDay
                        ? 'text-blue-400 bg-blue-500/10'
                        : 'text-slate-400'
                    }`}
                  >
                    <div>{d}</div>
                    <div className="text-slate-600 font-normal text-[10px]">
                      {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][new Date(selYear, selMonth, d).getDay()]}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2.5 no-print" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(linha => (
                <LinhaRow
                  key={linha.id}
                  linha={linha}
                  days={days}
                  drivers={drivers}
                  onUpdate={updateLinha}
                  onDelete={deleteLinha}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={days.length + 5} className="py-12 text-center text-slate-500 text-sm">
                    Nenhuma linha encontrada. Clique em "Nova Linha" para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print header — only visible when printing */}
      <div className="print-only hidden">
        <h1 className="text-xl font-bold text-center">ESCALA DE MOTORISTAS — {MESES[selMonth].toUpperCase()} {selYear}</h1>
        <p className="text-center text-sm mt-1">Impresso em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  );
}
