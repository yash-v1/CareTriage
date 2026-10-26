// Types for the offline triage engine. Field names match shared/schemas/fields.schema.json
// and shared/rules.json exactly. If you rename one, change the contract first.

export type Tier = "GREEN" | "YELLOW" | "RED";

/** Boolean fields the worker confirms. */
export type BooleanField =
  | "pregnant"
  | "headache"
  | "blurredVision"
  | "chestIndrawing"
  | "stridor"
  | "unableToFeed"
  | "lethargic"
  | "convulsions"
  | "vomitingEverything"
  | "wheeze"
  | "bleeding";

/** Numeric fields the worker confirms. */
export type NumberField = "gestWeeks" | "sys" | "dia" | "ageMonths" | "rr" | "feverDays";

/** Any field may be missing or null. Missing never means false or 0. */
export type Fields = {
  [K in BooleanField]?: boolean | null;
} & {
  [K in NumberField]?: number | null;
};

export type Operator = "gte" | "gt" | "lte" | "lt" | "eq";

/** One leaf test, for example { sys: { gte: 140 } } or { headache: true }. */
export type Leaf = { [field: string]: boolean | { [op in Operator]?: number } };

export type Condition = { all: Condition[] } | { any: Condition[] } | Leaf;

export interface Rule {
  id: string;
  track: string;
  tier: Tier;
  experimental?: boolean;
  when: Condition;
  flag: string;
  action: string;
  source: string;
}

export interface RulesFile {
  version: number | string;
  tierOrder: Tier[];
  rules: Rule[];
  default: { id: string; tier: "GREEN"; flag: string; action: string; source: string };
}

/** What a fired rule looks like in the response (the `when` part is not sent). */
export interface FiredRule {
  id: string;
  tier: Tier;
  flag: string;
  action: string;
  source: string;
}

/** The core of a result, produced by evaluate(). */
export interface EvalResult {
  tier: Tier;
  rulesFired: FiredRule[];
  /** Present only when no rule fired. */
  defaultApplied?: RulesFile["default"];
  /** Fields whose absence could hide a danger. The UI asks for these before showing GREEN. */
  missingForSafety: string[];
  rulesVersion: number | string;
}

/** Same shape as shared/schemas/triage-response.schema.json. */
export interface TriageResponse extends EvalResult {
  requestId: string;
  fields: Fields;
  lowConfidence: string[];
  disclaimer: string;
}