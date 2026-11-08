import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { evaluate, triageOffline } from "./evaluate";
import { RULES } from "./loadRules";
import goldenCases from "../../../golden.json";
import { generateQrPayload } from "../handoff/qrPayload";
import type { Fields, Tier } from "./types";

interface GoldenCase {
  id: string;
  category: string;
  description: string;
  input: Fields;
  tier: Tier;
  directive: string;
  flags: string[];
  rulesFired: string[];
}

const cases = goldenCases as unknown as GoldenCase[];

/** Helper to extract the clinical output tuple (tier, directive, flags) */
function runTriageEngine(input: Fields) {
  const result = evaluate(input, RULES);
  const tier = result.tier;
  const directive = result.rulesFired.length > 0
    ? (result.rulesFired.find((r) => r.tier === tier)?.action || result.rulesFired[0].action)
    : (result.defaultApplied?.action || RULES.default.action);
  const flags = result.rulesFired.map((r) => r.flag);

  return {
    tier,
    directive,
    flags,
    rulesFired: result.rulesFired.map((r) => r.id),
  };
}

describe("Triage Engine Regression Test Suite (Golden Master)", () => {
  it("loads 40+ regression golden cases", () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
  });

  describe.each(cases)("$id ($category): $description", (tc) => {
    it("matches golden.json (tier, directive, flags)", () => {
      const actual = runTriageEngine(tc.input);

      expect(actual.tier).toBe(tc.tier);
      expect(actual.directive).toBe(tc.directive);
      expect(actual.flags).toEqual(tc.flags);
      expect(actual.rulesFired).toEqual(tc.rulesFired);
    });
  });
});

describe("QR Payload Snapshot Tests (4 Sample Cases)", () => {
  const FIXED_TIMESTAMP_MS = 1761200000000;
  const EXPECTED_UNIX_SECONDS = 1761200000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_TIMESTAMP_MS));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Sample Case 1: Maternal severe preeclampsia (RED)", () => {
    const input: Fields = {
      pregnant: true,
      gestWeeks: 32,
      sys: 150,
      dia: 100,
      headache: true,
      blurredVision: true,
    };
    const response = triageOffline("req-mat-001", input, RULES);
    const qrPayload = generateQrPayload(response);

    // Vitest snapshot
    expect(qrPayload).toMatchSnapshot();

    // Structural assertions
    const parsed = JSON.parse(qrPayload);
    expect(parsed).toEqual({
      v: 1,
      id: "req-mat-001",
      t: EXPECTED_UNIX_SECONDS,
      tier: "RED",
      rules: ["MAT_RED_PE"],
      gw: 32,
      bp: [150, 100],
      sx: ["HA", "BLUR"],
    });
  });

  it("Sample Case 2: Pediatric general danger signs with chest indrawing and convulsions (RED)", () => {
    const input: Fields = {
      ageMonths: 18,
      chestIndrawing: true,
      convulsions: true,
      rr: 52,
    };
    const response = triageOffline("req-ped-red-002", input, RULES);
    const qrPayload = generateQrPayload(response);

    // Vitest snapshot
    expect(qrPayload).toMatchSnapshot();

    // Structural assertions
    const parsed = JSON.parse(qrPayload);
    expect(parsed).toEqual({
      v: 1,
      id: "req-ped-red-002",
      t: EXPECTED_UNIX_SECONDS,
      tier: "RED",
      rules: ["PED_RED_DANGER", "PED_YELLOW_FASTBREATH_CHILD"],
      am: 18,
      rr: 52,
      sx: ["CIND", "CONV"],
    });
  });

  it("Sample Case 3: Pediatric infant fast breathing with fever (YELLOW)", () => {
    const input: Fields = {
      ageMonths: 8,
      rr: 56,
      feverDays: 2,
    };
    const response = triageOffline("req-ped-yellow-003", input, RULES);
    const qrPayload = generateQrPayload(response);

    // Vitest snapshot
    expect(qrPayload).toMatchSnapshot();

    // Structural assertions
    const parsed = JSON.parse(qrPayload);
    expect(parsed).toEqual({
      v: 1,
      id: "req-ped-yellow-003",
      t: EXPECTED_UNIX_SECONDS,
      tier: "YELLOW",
      rules: ["PED_YELLOW_FASTBREATH_INFANT"],
      am: 8,
      rr: 56,
      fd: 2,
    });
  });

  it("Sample Case 4: Routine pediatric mild fever with no danger signs (GREEN)", () => {
    const input: Fields = {
      ageMonths: 24,
      rr: 28,
      feverDays: 1,
    };
    const response = triageOffline("req-ped-green-004", input, RULES);
    const qrPayload = generateQrPayload(response);

    // Vitest snapshot
    expect(qrPayload).toMatchSnapshot();

    // Structural assertions
    const parsed = JSON.parse(qrPayload);
    expect(parsed).toEqual({
      v: 1,
      id: "req-ped-green-004",
      t: EXPECTED_UNIX_SECONDS,
      tier: "GREEN",
      rules: [],
      am: 24,
      rr: 28,
      fd: 1,
    });
  });
});

