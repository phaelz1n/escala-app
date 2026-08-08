// src/pages/EscalaExcel.jsx
// ─── Tabela de Escala estilo Excel ─────────────────────────────────────────────
// Linhas de ônibus nas linhas, dias do mês (1-31) nas colunas.
// Edição inline em cada célula, salva no Firestore instantaneamente.

import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import PrintButton from '../components/PrintButton';
import {
  Plus, Trash2, Save, X, ChevronLeft, ChevronRight,
  AlertTriangle, Search, Filter, RefreshCw, ChevronUp, ChevronDown
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
  'default':           'bg-slate-700/40'
};

function EditableCell({ value, onChange, placeholder = '—', className = '', listId }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => setVal(value), [value]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) onChange(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setVal(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={val || ''}
        onChange={e => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        list={listId}
        className={`w-full bg-slate-800 text-white px-1.5 py-1 outline-none border border-blue-500 rounded text-xs ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => { setVal(value||''); setEditing(true); }}
      title="Clique para editar"
      className={`cursor-pointer hover:bg-slate-600/40 px-1.5 py-1 rounded transition-colors block w-full truncate min-h-[24px] ${!value ? 'text-slate-500 italic' : ''} ${className}`}
    >
      {value || placeholder}
    </span>
  );
}

// ─── Componente HeaderMenu (Estilo Excel) ────────────────────────────────────
function HeaderMenu({ title, colKey, activeMenu, setActiveMenu, sortConfigs, setSortConfigs, columnFilters, setColumnFilters, linhas, getVal, extraClass = "" }) {
  const isOpen = activeMenu === colKey;
  const [search, setSearch] = useState('');

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest(`.header-menu-${colKey}`)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, colKey, setActiveMenu]);

  // Compute unique values only when open
  const uniqueValues = useMemo(() => {
    if (!isOpen) return [];
    const vals = new Set();
    let hasEmpty = false;
    linhas.forEach(l => {
      const v = getVal(l);
      if (v) vals.add(v);
      else hasEmpty = true;
    });
    const arr = Array.from(vals).sort((a, b) => (String(a)).localeCompare(String(b)));
    if (hasEmpty) arr.push(''); // Add empty representation at the end
    return arr;
  }, [isOpen, linhas, getVal]);

  const sortIndex = sortConfigs.findIndex(s => s.key === colKey);
  const currentSort = sortIndex >= 0 ? sortConfigs[sortIndex] : null;

  const handleSort = (dir) => {
    setSortConfigs(prev => {
      const filtered = prev.filter(s => s.key !== colKey);
      if (currentSort?.direction === dir) return filtered; // toggle off
      return [{ key: colKey, direction: dir }, ...filtered];
    });
    setActiveMenu(null);
  };

  const selectedValues = columnFilters[colKey] || [];
  
  const toggleValue = (val) => {
    setColumnFilters(prev => {
      const current = prev[colKey] || [];
      const isSelected = current.includes(val);
      const updated = isSelected ? current.filter(v => v !== val) : [...current, val];
      
      const newFilters = { ...prev, [colKey]: updated };
      if (updated.length === 0) delete newFilters[colKey];
      return newFilters;
    });
  };

  const toggleAll = () => {
    if (selectedValues.length === uniqueValues.length || selectedValues.length === 0) {
      setColumnFilters(prev => { const n = {...prev}; delete n[colKey]; return n; });
    } else {
      setColumnFilters(prev => { const n = {...prev}; delete n[colKey]; return n; });
    }
  };

  const filteredValues = uniqueValues.filter(v => (v||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`relative header-menu-${colKey} flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors select-none w-full h-full ${extraClass}`} onClick={() => !isOpen && setActiveMenu(colKey)}>
      <div className="flex items-center gap-1">
        {title}
        {currentSort && <span className="text-blue-400 text-[10px]">{currentSort.direction === 'asc' ? '▲' : '▼'}{sortConfigs.length > 1 ? sortIndex + 1 : ''}</span>}
        {selectedValues.length > 0 && <Filter size={10} className="text-emerald-400" />}
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[100] text-sm text-slate-200 p-2 cursor-default font-normal normal-case" onClick={e => e.stopPropagation()}>
          <div className="space-y-1 mb-2">
            <button onClick={() => handleSort('asc')} className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 flex items-center justify-between ${currentSort?.direction === 'asc' ? 'bg-slate-700 text-blue-400' : ''}`}>
              <span>Classificar de A a Z</span> <ChevronUp size={14}/>
            </button>
            <button onClick={() => handleSort('desc')} className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 flex items-center justify-between ${currentSort?.direction === 'desc' ? 'bg-slate-700 text-blue-400' : ''}`}>
              <span>Classificar de Z a A</span> <ChevronDown size={14}/>
            </button>
          </div>
          
          <div className="h-px bg-slate-700 my-2"></div>
          
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 mb-2">
            <Search size={14} className="text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..." className="bg-transparent text-xs outline-none w-full" autoFocus />
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-1 text-left">
            <label className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer text-xs">
              <input type="checkbox" checked={selectedValues.length === 0} onChange={toggleAll} className="rounded bg-slate-700 border-slate-600" />
              <span>(Selecionar Tudo)</span>
            </label>
            {filteredValues.map(val => (
              <label key={val} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer text-xs">
                <input type="checkbox" checked={selectedValues.length === 0 || selectedValues.includes(val)} onChange={() => toggleValue(val)} className="rounded bg-slate-700 border-slate-600 text-blue-500" />
                <span className="truncate">{val || '(Vazios)'}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Linha Table Row ─────────────────────────────────────────────────────────────
function LinhaRow({ linha, days, selYear, selMonth, todayDay, isCurrentMonth, onUpdate, onDelete, atestadosSet }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // driver cells: each day-slot has a motorista key like `dia_1`, `dia_2`, etc.
  // We store them in the linha.dias object
  const getDia = (d) => linha.dias?.[`d${d}`] || '';
  const setDia = (d, val) => onUpdate(linha.id, { dias: { ...(linha.dias || {}), [`d${d}`]: val } });

  return (
    <tr className="border-b border-slate-700/30 hover:bg-slate-800/40 group">
      {/* Delete (Moved to front for easier access) */}
      <td className="sticky left-0 z-10 bg-slate-900 border-r border-slate-700/50 px-1 py-1.5 min-w-[40px] max-w-[40px] no-print">
        {confirmDelete ? (
          <div className="flex flex-col gap-1 items-center">
            <button onClick={() => onDelete(linha.id)} className="text-red-400 hover:text-red-300 text-[10px] px-1 py-0.5 border border-red-400/40 rounded">OK</button>
            <button onClick={() => setConfirmDelete(false)} className="text-slate-400 text-[10px] px-1 py-0.5 border border-slate-600 rounded">X</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex justify-center w-full">
            <Trash2 size={14} />
          </button>
        )}
      </td>
      {/* Linha info cols */}
      <td className="sticky left-[40px] z-10 bg-slate-900 border-r border-slate-700/50 px-2 py-1.5 min-w-[130px]">
        <div className="flex items-center gap-1">
          <EditableCell value={linha.empresa} onChange={v => onUpdate(linha.id, { empresa: v })} placeholder="Empresa" />
        </div>
      </td>
      <td className="sticky left-[170px] z-10 bg-slate-900 border-r border-slate-700/50 px-2 py-1.5 min-w-[60px]">
        <EditableCell value={linha.horario} onChange={v => onUpdate(linha.id, { horario: v })} placeholder="HH:MM" />
      </td>
      <td className="sticky left-[230px] z-10 bg-slate-900 border-r border-slate-700/50 px-2 py-1.5 min-w-[280px]">
        <EditableCell value={linha.descricao || linha.lineCode} onChange={v => onUpdate(linha.id, { descricao: v })} placeholder="Descrição da linha" />
      </td>
      <td className="border-r border-slate-700/50 px-2 py-1.5 min-w-[110px]">
        <EditableCell value={linha.motoristaTitularName} onChange={v => onUpdate(linha.id, { motoristaTitularName: v })} placeholder="Titular" listId="motoristas-list" />
      </td>

      {/* Day cells */}
      {days.map(d => {
        const dateObj = new Date(selYear, selMonth, d);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const isToday = isCurrentMonth && d === todayDay;
        
        const cellValue = getDia(d);
        
        let bgClass = '';
        let isBeforeCreation = false;
        
        if (linha.dataCriacao) {
          const creationDate = new Date(linha.dataCriacao);
          // Set hours to 0 to compare just the date parts safely
          creationDate.setHours(0,0,0,0);
          dateObj.setHours(0,0,0,0);
          if (dateObj < creationDate) {
            isBeforeCreation = true;
          }
        }

        const isOff = !isBeforeCreation && (!cellValue.trim() || ['x', 'folga', 'não roda', 'nao roda'].includes(cellValue.trim().toLowerCase()));
        
        const cellValueUpper = (cellValue || '').toUpperCase().trim();
        const isAtestado = atestadosSet && cellValueUpper ? atestadosSet.has(`${cellValueUpper}_${d}`) : false;

        if (isBeforeCreation) bgClass = 'bg-slate-800/40 text-slate-600 cursor-not-allowed'; // Inactive style
        else if (isAtestado) bgClass = 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/50';
        else if (isOff) bgClass = 'bg-red-500/20 text-red-300';
        else if (isToday) bgClass = 'bg-blue-500/5';
        else if (isWeekend) bgClass = 'bg-slate-800/80';

        return (
          <td 
            key={d} 
            className={`border-r border-slate-700/20 px-1 py-1 min-w-[90px] ${bgClass}`}
          >
            {isBeforeCreation ? (
              <div className="text-center text-[10px] text-slate-600">—</div>
            ) : (
              <EditableCell value={cellValue} onChange={v => setDia(d, v)} placeholder="—" listId="motoristas-list" />
            )}
          </td>
        );
      })}
    </tr>
  );
}

export default function EscalaExcel() {
  const { linhas, drivers, atestados, updateLinha, addLinha, deleteLinha } = useApp();

  const now = new Date();
  const todayDay = now.getDate();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [searchDesc, setSearchDesc] = useState('');
  const [printDay, setPrintDay] = useState(todayDay);
  
  const [filterTurno, setFilterTurno] = useState('');
  const [showAddRow, setShowAddRow]   = useState(false);
  const [newLinha, setNewLinha] = useState({ empresa: '', horario: '', descricao: '', turno: 'Noite', pontoInicio: 'Garagem' });

  const [sortConfigs, setSortConfigs] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Days in selected month
  const daysInMonth = useMemo(
    () => new Date(selYear, selMonth + 1, 0).getDate(),
    [selMonth, selYear]
  );
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const isCurrentMonth = now.getMonth() === selMonth && now.getFullYear() === selYear;

  // Calculate medical leaves lookup map
  const atestadosSet = useMemo(() => {
    const set = new Set();
    if (!atestados) return set;
    atestados.forEach(a => {
      if (!a.startDate || !a.endDate || !a.driverName) return;
      const start = new Date(a.startDate + 'T00:00:00');
      const end = new Date(a.endDate + 'T23:59:59');
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(selYear, selMonth, d);
        if (dateObj >= start && dateObj <= end) {
          set.add(`${a.driverName.toUpperCase().trim()}_${d}`);
        }
      }
    });
    return set;
  }, [atestados, selMonth, selYear, daysInMonth]);

  // Extract unique companies and drivers for filters
  const empresasUnicas = useMemo(() => {
    const list = Array.from(new Set(linhas.map(l => l.empresa).filter(Boolean)));
    return list.sort();
  }, [linhas]);

  const motoristasUnicos = useMemo(() => {
    const fromDrivers = drivers.map(d => d.name).filter(Boolean);
    const fromTitulares = linhas.map(l => l.motoristaTitularName).filter(Boolean);
    const fromDias = linhas.flatMap(l => Object.values(l.dias || {})).filter(Boolean);
    const all = new Set([...fromDrivers, ...fromTitulares, ...fromDias]);
    return Array.from(all).sort();
  }, [drivers, linhas]);

  const filtered = useMemo(() => {
    return linhas.filter(l => {
      // Filtrar linhas que foram criadas em um mês posterior ao selecionado
      if (l.dataCriacao) {
        const creationDate = new Date(l.dataCriacao);
        const viewDate = new Date(selYear, selMonth + 1, 0); // Last day of selected month
        if (creationDate > viewDate) return false;
      }

      // 1. Column Filters (Menu Checkboxes)
      for (const [key, selectedVals] of Object.entries(columnFilters)) {
        if (!selectedVals || selectedVals.length === 0) continue;
        
        let val = '';
        if (key === 'empresa') val = l.empresa;
        else if (key === 'motorista') val = l.motoristaTitularName;
        else if (key === 'descricao') val = l.descricao;
        else if (key === 'horario') val = l.horario;
        else if (key.startsWith('dia_')) {
          const day = key.split('_')[1];
          val = l.dias?.[`d${day}`];
        }
        
        const stringVal = val || '';
        if (!selectedVals.includes(stringVal)) return false;
      }
      
      // 2. Descrição (busca rápida)
      const q = searchDesc.toLowerCase();
      if (q && !l.descricao?.toLowerCase().includes(q)) return false;
      
      // 3. Turno
      if (filterTurno && l.turno !== filterTurno) return false;

      return true;
    }).sort((a, b) => {
      // Apply multi-level sorts
      for (const config of sortConfigs) {
        const { key, direction } = config;
        let cmp = 0;

        if (key === 'empresa') {
          cmp = (a.empresa || '').localeCompare(b.empresa || '');
        } else if (key === 'motorista') {
          cmp = (a.motoristaTitularName || '').localeCompare(b.motoristaTitularName || '');
        } else if (key === 'descricao') {
          cmp = (a.descricao || a.lineCode || '').localeCompare(b.descricao || b.lineCode || '');
        } else if (key.startsWith('dia_')) {
          const day = key.split('_')[1];
          const aVal = (a.dias?.[`d${day}`] || '').toUpperCase();
          const bVal = (b.dias?.[`d${day}`] || '').toUpperCase();
          cmp = aVal.localeCompare(bVal);
        } else if (key === 'horario') {
          const getVal = (t) => {
            if (!t) return 0;
            let [h, m] = t.split(':').map(Number);
            if (isNaN(h)) return 0;
            if (h < 3 || (h === 3 && m === 0)) h += 24; // Treat 00:00 to 03:00 as the end of the day
            return h * 60 + (m || 0);
          };
          cmp = getVal(a.horario) - getVal(b.horario);
        }

        if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
      }
      return 0; // They are equal on all sorted columns
    });
  }, [linhas, columnFilters, searchDesc, filterTurno, selMonth, selYear, sortConfigs]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, searchDesc, filterTurno, selMonth, selYear, sortConfigs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    await addLinha({ 
      ...newLinha, 
      status: 'Escalado', 
      motoristaTitularName: '', 
      dias: {},
      dataCriacao: new Date().toISOString()
    });
    setNewLinha({ empresa: '', horario: '', descricao: '', turno: 'Noite', pontoInicio: 'Garagem' });
    setShowAddRow(false);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Autocomplete Datalist */}
      <datalist id="motoristas-list">
        {motoristasUnicos.map(m => <option key={m} value={m} />)}
      </datalist>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Escala Mensal — Estilo Excel</h2>
          <p className="text-slate-400 text-sm mt-0.5">Edite qualquer célula diretamente. Salva automaticamente no Firebase.</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-1">
            <span className="text-slate-400 text-xs">Imprimir Dia:</span>
            <select 
              value={printDay} 
              onChange={e => setPrintDay(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-sm font-semibold outline-none"
            >
              {days.map(d => <option key={d} value={d}>{String(d).padStart(2, '0')}</option>)}
            </select>
          </div>
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

        <div className="flex gap-3 w-full flex-wrap">
          {/* Descrição Global */}
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 flex-1 min-w-40">
            <Search size={15} className="text-slate-400" />
            <input value={searchDesc} onChange={e => setSearchDesc(e.target.value)}
              placeholder="Buscar descrição..."
              className="bg-transparent text-slate-200 text-sm outline-none w-full placeholder:text-slate-500" />
          </div>
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
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden no-print">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <table className="border-collapse text-xs w-full" style={{ minWidth: `${370 + days.length * 90}px` }}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-900 border-b-2 border-slate-700">
                <th className="sticky left-0 z-30 bg-slate-900 border-r border-slate-700 px-1 py-2 min-w-[40px] max-w-[40px] no-print"></th>
                
                <th className="sticky left-[40px] z-30 bg-slate-900 border-r border-slate-700 p-0 min-w-[130px]">
                  <HeaderMenu title="Empresa" colKey="empresa" activeMenu={activeMenu} setActiveMenu={setActiveMenu} sortConfigs={sortConfigs} setSortConfigs={setSortConfigs} columnFilters={columnFilters} setColumnFilters={setColumnFilters} linhas={linhas} getVal={l => l.empresa} extraClass="py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wide" />
                </th>
                
                <th className="sticky left-[170px] z-30 bg-slate-900 border-r border-slate-700 p-0 min-w-[60px]">
                  <HeaderMenu title="Hora" colKey="horario" activeMenu={activeMenu} setActiveMenu={setActiveMenu} sortConfigs={sortConfigs} setSortConfigs={setSortConfigs} columnFilters={columnFilters} setColumnFilters={setColumnFilters} linhas={linhas} getVal={l => l.horario} extraClass="py-2.5 px-2 text-slate-400 font-semibold uppercase tracking-wide" />
                </th>
                
                <th className="sticky left-[230px] z-30 bg-slate-900 border-r border-slate-700 p-0 min-w-[280px]">
                  <HeaderMenu title="Linha / Descrição" colKey="descricao" activeMenu={activeMenu} setActiveMenu={setActiveMenu} sortConfigs={sortConfigs} setSortConfigs={setSortConfigs} columnFilters={columnFilters} setColumnFilters={setColumnFilters} linhas={linhas} getVal={l => l.descricao} extraClass="py-2.5 px-2 text-slate-400 font-semibold uppercase tracking-wide" />
                </th>
                
                <th className="border-r border-slate-700 p-0 min-w-[110px]">
                  <HeaderMenu title="Titular" colKey="motorista" activeMenu={activeMenu} setActiveMenu={setActiveMenu} sortConfigs={sortConfigs} setSortConfigs={setSortConfigs} columnFilters={columnFilters} setColumnFilters={setColumnFilters} linhas={linhas} getVal={l => l.motoristaTitularName} extraClass="py-2.5 px-2 text-slate-400 font-semibold uppercase tracking-wide" />
                </th>

                {days.map(d => {
                  const dateObj = new Date(selYear, selMonth, d);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  const isToday = isCurrentMonth && d === todayDay;

                  return (
                    <th
                      key={d}
                      className={`border-r border-slate-700/50 p-0 min-w-[90px] ${
                        isToday ? 'bg-blue-500/10' : isWeekend ? 'bg-slate-800/80' : ''
                      }`}
                    >
                      <HeaderMenu 
                        title={
                          <div className="flex flex-col items-center">
                            <span className={isToday ? 'text-blue-400 font-semibold' : 'text-slate-300 font-semibold'}>{d}</span>
                            <span className={`font-normal text-[10px] ${isWeekend ? 'text-slate-500' : 'text-slate-400'}`}>
                              {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dateObj.getDay()]}
                            </span>
                          </div>
                        }
                        colKey={`dia_${d}`}
                        activeMenu={activeMenu} setActiveMenu={setActiveMenu} sortConfigs={sortConfigs} setSortConfigs={setSortConfigs} columnFilters={columnFilters} setColumnFilters={setColumnFilters} linhas={linhas} getVal={l => l.dias?.[`d${d}`]} 
                        extraClass="py-1 px-1"
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginated.map(linha => (
                <LinhaRow
                  key={linha.id}
                  linha={linha}
                  days={days}
                  drivers={drivers}
                  selYear={selYear}
                  selMonth={selMonth}
                  todayDay={todayDay}
                  isCurrentMonth={isCurrentMonth}
                  onUpdate={updateLinha}
                  onDelete={deleteLinha}
                  atestadosSet={atestadosSet}
                />
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={days.length + 5} className="py-12 text-center text-slate-500 text-sm">
                    Nenhuma linha encontrada. Clique em "Nova Linha" para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-slate-700/50 bg-slate-800/80 no-print">
            <span className="text-slate-400 text-xs">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} linhas
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors"
              >
                Anterior
              </button>
              <span className="text-slate-300 text-xs font-semibold px-2">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print header — only visible when printing */}
      <div className="print-only hidden">
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
          <h1 className="text-2xl font-bold font-sans">TRANS PINHO</h1>
          <h1 className="text-2xl font-bold font-sans">
            ESCALA {['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'][new Date(selYear, selMonth, printDay).getDay()]} {String(printDay).padStart(2, '0')}/{String(selMonth + 1).padStart(2, '0')}
          </h1>
        </div>

        <table className="w-full text-[9px] leading-tight border-collapse">
          <thead>
            <tr>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Empresa</th>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Filial</th>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Horário</th>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Descrição</th>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Motorista</th>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Confirmação</th>
              <th className="border border-black px-1.5 py-1 bg-gray-200 uppercase">Seq</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((linha, idx) => {
              // Hide from print if the print day is before the creation date
              if (linha.dataCriacao) {
                const creationDate = new Date(linha.dataCriacao);
                creationDate.setHours(0,0,0,0);
                const printDate = new Date(selYear, selMonth, printDay);
                printDate.setHours(0,0,0,0);
                if (printDate < creationDate) return null;
              }

              const motoristaDoDia = linha.dias?.[`d${printDay}`] || '';
              // Hide empty rows logic in print if toggle is on
              if (hideEmpty && !motoristaDoDia) return null;

              // Format time if it's >= 24h (e.g. 27:20 -> 03:20)
              let displayHorario = linha.horario;
              if (displayHorario) {
                const parts = displayHorario.split(':');
                if (parts.length === 2) {
                  let h = Number(parts[0]);
                  if (!isNaN(h) && h >= 24) {
                    displayHorario = `${String(h - 24).padStart(2, '0')}:${parts[1]}`;
                  }
                }
              }
              
              return (
                <tr key={linha.id}>
                  <td className="border border-black px-1.5 py-[2px] text-center font-semibold">{linha.empresa}</td>
                  <td className="border border-black px-1.5 py-[2px] text-center">GTI</td>
                  <td className="border border-black px-1.5 py-[2px] text-center">{displayHorario}</td>
                  <td className="border border-black px-1.5 py-[2px]">{linha.descricao}</td>
                  <td className="border border-black px-1.5 py-[2px] text-center font-bold">{motoristaDoDia}</td>
                  <td className="border border-black px-1.5 py-[2px] text-center"></td>
                  <td className="border border-black px-1.5 py-[2px] text-center text-gray-500">{idx + 1}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
