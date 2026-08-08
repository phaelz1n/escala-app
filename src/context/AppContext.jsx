// src/context/AppContext.jsx
// Central state — reads from Firestore (or local mock when offline)
// Exposes: drivers, schedules, toks, atestados, vacations
// Business logic: registerMedicalLeave (cascades to schedules + driver status)

import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  fsAdd, fsUpdate, fsDelete, fsSet, fsBatchWrite, fsListen,
  where,
} from '../lib/firestoreHelpers';
import { isFirebaseConfigured } from '../lib/firebase';
import { seedIfEmpty } from '../lib/seedData';
import {
  initialDrivers,
  initialSchedules,
  initialVacations,
  initialMedicalLeaves,
} from '../data/mockData';

const AppContext = createContext(null);

// ─── Helper: today as YYYY-MM-DD ─────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

export function AppProvider({ children, user }) {
  // ── State ─────────────────────────────────────────────────────────────────
  const isAdmin = user?.email === 'operacional4@transpinho.com';
  const [drivers,      setDrivers]      = useState(initialDrivers);
  const [linhas,       setLinhas]       = useState(initialSchedules);
  const [toks,         setToks]         = useState(
    initialSchedules.filter(s => s.pontoInicio === 'Linha').map((s, i) => ({
      ...s, id: `TOK${i+1}`, status: 'Pendente', date: todayStr(),
    }))
  );
  const [atestados,    setAtestados]    = useState(initialMedicalLeaves);
  const [vacations,    setVacations]    = useState(initialVacations);
  const [alerts,       setAlerts]       = useState([]);
  const [logs,         setLogs]         = useState([]);
  const [fbReady,      setFbReady]      = useState(false);

  // ── Firebase listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    seedIfEmpty().then(() => setFbReady(true));

    const unsubs = [
      fsListen('motoristas', setDrivers),
      fsListen('linhas',     setLinhas),
      fsListen('toks',       (docs) => setToks(docs.filter(d => d.date === todayStr()))),
      fsListen('atestados',  setAtestados),
      fsListen('ferias',     setVacations),
    ];
    
    if (isAdmin) {
      unsubs.push(fsListen('logs', setLogs));
    }

    return () => unsubs.forEach(u => u());
  }, []);

  // ── Alert helpers ─────────────────────────────────────────────────────────
  const addAlert = useCallback((message, type = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 6000);
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // ── Logger ────────────────────────────────────────────────────────────────
  const addLog = useCallback(async (action, details) => {
    if (!isFirebaseConfigured || !user) return;
    try {
      await fsAdd('logs', {
        action,
        details,
        user: user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to write log', e);
    }
  }, [user]);

  // ── Driver CRUD ───────────────────────────────────────────────────────────
  const addDriver = useCallback(async (data) => {
    if (isFirebaseConfigured) {
      await fsAdd('motoristas', data);
    } else {
      setDrivers(prev => [...prev, { ...data, id: Date.now() }]);
    }
    addAlert(`Motorista ${data.name} cadastrado!`, 'success');
    addLog('Adicionar Motorista', `Adicionou o motorista ${data.name}`);
  }, [addAlert, addLog]);

  const updateDriver = useCallback(async (id, data) => {
    if (isFirebaseConfigured) {
      await fsUpdate('motoristas', id, data);
    } else {
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    }
    addAlert('Motorista atualizado!', 'success');
    addLog('Editar Motorista', `Atualizou o motorista ${data.name || id}`);
  }, [addAlert, addLog]);

  const deleteDriver = useCallback(async (id) => {
    const d = drivers.find(x => x.id === id);
    if (isFirebaseConfigured) {
      await fsDelete('motoristas', id);
    } else {
      setDrivers(prev => prev.filter(d => d.id !== id));
    }
    addAlert(`${d?.name} removido.`, 'warning');
    addLog('Remover Motorista', `Removeu o motorista ${d?.name || id}`);
  }, [drivers, addAlert, addLog]);

  // ── Linha CRUD ────────────────────────────────────────────────────────────
  const addLinha = useCallback(async (data) => {
    if (isFirebaseConfigured) {
      await fsAdd('linhas', data);
    } else {
      setLinhas(prev => [...prev, { ...data, id: `ESC${Date.now()}` }]);
    }
    addAlert('Linha adicionada!', 'success');
    addLog('Adicionar Linha', `Adicionou a linha ${data.descricao || data.horario}`);
  }, [addAlert, addLog]);

  const updateLinha = useCallback(async (id, data) => {
    if (isFirebaseConfigured) {
      await fsUpdate('linhas', id, data);
    } else {
      setLinhas(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    }
    addLog('Editar Linha', `Atualizou a linha ${id}`);
  }, [addLog]);

  const deleteLinha = useCallback(async (id) => {
    if (isFirebaseConfigured) {
      await fsDelete('linhas', id);
    } else {
      setLinhas(prev => prev.filter(l => l.id !== id));
    }
    addAlert('Linha removida.', 'warning');
    addLog('Remover Linha', `Removeu a linha ${id}`);
  }, [addAlert, addLog]);

  // ── Tok CRUD ──────────────────────────────────────────────────────────────
  const addTok = useCallback(async (data) => {
    const tokData = { ...data, date: data.date || todayStr(), status: 'Pendente' };
    if (isFirebaseConfigured) {
      await fsAdd('toks', tokData);
    } else {
      setToks(prev => [...prev, { ...tokData, id: `TOK${Date.now()}` }]);
    }
    addAlert('Tok adicionado!', 'success');
    addLog('Adicionar Tok', `Adicionou o tok ${data.empresa} - ${data.horarioChamada}`);
  }, [addAlert, addLog]);

  const updateTok = useCallback(async (id, data) => {
    if (isFirebaseConfigured) {
      await fsUpdate('toks', id, data);
    } else {
      setToks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    }
    addLog('Editar Tok', `Atualizou o tok ${id} para ${data.status || 'editado'}`);
  }, [addLog]);

  const deleteTok = useCallback(async (id) => {
    if (isFirebaseConfigured) {
      await fsDelete('toks', id);
    } else {
      setToks(prev => prev.filter(t => t.id !== id));
    }
    addAlert('Tok removido.', 'warning');
    addLog('Remover Tok', `Removeu o tok ${id}`);
  }, [addAlert, addLog]);

  // ── Substituição direta ───────────────────────────────────────────────────
  const applySubstitute = useCallback(async (scheduleId, substituteName) => {
    await updateLinha(scheduleId, { motoristaTitularName: substituteName, status: 'Substituído' });
    addAlert(`${substituteName} alocado na linha!`, 'success');
  }, [updateLinha, addAlert]);

  // ── Sugestão de substituto ────────────────────────────────────────────────
  const suggestSubstitute = useCallback((driverName, horario, linhaTurno) => {
    // Basic recommendation: find active reserve not scheduled at the same time and matching the shift (turno)
    const scheduledNow = linhas
      .filter(s => s.motoristaTitularName !== driverName && s.horario === horario)
      .map(s => s.motoristaTitularName);
    return drivers.find(
      d => d.categoria === 'Reserva' &&
           d.status === 'Ativo' &&
           (!linhaTurno || !d.turno || d.turno === linhaTurno) &&
           !scheduledNow.includes(d.name) &&
           d.name !== driverName
    ) || null;
  }, [drivers, linhas]);

  const getDriverByName = useCallback(
    (name) => drivers.find(d => d.name === name),
    [drivers]
  );

  // ── Atestados ─────────────────────────────────────────────────────────────
  const registerMedicalLeave = useCallback(async (leave) => {
    const { driverName } = leave;

    // Affected lines
    const affected = linhas.filter(s => s.motoristaTitularName === driverName);
    const suggestions = affected.map(s => {
      const sub = suggestSubstitute(driverName, s.horario, s.turno);
      return { schedule: s, substitute: sub };
    }).filter(x => x.substitute);

    const newLeave = { ...leave, suggestions };

    if (isFirebaseConfigured) {
      // Batch: update driver status + all affected lines
      const ops = [
        ...drivers
          .filter(d => d.name === driverName)
          .map(d => ({ collection: 'motoristas', id: d.id, type: 'update', data: { status: 'Atestado' } })),
        ...affected.map(l => ({
          collection: 'linhas', id: l.id, type: 'update',
          data: { motoristaTitularName: null, status: 'Descoberto' },
        })),
      ];
      await fsBatchWrite(ops);
      await fsAdd('atestados', newLeave);
    } else {
      setDrivers(prev => prev.map(d => d.name === driverName ? { ...d, status: 'Atestado' } : d));
      setLinhas(prev => prev.map(l =>
        l.motoristaTitularName === driverName
          ? { ...l, motoristaTitularName: null, status: 'Descoberto' }
          : l
      ));
      setAtestados(prev => [...prev, { ...newLeave, id: `AT${Date.now()}` }]);
    }

    addAlert(`⚠️ Atestado lançado para ${driverName}. ${affected.length} linha(s) descoberta(s)!`, 'error');
    if (suggestions.length > 0) {
      addAlert(`💡 Substituto sugerido: ${suggestions[0].substitute.name}`, 'info');
    }
    addLog('Registrar Atestado', `Registrou atestado para ${driverName} (${leave.startDate} a ${leave.endDate})`);
    return newLeave;
  }, [drivers, linhas, suggestSubstitute, addAlert, addLog]);

  const cancelMedicalLeave = useCallback(async (leaveId) => {
    const leave = atestados.find(l => l.id === leaveId);
    if (!leave) return;

    if (isFirebaseConfigured) {
      const ops = drivers
        .filter(d => d.name === leave.driverName)
        .map(d => ({ collection: 'motoristas', id: d.id, type: 'update', data: { status: 'Ativo' } }));
      await fsBatchWrite(ops);
      await fsDelete('atestados', leaveId);
    } else {
      setDrivers(prev => prev.map(d => d.name === leave.driverName ? { ...d, status: 'Ativo' } : d));
      setAtestados(prev => prev.filter(l => l.id !== leaveId));
    }
    addAlert(`Atestado de ${leave.driverName} cancelado.`, 'warning');
    addLog('Cancelar Atestado', `Cancelou o atestado de ${leave.driverName}`);
  }, [atestados, drivers, addAlert, addLog]);

  // ── Férias ────────────────────────────────────────────────────────────────
  const registerVacation = useCallback(async (vacation) => {
    const { driverName, driverId, substitutoName } = vacation;

    if (isFirebaseConfigured) {
      const ops = [
        { collection: 'motoristas', id: driverId, type: 'update', data: { status: 'Férias' } },
        ...linhas
          .filter(l => l.motoristaTitularName === driverName)
          .map(l => ({
            collection: 'linhas', id: l.id, type: 'update',
            data: { motoristaTitularName: substitutoName || null, status: 'Férias/Substituído' },
          })),
      ];
      await fsBatchWrite(ops);
      await fsAdd('ferias', vacation);
    } else {
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'Férias' } : d));
      if (substitutoName) {
        setLinhas(prev => prev.map(l =>
          l.motoristaTitularName === driverName
            ? { ...l, motoristaTitularName: substitutoName, status: 'Férias/Substituído' }
            : l
        ));
      }
      setVacations(prev => [...prev, { ...vacation, id: `FER${Date.now()}`, status: 'Agendado' }]);
    }
    addAlert(`Férias de ${driverName} programadas!`, 'success');
    addLog('Programar Férias', `Programou férias para ${driverName} (${vacation.startDate} a ${vacation.endDate})`);
  }, [linhas, addAlert, addLog]);

  const cancelVacation = useCallback(async (vacationId) => {
    const vac = vacations.find(v => v.id === vacationId);
    if (!vac) return;

    if (isFirebaseConfigured) {
      await fsUpdate('motoristas', vac.driverId, { status: 'Ativo' });
      await fsDelete('ferias', vacationId);
    } else {
      setDrivers(prev => prev.map(d => d.id === vac.driverId ? { ...d, status: 'Ativo' } : d));
      setVacations(prev => prev.filter(v => v.id !== vacationId));
    }
    addAlert(`Férias de ${vac.driverName} canceladas.`, 'warning');
    addLog('Cancelar Férias', `Cancelou férias de ${vac.driverName}`);
  }, [vacations, addAlert, addLog]);

  // ── Dashboard stats ───────────────────────────────────────────────────────
  const dashboardStats = useMemo(() => ({
    totalMotoristas:      drivers.length,
    motoristaAtivos:      drivers.filter(d => d.status === 'Ativo').length,
    motoristaAfastados:   drivers.filter(d => d.status === 'Atestado').length,
    motoristaFerias:      drivers.filter(d => d.status === 'Férias').length,
    motoristaFolga:       drivers.filter(d => d.status === 'Folga').length,
    motoristaReserva:     drivers.filter(d => d.categoria === 'Reserva').length,
    linhasEscaladas:      linhas.filter(s => s.status === 'Escalado').length,
    linhasDescobertas:    linhas.filter(s => s.status === 'Descoberto').length,
    totalLinhas:          linhas.length,
    tokDoGuarda:          toks.length,
    tokConfirmados:       toks.filter(t => t.status === 'Confirmado').length,
    taxaCobertura: linhas.length > 0
      ? Math.round((linhas.filter(s => s.status !== 'Descoberto').length / linhas.length) * 100)
      : 100,
  }), [drivers, linhas, toks]);

  const value = {
    user, isAdmin, logs,
    drivers, linhas, toks, atestados, vacations, alerts,
    dashboardStats, fbReady, isFirebaseConfigured,
    addDriver, updateDriver, deleteDriver,
    addLinha, updateLinha, deleteLinha,
    addTok, updateTok, deleteTok,
    registerMedicalLeave, cancelMedicalLeave, applySubstitute,
    registerVacation, cancelVacation,
    getDriverByName, suggestSubstitute,
    dismissAlert, addAlert,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
