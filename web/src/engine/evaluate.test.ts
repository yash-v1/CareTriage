import { describe, expect, it } from "vitest";
import rulesJson from "../../../shared/rules.json";
import casesJson from "../../../shared/test-cases.json";
import { DISCLAIMER, evaluate, matches, triageOffline } from "./evaluate";
import type { Condition, Fields, RulesFile, Tier } from "./types";

// JSON imports widen string literals (tier becomes string), so cast once here.
const rules = rulesJson as unknown as RulesFile;

interface TestCase {
  id: string;
  description: string;
  input: Fields;
  expect: { tier: Tier; rulesFired: string[] };
}

const rawCases = Array.isArray(casesJson)
  ? casesJson
  : (casesJson as { cases: unknown[] }).cases;
const cases = rawCases as unknown as TestCase[];

/** Collect every field name a condition tests. */
function leafFields(condition: Condition): string[] {
  const group = condition as { all?: Condition[]; any?: Condition[] };
  if (group.all) return group.all.flatMap(leafFields);
  if (group.any) return group.any.flatMap(leafFields);
  return Object.keys(condition);
}

describe("shared/test-cases.json", () => {
  it("has cases to run", () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  it.each(cases)("$id: $description", (c) => {
    const result = evaluate(c.input, rules);
    expect(result.tier).toBe(c.expect.tier);
    expect(result.rulesFired.map((r) => r.id)).toEqual(c.expect.rulesFired);
  });
});

describe("shared/rules.json sanity", () => {
  it("has unique rule ids", () => {
    const ids = rules.rules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses tiers listed in tierOrder", () => {
    for (const rule of rules.rules) expect(rules.tierOrder).toContain(rule.tier);
  });

  // A typo in a field name would make a rule silently never match, so check every leaf.
  it("only tests fields declared in rules.fields", () => {
    const known = Object.keys((rulesJson as { fields: object }).fields);
    for (const rule of rules.rules) {
      for (const field of leafFields(rule.when)) expect(known).toContain(field);
    }
  });
});

describe("matches", () => {
  it("treats a missing or null field as false, never as 0", () => {
    expect(matches({ sys: { lt: 140 } }, {})).toBe(false);
    expect(matches({ sys: { lt: 140 } }, { sys: null })).toBe(false);
    expect(matches({ headache: false }, {})).toBe(false);
  });

  it("supports every operator at the boundary", () => {
    expect(matches({ rr: { gte: 50 } }, { rr: 50 })).toBe(true);
    expect(matches({ rr: { gt: 50 } }, { rr: 50 })).toBe(false);
    expect(matches({ rr: { lte: 50 } }, { rr: 50 })).toBe(true);
    expect(matches({ rr: { lt: 50 } }, { rr: 50 })).toBe(false);
    expect(matches({ rr: { eq: 50 } }, { rr: 50 })).toBe(true);
  });

  it("throws on a malformed rule instead of guessing", () => {
    expect(() => matches({ sys: { gte: 1, lt: 9 } }, { sys: 5 })).toThrow();
    expect(() => matches({ sys: true, dia: true }, {})).toThrow();
    expect(() => matches({ sys: { between: 5 } } as unknown as Condition, { sys: 5 })).toThrow();
  });
});

describe("evaluate", () => {
  it("returns the default only when nothing fired", () => {
    const none = evaluate({}, rules);
    expect(none.defaultApplied?.id).toBe("DEFAULT_GREEN");

    const fired = evaluate({ ageMonths: 6, unableToFeed: true }, rules);
    expect(fired.defaultApplied).toBeUndefined();
  });

  it("lists rules in rules.json order and takes the highest tier", () => {
    const result = evaluate({ ageMonths: 8, chestIndrawing: true, rr: 55 }, rules);
    expect(result.tier).toBe("RED");
    expect(result.rulesFired.map((r) => r.id)).toEqual([
      "PED_RED_DANGER",
      "PED_YELLOW_FASTBREATH_INFANT",
    ]);
  });

  it("does not send the rule's `when` clause in the response", () => {
    const result = evaluate({ feverDays: 5, bleeding: true }, rules);
    expect(Object.keys(result.rulesFired[0]).sort()).toEqual(
      ["action", "flag", "id", "source", "tier"],
    );
  });

  it("asks for ageMonths when it is missing, and not when it is known", () => {
    expect(evaluate({}, rules).missingForSafety).toEqual(["ageMonths"]);
    expect(evaluate({ ageMonths: null }, rules).missingForSafety).toEqual(["ageMonths"]);
    expect(evaluate({ ageMonths: 0 }, rules).missingForSafety).toEqual([]);
  });

  it("does not change the fields it was given", () => {
    const input: Fields = { ageMonths: 8, rr: 55 };
    const copy = { ...input };
    evaluate(input, rules);
    expect(input).toEqual(copy);
  });
});

describe("triageOffline", () => {
  it("builds the full response shape from the contract", () => {
    const fields: Fields = { pregnant: true, gestWeeks: 30, sys: 150, dia: 100, headache: true };
    const response = triageOffline("r-7f3a21", fields, rules, ["gestWeeks"]);
    expect(Object.keys(response).sort()).toEqual(
      [
        "disclaimer",
        "fields",
        "lowConfidence",
        "missingForSafety",
        "requestId",
        "rulesFired",
        "rulesVersion",
        "tier",
      ].sort(),
    );
    expect(response.tier).toBe("RED");
    expect(response.lowConfidence).toEqual(["gestWeeks"]);
    expect(response.disclaimer).toBe(DISCLAIMER);
  });
});