import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { TriageResponse } from '../engine/types';

interface CareTriageDB extends DBSchema {
  patients: {
    key: string;
    value: TriageResponse & { timestamp: number; synced: boolean };
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<CareTriageDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<CareTriageDB>('caretriage-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('patients', { keyPath: 'requestId' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

export async function savePatientRecord(result: TriageResponse) {
  const db = await initDB();
  await db.put('patients', { 
    ...result, 
    timestamp: Date.now(),
    synced: false 
  });
}

export async function getOfflineRecords() {
  const db = await initDB();
  return await db.getAllFromIndex('patients', 'by-timestamp');
}

export async function getUnsyncedRecords() {
  const db = await initDB();
  // Fetch all records and filter for those that haven't been synced
  const allRecords = await db.getAllFromIndex('patients', 'by-timestamp');
  return allRecords.filter(record => !record.synced);
}

export async function markAsSynced(requestId: string) {
  const db = await initDB();
  const record = await db.get('patients', requestId);
  if (record) {
    record.synced = true;
    await db.put('patients', record);
  }
}