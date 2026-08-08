// src/pages/TokDoGuarda.jsx
// CRUD completo + impressão com colunas OK e Assinatura

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import PrintButton from '../components/PrintButton';
import {
  Radio, Phone, Clock, AlertTriangle, CheckCircle,
  Search, ExternalLink, RefreshCw, Wifi, Plus,
  Trash2, Edit2, X, Save,
} from 'lucide-react';

const turnoOrder = { Madrugada: 0, Manhã: 1, Tarde: 2, Noite: 3 };
const EMPRESAS = ['SHOPEE STA RITA','SHOPEE ESTEIO','SHOPEE GTI','REITER LOG','VIEMAR','MUNDIAL','PERTO','HERC','PROMETEON','NEXTEER','FIBRAPLAC','AIVA','HT MICRON','HERTZ','CONTROIL'];

// ─── Card operacional ──────────────────────────────────────────────────────────
function TokCard({ tok, onConfirm, onEdit, onDelete }) {
  const [confirmado, setConfirmado] = useState(tok.status === 'Confirmado');

  const handleConfirm = () => {
    const next = !confirmado;
    setConfirmado(next);
    onConfirm(tok.id, next ? 'Confirmado' : 'Pendente');
  };

  const whatsappUrl = tok.telefone
    ? `https://wa.me/55${tok.telefone.replace(/\D/g,'')}?text=Boa+noite!+Confirmando+saída+da+linha+${encodeURIComponent(tok.empresa||'')}+às+${tok.horarioChamada}.`
    : null;

  return (
    <div className={`
      relative rounded-2xl border p-5 transition-all duration-300 group
      ${confirmado
        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
        : tok.motoristaName
          ? 'bg-slate-800/70 border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800'
          : 'bg-red-500/10 border-red-500/30'
      }
    `}>
      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
        <button onClick={() => onEdit(tok)} className="p-1.5 bg-slate-700 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors"><Edit2 size={12}/></button>
        <button onClick={() => onDelete(tok.id)} className="p-1.5 bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"><Trash2 size={12}/></button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`px-3 py-1.5 rounded-xl text-lg font-bold font-mono shrink-0 ${
          confirmado ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
        }`}>
          {tok.horarioChamada || tok.horario || '--:--'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-300 text-xs font-semibold">{tok.empresa}</p>
          <p className="text-slate-500 text-xs truncate">{tok.descricao}</p>
        </div>
        {confirmado && <CheckCircle size={16} className="text-emerald-400 shrink-0"/>}
        {!tok.motoristaName && <AlertTriangle size={16} className="text-red-400 shrink-0"/>}
      </div>

      {/* Motorista */}
      {tok.motoristaName ? (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 bg-slate-700/50 rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {tok.motoristaName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{tok.motoristaName}</p>
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <Phone size={10}/>
                {tok.telefone
                  ? `(${tok.telefone.slice(0,2)}) ${tok.telefone.slice(2,7)}-${tok.telefone.slice(7)}`
                  : <span className="italic text-slate-600">Sem telefone</span>
                }
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 no-print">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl transition-colors">
                <ExternalLink size={11}/> WhatsApp
              </a>
            )}
            {tok.telefone && (
              <a href={`tel:+55${tok.telefone.replace(/\D/g,'')}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors">
                <Phone size={11}/> Ligar
              </a>
            )}
            <button onClick={handleConfirm}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                confirmado ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}>
              {confirmado ? <><RefreshCw size={11}/> Desfazer</> : <><CheckCircle size={11}/> Confirmar</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <p className="text-red-300 text-xs">Linha sem motorista</p>
        </div>
      )}
    </div>
  );
}

// ─── Linha de impressão ────────────────────────────────────────────────────────
function PrintRow({ tok, index, drivers }) {
  // If tok.telefone is missing, try to find it in the drivers list
  let telefone = tok.telefone;
  if (!telefone && tok.motoristaName) {
    const driver = drivers.find(d => d.name === tok.motoristaName);
    if (driver?.phone) telefone = driver.phone;
  }

  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return phone;
  };
  return (
    <tr className="border-b border-gray-200">
      <td className="px-3 py-2 text-center font-mono font-bold text-sm">{tok.horarioChamada || tok.horario}</td>
      <td className="px-3 py-2 text-sm">{tok.empresa}</td>
      <td className="px-3 py-2 text-xs text-gray-600">{tok.descricao}</td>
      <td className="px-3 py-2 font-semibold text-sm">{tok.motoristaName || <span className="text-red-600">VAGO</span>}</td>
      <td className="px-3 py-2 text-sm font-mono">{formatPhone(telefone)}</td>
      <td className="px-3 py-2 text-center"><div className="w-8 h-8 border-2 border-gray-400 rounded-sm mx-auto" /></td>
      <td className="px-3 py-2"><div className="border-b border-gray-400 mx-2 mt-4" /></td>
    </tr>
  );
}

// ─── Modal add/edit tok ────────────────────────────────────────────────────────
function TokModal({ tok, drivers, onSave, onClose }) {
  const [form, setForm] = useState(tok || {
    empresa: '', descricao: '', horarioChamada: '', horarioInicio: '',
    motoristaName: '', telefone: '', pontoInicio: 'Linha', status: 'Pendente',
  });

  const handleDriverChange = (name) => {
    const d = drivers.find(dr => dr.name === name);
    setForm(p => ({ ...p, motoristaName: name, telefone: d?.phone || p.telefone }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">{tok ? 'Editar Tok' : 'Adicionar Tok (Encaixe)'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs block mb-1.5">Empresa *</label>
              <select value={form.empresa} onChange={e => setForm(p=>({...p, empresa: e.target.value}))} required
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60">
                <option value="">Selecione...</option>
                {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1.5">Horário Chamada *</label>
              <input type="time" value={form.horarioChamada} onChange={e => setForm(p=>({...p, horarioChamada: e.target.value}))} required
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60"/>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1.5">Descrição da Linha</label>
            <input value={form.descricao} onChange={e => setForm(p=>({...p, descricao: e.target.value}))}
              placeholder="101 - MATHIAS VELHO / CANOAS (SAÍDA 20:00)"
              className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs block mb-1.5">Motorista</label>
              <select value={form.motoristaName} onChange={e => handleDriverChange(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60">
                <option value="">Selecione...</option>
                {drivers.filter(d=>d.status==='Ativo').sort((a,b)=>a.name.localeCompare(b.name)).map(d=>(
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1.5">Telefone</label>
              <input value={form.telefone} onChange={e => setForm(p=>({...p, telefone: e.target.value}))}
                placeholder="51999999999"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500/60"/>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-colors">Cancelar</button>
            <button onClick={() => onSave(form)}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <Save size={15}/> {tok ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TokDoGuarda() {
  const { toks, drivers, addTok, updateTok, deleteTok } = useApp();
  const [search, setSearch]           = useState('');
  const [filterTurno, setFilterTurno] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | tok object
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const filtered = useMemo(() => {
    return toks
      .filter(t => {
        const q = search.toLowerCase();
        if (q && !t.motoristaName?.toLowerCase().includes(q) && !t.descricao?.toLowerCase().includes(q) && !t.empresa?.toLowerCase().includes(q)) return false;
        if (filterEmpresa && t.empresa !== filterEmpresa) return false;
        return true;
      })
      .sort((a, b) => (a.horarioChamada || a.horario || '').localeCompare(b.horarioChamada || b.horario || ''));
  }, [toks, search, filterTurno, filterEmpresa]);

  const empresasUniq = useMemo(() => [...new Set(toks.map(t => t.empresa).filter(Boolean))].sort(), [toks]);

  const handleSave = async (form) => {
    if (modal === 'new') await addTok(form);
    else await updateTok(modal.id, form);
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remover este tok?')) await deleteTok(id);
  };

  const handleConfirm = async (id, status) => {
    await updateTok(id, { status });
  };

  const vagos = filtered.filter(t => !t.motoristaName).length;

  return (
    <div className="p-6 space-y-5">
      {/* ── Print Header (only on print) ── */}
      <div className="print-only hidden">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">TOK DO GUARDA — LISTA DE PARTIDAS</h1>
          <p className="text-sm mt-1">{today.toUpperCase()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Impresso em {new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</p>
        </div>
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300">
              <th className="px-3 py-2 text-sm">HORÁRIO</th>
              <th className="px-3 py-2 text-sm">EMPRESA</th>
              <th className="px-3 py-2 text-sm">LINHA</th>
              <th className="px-3 py-2 text-sm">MOTORISTA</th>
              <th className="px-3 py-2 text-sm">TELEFONE</th>
              <th className="px-3 py-2 text-sm text-center">OK</th>
              <th className="px-3 py-2 text-sm">ASSINATURA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tok, index) => <PrintRow key={tok.id} tok={tok} index={index} drivers={drivers} />)}
          </tbody>
        </table>
        <div className="mt-8 flex justify-between text-xs text-gray-500">
          <span>Total de saídas: {filtered.length}</span>
          <span>Confirmados: {filtered.filter(t=>t.status==='Confirmado').length}</span>
          <span>Pendentes: {filtered.filter(t=>t.status==='Pendente').length}</span>
        </div>
      </div>

      {/* ── Screen UI (hidden on print) ── */}
      <div className="no-print">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Radio size={20} className="text-white"/>
              </div>
              Tok do Guarda
            </h2>
            <p className="text-slate-400 text-sm mt-1 ml-13">Controle de partidas · {today}</p>
          </div>
          <div className="flex items-center gap-2">
            <PrintButton />
            <button onClick={() => setModal('new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20">
              <Plus size={16}/> Adicionar Tok
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-amber-400 text-2xl font-bold">{filtered.length}</p>
            <p className="text-slate-400 text-xs mt-1">Total Toks</p>
          </div>
          <div className="bg-slate-800/60 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-emerald-400 text-2xl font-bold">{filtered.filter(t=>t.status==='Confirmado').length}</p>
            <p className="text-slate-400 text-xs mt-1">Confirmados</p>
          </div>
          <div className="bg-slate-800/60 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-2xl font-bold">{vagos}</p>
            <p className="text-slate-400 text-xs mt-1">Vagos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={16} className="text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar motorista, linha ou empresa..."
              className="bg-transparent text-slate-200 text-sm outline-none w-full placeholder:text-slate-500"/>
          </div>
          <select value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none">
            <option value="">Todas as Empresas</option>
            {empresasUniq.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Radio size={40} className="text-slate-600 mx-auto mb-3"/>
            <p className="text-slate-400">Nenhum tok encontrado. Clique em "Adicionar Tok" para criar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(t => (
              <TokCard
                key={t.id}
                tok={t}
                onConfirm={handleConfirm}
                onEdit={(t) => setModal(t)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <TokModal
          tok={modal === 'new' ? null : modal}
          drivers={drivers}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
