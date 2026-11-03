import { RULES } from "../engine/loadRules";
import { triageOffline } from "../engine/evaluate";
import type { Fields, TriageResponse } from "../engine/types";

// For the hackathon, we simulate a small network delay to make the UI feel real,
// then immediately run the offline engine. Once Kirit's gateway is ready, 
// we will add the fetch() call here and use triageOffline as the .catch() fallback.
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