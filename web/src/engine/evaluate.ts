// The offline triage engine. Pure functions: no UI, no network, no clock.
// The tier comes only from the rules in shared/rules.json (see docs/contract.md section 1).

import type {
  Condition,
  EvalResult,
  Fields,
  Operator,
  RulesFile,
  Tier,
  TriageResponse,
} from "./types";

export const DISCLAIMER =
  "Decision support only. Follow local protocol and clinical judgement.";

const OPERATORS: Record<Operator, (value: number, limit: number) => boolean> = {
  gte: (v, n) => v >= n,
  gt: (v, n) => v > n,
  lte: (v, n) => v <= n,
  lt: (v, n) => v < n,
  eq: (v, n) => v === n,
};

/** Fields that, when missing, could make a GREEN result falsely reassuring. */
const SAFETY_FIELDS = ["ageMonths"] as const;

// Explicit guards, because a leaf condition has an index signature and TypeScript's
// plain `"all" in condition` check would not narrow the union reliably.
function isAll(condition: Condition): condition is { all: Condition[] } {
  return "all" in condition;
}
function isAny(condition: Condition): condition is { any: Condition[] } {
  return "any" in condition;
}

/**
 * Does one condition hold for these fields?
 * A test on a missing or null field is false (contract rule 3). This is what keeps
 * adults and "age unknown" out of the pediatric rules without any special case.
 */
export function matches(condition: Condition, fields: Fields): boolean {
  if (isAll(condition)) return condition.all.every((c) => matches(c, fields));
  if (isAny(condition)) return condition.any.some((c) => matches(c, fields));

  const entries = Object.entries(condition);
  if (entries.length !== 1) {
    throw new Error(`A leaf condition must test exactly one field: ${JSON.stringify(condition)}`);
  }
  const [field, expected] = entries[0];
  const actual = (fields as Record<string, unknown>)[field];
  if (actual === undefined || actual === null) return false;

  if (typeof expected === "boolean") return actual === expected;

  if (typeof actual !== "number") return false;
  const ops = Object.entries(expected);
  if (ops.length !== 1) {
    throw new Error(`A numeric test must use exactly one operator: ${JSON.stringify(condition)}`);
  }
  const [op, limit] = ops[0] as [Operator, number];
  const test = OPERATORS[op];
  if (!test) throw new Error(`Unknown operator "${op}"`);
  return test(actual, limit);
}

/** Run every rule, collect all that match, and take the highest tier. */
export function evaluate(fields: Fields, rulesFile: RulesFile): EvalResult {
  const rank = (tier: Tier) => rulesFile.tierOrder.indexOf(tier);

  const fired = rulesFile.rules.filter((rule) => matches(rule.when, fields));
  const rulesFired = fired.map(({ id, tier, flag, action, source }) => ({
    id,
    tier,
    flag,
    action,
    source,
  }));

  const tier = fired.reduce<Tier>(
    (highest, rule) => (rank(rule.tier) > rank(highest) ? rule.tier : highest),
    rulesFile.default.tier,
  );

  const missingForSafety = SAFETY_FIELDS.filter(
    (name) => fields[name] === undefined || fields[name] === null,
  );

  return {
    tier,
    rulesFired,
    ...(rulesFired.length === 0 ? { defaultApplied: rulesFile.default } : {}),
    missingForSafety: [...missingForSafety],
    rulesVersion: rulesFile.version,
  };
}

/** Wrap an evaluation into the full response shape the UI and the server both use. */
export function triageOffline(
  requestId: string,
  fields: Fields,
  rulesFile: RulesFile,
  lowConfidence: string[] = [],
): TriageResponse {
  return {
    requestId,
    ...evaluate(fields, rulesFile),
    fields,
    lowConfidence,
    disclaimer: DISCLAIMER,
  };
}
