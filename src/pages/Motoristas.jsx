// src/pages/Motoristas.jsx — CRUD completo com Firebase, 5 categorias

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database, Plus, Edit2, Trash2, Search, X,
  Phone, User, CheckCircle, AlertTriangle, Palmtree, Clock, UserX
} from 'lucide-react';

const CATEGORIAS = ['Titular', 'Reserva', 'Ferista', 'Horista 6h', 'Horista 4h'];
const STATUS_LIST = ['Ativo', 'Férias', 'Atestado', 'Folga', 'Inativo'];

const categoriaColors = {
  Titular:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Reserva:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Ferista:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Horista 6h':'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Horista 4h':'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

const statusConfig = {
  Ativo:    { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: <CheckCircle size={11}/> },
  Atestado: { badge: 'bg-red-500/20 text-red-300 border-red-500/30',            icon: <AlertTriangle size={11}/> },
  'Férias': { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',   icon: <Palmtree size={11}/> },
  Folga:    { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',      icon: <Clock size={11}/> },
  Inativo:  { badge: 'bg-red-500/10 text-red-400 border-red-500/20',            icon: <UserX size={11}/> },
};

const emptyForm = { name: '', phone: '', categoria: 'Titular', status: 'Ativo' };

function DriverModal({ driver, onSave, onClose }) {
  const [form, setForm] = useState(driver ? {
    name: driver.name, phone: driver.phone, categoria: driver.categoria, status: driver.status
  } : emptyForm);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">{driver ? 'Editar Motorista' : 'Novo Motorista'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Nome Completo *</label>
            <input value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value.toUpperCase()}))}
              required placeholder="NOME DO MOTORISTA"
              className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors"/>
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Telefone</label>
            <input value={form.phone} onChange={e => setForm(p=>({...p, phone: e.target.value}))}
              placeholder="51999999999 (Opcional)"
              className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60 transition-colors"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Categoria *</label>
              <select value={form.categoria} onChange={e => setForm(p=>({...p, categoria: e.target.value}))}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60">
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Status *</label>
              <select value={form.status} onChange={e => setForm(p=>({...p, status: e.target.value}))}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60">
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all">
              {driver ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Motoristas() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useApp();
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal]           = useState(null);

  const filtered = useMemo(() => {
    return drivers
      .filter(d => {
        const q = search.toLowerCase();
        if (q && !d.name?.toLowerCase().includes(q) && !d.phone?.includes(q)) return false;
        if (filterCat && d.categoria !== filterCat) return false;
        if (filterStatus && d.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [drivers, search, filterCat, filterStatus]);

  const handleSave = async (form) => {
    if (modal === 'new') await addDriver(form);
    else await updateDriver(modal.id, form);
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmar exclusão?')) await deleteDriver(id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Banco de Dados — Motoristas</h2>
          <p className="text-slate-400 text-sm mt-1">Gerencie o cadastro completo da equipe</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16}/> Novo Motorista
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIAS.map(cat => {
          const count = drivers.filter(d => d.categoria === cat).length;
          return (
            <div key={cat} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-white text-xl font-bold">{count}</p>
              <p className="text-slate-400 text-xs mt-0.5">{cat}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={16} className="text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="bg-transparent text-slate-200 text-sm outline-none w-full placeholder:text-slate-500"/>
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none">
          <option value="">Todas as Categorias</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none">
          <option value="">Todos os Status</option>
          {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Database size={18} className="text-blue-400"/> Equipe
          </h3>
          <span className="text-slate-400 text-xs">{filtered.length} motorista(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['#','Nome','Telefone','Categoria','Status','Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map((d, i) => (
                <tr key={d.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-4 py-3 text-slate-500 text-xs">{i+1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400"><User size={13}/></div>
                      <span className="text-slate-200 text-sm font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Phone size={12} className="text-slate-500"/>
                      {d.phone
                        ? `(${String(d.phone).slice(0,2)}) ${String(d.phone).slice(2,7)}-${String(d.phone).slice(7)}`
                        : d.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${categoriaColors[d.categoria] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                      {d.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit ${statusConfig[d.status]?.badge || statusConfig.Ativo.badge}`}>
                      {statusConfig[d.status]?.icon || statusConfig.Ativo.icon}
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(d)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={14}/></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-slate-500 py-10 text-sm">Nenhum motorista encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <DriverModal driver={modal==='new'?null:modal} onSave={handleSave} onClose={() => setModal(null)}/>}
    </div>
  );
}
