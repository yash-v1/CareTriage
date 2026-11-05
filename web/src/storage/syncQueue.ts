import { getUnsyncedRecords, markAsSynced } from './db';
import { pushToBackend } from '../api/client';

export async function runSyncQueue() {
  // 1. Abort immediately if the browser knows we are offline
  if (!navigator.onLine) {
    return { success: 0, failed: 0, offline: true };
  }

  // 2. Grab everything sitting in IndexedDB that hasn't synced
  const unsynced = await getUnsyncedRecords();
  if (unsynced.length === 0) {
    return { success: 0, failed: 0, offline: false };
  }

  let successCount = 0;
  let failCount = 0;

  // 3. Push to Python backend sequentially
  for (const record of unsynced) {
    try {
      await pushToBackend(record);
      await markAsSynced(record.requestId);
      successCount++;
    } catch (error) {
      console.error(`Failed to sync record ${record.requestId}`, error);
      failCount++;
    }
  }

  return { success: successCount, failed: failCount, offline: false };
}