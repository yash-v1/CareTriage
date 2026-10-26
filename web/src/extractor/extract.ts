import type { BooleanField, Fields } from "../engine/types";
import { SYMPTOM_DICTIONARIES, type SupportedLang } from "./dictionaries";
import { isNegated } from "./negation";
import { replaceNumberWords } from "./numberWords";

export interface ExtractionResult { fields: Fields; lowConfidence: (keyof Fields)[]; }
const WEEKS_PER_MONTH = 4.35;

function addLowConfidence(list: (keyof Fields)[], field: keyof Fields): void {
  if (!list.includes(field)) list.push(field);
}
function escapeRegex(phrase: string): string { return phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function extractBloodPressure(text: string, fields: Fields, lowConfidence: (keyof Fields)[]): void {
  const bpMatch = /\b(\d{2,3})\s*(?:over|\/|by)\s*(\d{2,3})\b/i.exec(text);
  if (!bpMatch) return;
  const sys = Number(bpMatch[1]), dia = Number(bpMatch[2]);
  if (sys >= 40 && sys <= 300 && dia >= 20 && dia <= 200) {
    fields.sys = sys; fields.dia = dia;
    if (sys <= dia) { addLowConfidence(lowConfidence, "sys"); addLowConfidence(lowConfidence, "dia"); }
  }
}

function extractGestation(text: string, fields: Fields, lowConfidence: (keyof Fields)[]): void {
  const weeksPregMatch = /\b(\d{1,2})\s*(?:weeks?|wks?)\s*(?:of\s+)?(?:pregnant|pregnancy|gestation|amenorrhea)\b/i.exec(text) ?? /\b(?:pregnant|pregnancy|gestation)\s*(?:of|for|at|is)?\s*(\d{1,2})\s*(?:weeks?|wks?)\b/i.exec(text);
  if (weeksPregMatch) {
    const weeks = Number(weeksPregMatch[1]);
    if (weeks >= 1 && weeks <= 45) { fields.gestWeeks = weeks; fields.pregnant = true; return; }
  }
  const monthsPregMatch = /\b(\d{1,2})\s*(?:months?|mos?)\s*(?:of\s+)?(?:pregnant|pregnancy|gestation)\b/i.exec(text) ?? /\b(?:pregnant|pregnancy|gestation)\s*(?:of|for|at|is)?\s*(\d{1,2})\s*(?:months?|mos?)\b/i.exec(text);
  if (monthsPregMatch) {
    const months = Number(monthsPregMatch[1]);
    if (months >= 1 && months <= 10) {
      fields.gestWeeks = Math.round(months * WEEKS_PER_MONTH); fields.pregnant = true;
      addLowConfidence(lowConfidence, "gestWeeks"); return;
    }
  }
  if (/\b(?:pregnant|pregnancy|antenatal|gravida|maternal)\b/i.test(text)) {
    const bareWeeks = /\b(\d{1,2})\s*(?:weeks?|wks?)(?!\s*(?:old|baby|infant|child))\b/i.exec(text);
    if (bareWeeks) {
      const weeks = Number(bareWeeks[1]);
      if (weeks >= 1 && weeks <= 45) { fields.gestWeeks = weeks; fields.pregnant = true; }
    }
  }
}

function extractAge(text: string, fields: Fields, lowConfidence: (keyof Fields)[]): void {
  const combinedMatch = /\b(\d{1,2})\s*(?:years?|yrs?)\s*(?:and\s+)?(\d{1,2})\s*(?:months?|mos?)\b/i.exec(text);
  if (combinedMatch) {
    const totalMonths = Number(combinedMatch[1]) * 12 + Number(combinedMatch[2]);
    if (totalMonths >= 0 && totalMonths <= 1440) { fields.ageMonths = totalMonths; return; }
  }
  const halfYearMatch = /\b(\d{1,2})\s+and\s+a\s+half\s*(?:years?|yrs?)\b/i.exec(text);
  if (halfYearMatch) { fields.ageMonths = Number(halfYearMatch[1]) * 12 + 6; return; }
  const monthRegex = /\b(\d{1,3})\s*(?:months?|mos?)(?!\s*(?:of\s+)?(?:pregnant|pregnancy|gestation))\b/gi;
  let mMatch: RegExpExecArray | null;
  while ((mMatch = monthRegex.exec(text)) !== null) {
    const before = text.slice(Math.max(0, mMatch.index - 20), mMatch.index);
    if (/\b(?:pregnant|pregnancy|gestation)\s*(?:of|for|at|is)?\s*$/i.test(before)) continue;
    const months = Number(mMatch[1]);
    if (months >= 0 && months <= 1440) { fields.ageMonths = months; return; }
  }
  const yearMatch = /\b(\d{1,3}(?:\.\d+)?)\s*(?:years?|yrs?|y\/o|yo)\b/i.exec(text);
  if (yearMatch) {
    const totalMonths = Math.round(Number(yearMatch[1]) * 12);
    if (totalMonths >= 0 && totalMonths <= 1440) { fields.ageMonths = totalMonths; return; }
  }
  const weeksOldMatch = /\b(\d{1,2})\s*(?:weeks?|wks?)\s*old\b/i.exec(text);
  if (weeksOldMatch) {
    fields.ageMonths = Math.floor(Number(weeksOldMatch[1]) / WEEKS_PER_MONTH);
    addLowConfidence(lowConfidence, "ageMonths");
  }
}

function extractRespiratoryRate(text: string, fields: Fields): void {
  const rrMatch = /\b(?:rr|respiratory\s+rate|breathing\s+rate|respiration\s+rate)\s*(?:is|of|:|=)?\s*(\d{1,3})\b/i.exec(text) ?? /\b(\d{1,3})\s*(?:breaths?\s*(?:per\s*minute|\/?\s*min|a\s*minute))\b/i.exec(text);
  if (rrMatch) {
    const rr = Number(rrMatch[1]);
    if (rr >= 5 && rr <= 120) fields.rr = rr;
  }
}

function extractFeverDays(text: string, fields: Fields, lowConfidence: (keyof Fields)[]): void {
  if (/\bafebrile\b/i.test(text)) return;
  const durationMatch = /\b(?:high\s+)?fever\s*(?:for|since|of|from|past|last)?\s*(?:the\s+last\s+|the\s+past\s+)?(\d{1,2})\s*days?\b/i.exec(text) ?? /\b(\d{1,2})\s*days?\s*(?:of\s+)?(?:high\s+)?fever\b/i.exec(text) ?? /\bfebrile\s*(?:for|since)?\s*(\d{1,2})\s*days?\b/i.exec(text);
  if (durationMatch && !isNegated(text, durationMatch.index, durationMatch.index + durationMatch[0].length)) {
    const days = Number(durationMatch[1]);
    if (days >= 0 && days <= 60) { fields.feverDays = days; return; }
  }
  const bareFever = /\b(fever|febrile|high\s+temperature)\b/i.exec(text);
  if (bareFever && !isNegated(text, bareFever.index, bareFever.index + bareFever[0].length)) {
    addLowConfidence(lowConfidence, "feverDays");
  }
}

function extractSymptoms(text: string, lang: SupportedLang, fields: Fields, lowConfidence: (keyof Fields)[]): void {
  const dict = SYMPTOM_DICTIONARIES[lang];
  const booleanFields = Object.keys(dict) as BooleanField[];
  for (const field of booleanFields) {
    const pattern = dict[field];
    let sawPositive = false, sawNegative = false;
    for (const phrase of pattern.positive) {
      const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, "gi");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        if (pattern.selfNegating) sawPositive = true;
        else if (isNegated(text, match.index, match.index + match[0].length)) sawNegative = true;
        else sawPositive = true;
      }
    }
    if (pattern.healthyOverride) {
      for (const phrase of pattern.healthyOverride) {
        const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, "gi");
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
          if (isNegated(text, match.index, match.index + match[0].length)) sawPositive = true;
          else sawNegative = true;
        }
      }
    }
    if (sawPositive && sawNegative) { fields[field] = true; addLowConfidence(lowConfidence, field); }
    else if (sawPositive) fields[field] = true;
    else if (sawNegative) {
      if (field === "pregnant" && fields.gestWeeks !== undefined) addLowConfidence(lowConfidence, "pregnant");
      else fields[field] = false;
    }
  }
}

export function extract(transcript: string, lang: SupportedLang = "en"): ExtractionResult {
  const fields: Fields = {}; const lowConfidence: (keyof Fields)[] = [];
  if (!transcript || !transcript.trim()) return { fields, lowConfidence };
  const normalized = replaceNumberWords(transcript.trim());
  extractBloodPressure(normalized, fields, lowConfidence);
  extractGestation(normalized, fields, lowConfidence);
  extractAge(normalized, fields, lowConfidence);
  extractRespiratoryRate(normalized, fields);
  extractFeverDays(normalized, fields, lowConfidence);
  extractSymptoms(normalized, "en", fields, lowConfidence);
  if (lang !== "en") extractSymptoms(normalized, lang, fields, lowConfidence);
  return { fields, lowConfidence };
}