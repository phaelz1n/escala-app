// src/lib/seedData.js
// Seeds Firestore with mock data on first run (only if collections are empty)

import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { initialDrivers, initialSchedules } from '../data/mockData';

async function collectionIsEmpty(name) {
  const snap = await getDocs(collection(db, name));
  return snap.empty;
}

export async function seedIfEmpty() {
  if (!isFirebaseConfigured) return;

  try {
    const [driversEmpty, linhasEmpty, toksEmpty] = await Promise.all([
      collectionIsEmpty('motoristas'),
      collectionIsEmpty('linhas'),
      collectionIsEmpty('toks'),
    ]);

    const batch = writeBatch(db);
    const now = serverTimestamp();

    // Seed motoristas
    if (driversEmpty) {
      initialDrivers.forEach(d => {
        const ref = doc(collection(db, 'motoristas'));
        batch.set(ref, {
          name:      d.name,
          phone:     d.phone,
          categoria: d.categoria,
          status:    d.status,
          createdAt: now,
        });
      });
    }

    // Seed linhas (unique lines from schedules)
    if (linhasEmpty) {
      const seen = new Set();
      initialSchedules.forEach(s => {
        if (seen.has(s.lineId)) return;
        seen.add(s.lineId);
        const ref = doc(collection(db, 'linhas'));
        batch.set(ref, {
          lineCode:            s.lineId,
          empresa:             s.empresa,
          descricao:           s.descricao,
          horario:             s.horario,
          pontoInicio:         s.pontoInicio,
          turno:               s.turno,
          motoristaTitularName: s.motorista || '',
          createdAt:           now,
        });
      });
    }

    // Seed toks (lines with pontoInicio = 'Linha')
    if (toksEmpty) {
      const today = new Date().toISOString().split('T')[0];
      initialSchedules
        .filter(s => s.pontoInicio === 'Linha')
        .forEach(s => {
          const ref = doc(collection(db, 'toks'));
          batch.set(ref, {
            lineId:          s.lineId,
            empresa:         s.empresa,
            descricao:       s.descricao,
            horarioChamada:  s.horario,
            horarioInicio:   s.horario,
            motoristaName:   s.motorista || '',
            telefone:        '',
            status:          'Pendente',
            date:            today,
            pontoInicio:     'Linha',
            createdAt:       now,
          });
        });
    }

    await batch.commit();
    console.log('[ScalaOp] Firestore seeded successfully.');
  } catch (e) {
    console.error('[ScalaOp] Seed error:', e);
  }
}
