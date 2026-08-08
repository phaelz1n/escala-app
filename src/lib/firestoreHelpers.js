// src/lib/firestoreHelpers.js
// Generic Firestore CRUD helpers

import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, serverTimestamp,
  getDocs, writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// ─── Generic helpers ────────────────────────────────────────────────────────

export async function fsAdd(collectionName, data) {
  if (!isFirebaseConfigured) return null;
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fsSet(collectionName, docId, data) {
  if (!isFirebaseConfigured) return;
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function fsUpdate(collectionName, docId, data) {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function fsDelete(collectionName, docId) {
  if (!isFirebaseConfigured) return;
  await deleteDoc(doc(db, collectionName, docId));
}

export function fsListen(collectionName, callback, queryConstraints = []) {
  if (!isFirebaseConfigured) return () => {};
  const ref = collection(db, collectionName);
  const q = queryConstraints.length > 0 ? query(ref, ...queryConstraints) : ref;
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

export async function fsGetAll(collectionName) {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Batch helpers ───────────────────────────────────────────────────────────

export async function fsBatchWrite(operations) {
  if (!isFirebaseConfigured) return;
  const batch = writeBatch(db);
  for (const op of operations) {
    const ref = doc(db, op.collection, op.id);
    if (op.type === 'set')    batch.set(ref, { ...op.data, updatedAt: serverTimestamp() }, { merge: true });
    if (op.type === 'update') batch.update(ref, { ...op.data, updatedAt: serverTimestamp() });
    if (op.type === 'delete') batch.delete(ref);
  }
  await batch.commit();
}

// ─── Re-exports ───────────────────────────────────────────────────────────────
export { where, orderBy, serverTimestamp };
