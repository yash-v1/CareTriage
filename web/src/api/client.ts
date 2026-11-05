import { RULES } from "../engine/loadRules";
import { triageOffline } from "../engine/evaluate";
import type { Fields, TriageResponse } from "../engine/types";

export async function submitTriage(
  fields: Fields,
  lowConfidence: string[] = []
): Promise<TriageResponse> {
  const requestId = "req-" + Math.random().toString(36).substring(2, 9);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = triageOffline(requestId, fields, RULES, lowConfidence);
      resolve(response);
    }, 400);
  });
}

// Future backend URL for background syncing
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function pushToBackend(record: TriageResponse) {
  const response = await fetch(`${API_BASE}/api/triage/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  
  if (!response.ok) {
    throw new Error(`Backend rejected sync with status ${response.status}`);
  }
  
  return await response.json();
}