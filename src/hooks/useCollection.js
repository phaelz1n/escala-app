// src/hooks/useCollection.js
// Real-time Firestore collection listener with offline fallback

import { useState, useEffect } from 'react';
import { fsListen } from '../lib/firestoreHelpers';
import { isFirebaseConfigured } from '../lib/firebase';

/**
 * @param {string} collectionName
 * @param {Array}  queryConstraints  - Firestore query constraints (where, orderBy, etc.)
 * @param {Array}  fallbackData      - Local data used when Firebase is not configured
 */
export function useCollection(collectionName, queryConstraints = [], fallbackData = []) {
  const [data, setData]       = useState(fallbackData);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setData(fallbackData);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = fsListen(
      collectionName,
      (docs) => {
        setData(docs);
        setLoading(false);
      },
      queryConstraints
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error };
}
