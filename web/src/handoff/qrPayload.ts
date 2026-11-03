import type { TriageResponse } from "../engine/types";

// Maps our internal boolean fields to the agreed 2-4 letter symptom codes
const SYMPTOM_CODES: Record<string, string> = {
  headache: "HA",
  blurredVision: "BLUR",
  chestIndrawing: "CIND",
  stridor: "STRI",
  unableToFeed: "NOFD",
  bleeding: "BLD",
  lethargic: "LETH",
  convulsions: "CONV",
  vomitingEverything: "VOM",
  wheeze: "WHZ",
};

export function generateQrPayload(result: TriageResponse): string {
  const { fields, tier, rulesFired, requestId } = result;

  // Base required fields (v, id, t, tier, rules)
  const payload: Record<string, any> = {
    v: 1,
    id: requestId, 
    t: Math.floor(Date.now() / 1000), // Unix seconds
    tier: tier,
    rules: rulesFired.map((r) => r.id),
  };

  // Optional numeric fields (only include if known)
  if (fields.ageMonths != null) payload.am = fields.ageMonths;
  if (fields.gestWeeks != null) payload.gw = fields.gestWeeks;
  if (fields.sys != null && fields.dia != null) payload.bp = [fields.sys, fields.dia];
  if (fields.rr != null) payload.rr = fields.rr;
  if (fields.feverDays != null) payload.fd = fields.feverDays;

  // Collect true boolean symptoms
  const sx: string[] = [];
  for (const [field, code] of Object.entries(SYMPTOM_CODES)) {
    if (fields[field as keyof typeof fields] === true) {
      sx.push(code);
    }
  }
  if (sx.length > 0) {
    payload.sx = sx;
  }

  // Stringify the compact JSON to feed directly into the QR generator
  return JSON.stringify(payload);
}