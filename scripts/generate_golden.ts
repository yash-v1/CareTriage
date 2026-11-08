import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluate } from '../web/src/engine/evaluate.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rulesPath = path.resolve(rootDir, 'shared/rules.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

export interface RawTestCase {
  id: string;
  category: string;
  description: string;
  input: Record<string, any>;
}

export const TEST_INPUTS: RawTestCase[] = [
  // 1. Age bands and boundaries (1, 2, 12, 59, 60 months)
  {
    id: "age-boundary-0m-normal",
    category: "age_bands_and_boundaries",
    description: "Neonate (0 months) with normal vitals",
    input: { ageMonths: 0, rr: 30 }
  },
  {
    id: "age-boundary-1m-normal",
    category: "age_bands_and_boundaries",
    description: "Young infant (1 month) with normal vitals",
    input: { ageMonths: 1, rr: 35 }
  },
  {
    id: "age-boundary-1m-fast",
    category: "age_bands_and_boundaries",
    description: "Young infant (1 month) at current fast breathing threshold RR 50",
    input: { ageMonths: 1, rr: 50 }
  },
  {
    id: "age-boundary-2m-infant-normal",
    category: "age_bands_and_boundaries",
    description: "Infant (2 months) normal respiration rate below 50",
    input: { ageMonths: 2, rr: 45 }
  },
  {
    id: "age-boundary-2m-infant-fast",
    category: "age_bands_and_boundaries",
    description: "Infant (2 months) at fast breathing cutoff RR 50",
    input: { ageMonths: 2, rr: 50 }
  },
  {
    id: "age-boundary-11m-infant-upper",
    category: "age_bands_and_boundaries",
    description: "Infant upper boundary (11 months) just below fast breathing cutoff RR 49",
    input: { ageMonths: 11, rr: 49 }
  },
  {
    id: "age-boundary-12m-child-lower",
    category: "age_bands_and_boundaries",
    description: "Child lower boundary (12 months) just below child fast breathing cutoff RR 39",
    input: { ageMonths: 12, rr: 39 }
  },
  {
    id: "age-boundary-12m-child-fast",
    category: "age_bands_and_boundaries",
    description: "Child lower boundary (12 months) at child fast breathing cutoff RR 40",
    input: { ageMonths: 12, rr: 40 }
  },
  {
    id: "age-boundary-59m-child-upper-normal",
    category: "age_bands_and_boundaries",
    description: "Child upper boundary (59 months) with normal breathing",
    input: { ageMonths: 59, rr: 35 }
  },
  {
    id: "age-boundary-59m-child-upper-fast",
    category: "age_bands_and_boundaries",
    description: "Child upper boundary (59 months) at child fast breathing cutoff RR 40",
    input: { ageMonths: 59, rr: 40 }
  },
  {
    id: "age-boundary-60m-cutoff-fast",
    category: "age_bands_and_boundaries",
    description: "Child age cutoff boundary (60 months) with RR 40 - child rules no longer apply",
    input: { ageMonths: 60, rr: 40 }
  },
  {
    id: "age-boundary-60m-cutoff-tachypnea",
    category: "age_bands_and_boundaries",
    description: "Cutoff boundary (60 months) with severe tachypnea RR 65 - child rules no longer apply",
    input: { ageMonths: 60, rr: 65 }
  },
  {
    id: "age-boundary-61m-above-cutoff",
    category: "age_bands_and_boundaries",
    description: "Beyond child cutoff (61 months) with RR 55 - child rules do not apply",
    input: { ageMonths: 61, rr: 55 }
  },

  // 2. Fast-breathing thresholds (below, at, above each cutoff)
  {
    id: "fast-breathing-infant-below-cutoff-49",
    category: "fast_breathing_thresholds",
    description: "Infant (6 months) just below threshold RR 49",
    input: { ageMonths: 6, rr: 49 }
  },
  {
    id: "fast-breathing-infant-at-cutoff-50",
    category: "fast_breathing_thresholds",
    description: "Infant (6 months) exactly at threshold RR 50",
    input: { ageMonths: 6, rr: 50 }
  },
  {
    id: "fast-breathing-infant-above-cutoff-51",
    category: "fast_breathing_thresholds",
    description: "Infant (6 months) just above threshold RR 51",
    input: { ageMonths: 6, rr: 51 }
  },
  {
    id: "fast-breathing-young-infant-1m-below-50",
    category: "fast_breathing_thresholds",
    description: "Young infant (1 month) below current engine cutoff RR 49",
    input: { ageMonths: 1, rr: 49 }
  },
  {
    id: "fast-breathing-young-infant-1m-at-50",
    category: "fast_breathing_thresholds",
    description: "Young infant (1 month) at current engine cutoff RR 50 (WHO cutoff for <2m is 60)",
    input: { ageMonths: 1, rr: 50 }
  },
  {
    id: "fast-breathing-young-infant-1m-above-60",
    category: "fast_breathing_thresholds",
    description: "Young infant (1 month) above WHO IMCI cutoff RR 62",
    input: { ageMonths: 1, rr: 62 }
  },
  {
    id: "fast-breathing-child-below-cutoff-39",
    category: "fast_breathing_thresholds",
    description: "Child (24 months) just below cutoff RR 39",
    input: { ageMonths: 24, rr: 39 }
  },
  {
    id: "fast-breathing-child-at-cutoff-40",
    category: "fast_breathing_thresholds",
    description: "Child (24 months) exactly at cutoff RR 40",
    input: { ageMonths: 24, rr: 40 }
  },
  {
    id: "fast-breathing-child-above-cutoff-41",
    category: "fast_breathing_thresholds",
    description: "Child (24 months) just above cutoff RR 41",
    input: { ageMonths: 24, rr: 41 }
  },
  {
    id: "fast-breathing-child-59m-below-39",
    category: "fast_breathing_thresholds",
    description: "Child at boundary (59 months) below cutoff RR 39",
    input: { ageMonths: 59, rr: 39 }
  },
  {
    id: "fast-breathing-child-59m-at-40",
    category: "fast_breathing_thresholds",
    description: "Child at boundary (59 months) at cutoff RR 40",
    input: { ageMonths: 59, rr: 40 }
  },
  {
    id: "fast-breathing-child-59m-above-41",
    category: "fast_breathing_thresholds",
    description: "Child at boundary (59 months) above cutoff RR 41",
    input: { ageMonths: 59, rr: 41 }
  },
  {
    id: "fast-breathing-older-60m-at-child-cutoff-40",
    category: "fast_breathing_thresholds",
    description: "Older child (60 months) with RR 40 - child fast breathing rule not applicable",
    input: { ageMonths: 60, rr: 40 }
  },
  {
    id: "fast-breathing-older-60m-at-infant-cutoff-50",
    category: "fast_breathing_thresholds",
    description: "Older child (60 months) with RR 50 - child fast breathing rule not applicable",
    input: { ageMonths: 60, rr: 50 }
  },
  {
    id: "fast-breathing-adult-360m-severe-rr-70",
    category: "fast_breathing_thresholds",
    description: "Adult (360 months) with tachypnea RR 70 - no adult respiratory rules",
    input: { ageMonths: 360, rr: 70 }
  },

  // 3. Each general danger sign alone
  {
    id: "danger-sign-alone-chest-indrawing",
    category: "general_danger_signs_alone",
    description: "Infant (8 months) with chest indrawing alone",
    input: { ageMonths: 8, chestIndrawing: true }
  },
  {
    id: "danger-sign-alone-stridor",
    category: "general_danger_signs_alone",
    description: "Child (14 months) with stridor in calm child alone",
    input: { ageMonths: 14, stridor: true }
  },
  {
    id: "danger-sign-alone-unable-to-feed",
    category: "general_danger_signs_alone",
    description: "Infant (4 months) unable to drink or breastfeed alone",
    input: { ageMonths: 4, unableToFeed: true }
  },
  {
    id: "danger-sign-alone-lethargic",
    category: "general_danger_signs_alone",
    description: "Child (24 months) abnormally sleepy or unconscious alone",
    input: { ageMonths: 24, lethargic: true }
  },
  {
    id: "danger-sign-alone-convulsions",
    category: "general_danger_signs_alone",
    description: "Child (36 months) with history of convulsions alone",
    input: { ageMonths: 36, convulsions: true }
  },
  {
    id: "danger-sign-alone-vomiting-everything",
    category: "general_danger_signs_alone",
    description: "Child (18 months) vomiting everything alone",
    input: { ageMonths: 18, vomitingEverything: true }
  },
  {
    id: "danger-sign-alone-wheeze",
    category: "general_danger_signs_alone",
    description: "Child (14 months) with wheeze detected alone (experimental rule)",
    input: { ageMonths: 14, wheeze: true }
  },

  // 4. Each symptom group
  {
    id: "symptom-group-maternal-sys-cutoff",
    category: "symptom_groups",
    description: "Maternal: gestWeeks >= 20, systolic at 140, headache",
    input: { pregnant: true, gestWeeks: 24, sys: 140, dia: 80, headache: true }
  },
  {
    id: "symptom-group-maternal-dia-cutoff",
    category: "symptom_groups",
    description: "Maternal: gestWeeks >= 20, diastolic at 90, blurred vision",
    input: { pregnant: true, gestWeeks: 24, sys: 120, dia: 90, blurredVision: true }
  },
  {
    id: "symptom-group-maternal-both-bp-both-sx",
    category: "symptom_groups",
    description: "Maternal: severe preeclampsia with both systolic and diastolic elevated and both symptoms",
    input: { pregnant: true, gestWeeks: 34, sys: 160, dia: 110, headache: true, blurredVision: true }
  },
  {
    id: "symptom-group-maternal-bp-below-cutoffs",
    category: "symptom_groups",
    description: "Maternal: BP 139/89 just below cutoff with headache",
    input: { pregnant: true, gestWeeks: 30, sys: 139, dia: 89, headache: true }
  },
  {
    id: "symptom-group-maternal-gest-below-20",
    category: "symptom_groups",
    description: "Maternal: gestWeeks 19 just below cutoff with high BP and headache",
    input: { pregnant: true, gestWeeks: 19, sys: 150, dia: 95, headache: true }
  },
  {
    id: "symptom-group-maternal-gest-at-20",
    category: "symptom_groups",
    description: "Maternal: gestWeeks exactly 20 with cutoff BP and headache",
    input: { pregnant: true, gestWeeks: 20, sys: 140, dia: 90, headache: true }
  },
  {
    id: "symptom-group-maternal-severe-bp-asymptomatic",
    category: "symptom_groups",
    description: "Maternal: severe hypertension crisis without headache or blurred vision",
    input: { pregnant: true, gestWeeks: 32, sys: 170, dia: 110, headache: false, blurredVision: false }
  },
  {
    id: "symptom-group-maternal-non-pregnant-severe-bp",
    category: "symptom_groups",
    description: "Maternal track: pregnant is false despite high BP and headache",
    input: { pregnant: false, gestWeeks: 30, sys: 160, dia: 100, headache: true }
  },
  {
    id: "symptom-group-febrile-fever-short-duration",
    category: "symptom_groups",
    description: "Febrile: fever for 2 days without danger signs",
    input: { feverDays: 2, ageMonths: 24 }
  },
  {
    id: "symptom-group-febrile-fever-at-3-days",
    category: "symptom_groups",
    description: "Febrile: fever for exactly 3 days without danger signs",
    input: { feverDays: 3, ageMonths: 24 }
  },
  {
    id: "symptom-group-febrile-fever-prolonged-4-days",
    category: "symptom_groups",
    description: "Febrile: fever for 4 days (>3 days) without danger signs",
    input: { feverDays: 4, ageMonths: 24 }
  },
  {
    id: "symptom-group-febrile-fever-4-days-with-bleeding",
    category: "symptom_groups",
    description: "Febrile: fever for 4 days with bleeding (dengue warning)",
    input: { feverDays: 4, bleeding: true, ageMonths: 24 }
  },
  {
    id: "symptom-group-febrile-fever-5-days-with-lethargy",
    category: "symptom_groups",
    description: "Febrile: fever for 5 days with lethargy",
    input: { feverDays: 5, lethargic: true, ageMonths: 24 }
  },
  {
    id: "symptom-group-febrile-bleeding-alone-no-fever",
    category: "symptom_groups",
    description: "Febrile: bleeding alone without fever",
    input: { bleeding: true, ageMonths: 24 }
  },

  // 5. Multi-condition combinations
  {
    id: "multi-danger-indrawing-and-fast-breathing-infant",
    category: "multi_condition_combinations",
    description: "Infant (8m) with chest indrawing and fast breathing (RED + YELLOW)",
    input: { ageMonths: 8, chestIndrawing: true, rr: 55 }
  },
  {
    id: "multi-danger-convulsions-and-fast-breathing-child",
    category: "multi_condition_combinations",
    description: "Child (24m) with convulsions and fast breathing (RED + YELLOW)",
    input: { ageMonths: 24, convulsions: true, rr: 44 }
  },
  {
    id: "multi-child-fast-breathing-and-prolonged-fever",
    category: "multi_condition_combinations",
    description: "Child (30m) with fast breathing and prolonged fever (YELLOW + YELLOW)",
    input: { ageMonths: 30, rr: 45, feverDays: 4 }
  },
  {
    id: "multi-danger-stridor-and-severe-fever-bleeding",
    category: "multi_condition_combinations",
    description: "Child (20m) with stridor and severe febrile illness (RED + RED + YELLOW)",
    input: { ageMonths: 20, stridor: true, feverDays: 5, bleeding: true }
  },
  {
    id: "multi-maternal-red-and-severe-fever",
    category: "multi_condition_combinations",
    description: "Pregnant woman with preeclampsia and severe febrile illness (RED + RED + YELLOW)",
    input: { pregnant: true, gestWeeks: 30, sys: 150, dia: 95, headache: true, feverDays: 4, bleeding: true }
  },
  {
    id: "multi-all-six-general-danger-signs",
    category: "multi_condition_combinations",
    description: "Child (18m) presenting with all 6 general danger signs simultaneously",
    input: { ageMonths: 18, chestIndrawing: true, stridor: true, unableToFeed: true, lethargic: true, convulsions: true, vomitingEverything: true }
  },
  {
    id: "multi-wheeze-and-fast-breathing-infant",
    category: "multi_condition_combinations",
    description: "Infant (9m) with acoustic wheeze and fast breathing (RED + YELLOW)",
    input: { ageMonths: 9, wheeze: true, rr: 54 }
  },

  // 6. Empty input
  {
    id: "empty-all-fields-omitted",
    category: "empty_input",
    description: "Completely empty input object (all fields undefined)",
    input: {}
  },
  {
    id: "empty-all-fields-explicit-null",
    category: "empty_input",
    description: "All clinical fields present with explicit null values",
    input: {
      ageMonths: null,
      rr: null,
      sys: null,
      dia: null,
      pregnant: null,
      gestWeeks: null,
      feverDays: null,
      headache: null,
      blurredVision: null,
      chestIndrawing: null,
      stridor: null,
      unableToFeed: null,
      lethargic: null,
      convulsions: null,
      vomitingEverything: null,
      wheeze: null,
      bleeding: null
    }
  },

  // 7. Contradictory input
  {
    id: "contradiction-not-pregnant-with-gestation-weeks",
    category: "contradictory_input",
    description: "Marked not pregnant but third-trimester gestation weeks provided",
    input: { pregnant: false, gestWeeks: 32, sys: 150, dia: 95, headache: true }
  },
  {
    id: "contradiction-infant-marked-pregnant",
    category: "contradictory_input",
    description: "6-month-old infant simultaneously marked as pregnant with high BP",
    input: { ageMonths: 6, pregnant: true, gestWeeks: 28, sys: 145, dia: 95, headache: true }
  },
  {
    id: "contradiction-inverted-blood-pressure",
    category: "contradictory_input",
    description: "Diastolic BP (110) strictly exceeds systolic BP (80) - non-physiological",
    input: { pregnant: true, gestWeeks: 30, sys: 80, dia: 110, headache: true }
  },
  {
    id: "contradiction-zero-respiratory-rate",
    category: "contradictory_input",
    description: "Respiratory rate recorded as 0 bpm (apnea/cardiorespiratory arrest)",
    input: { ageMonths: 10, rr: 0 }
  },
  {
    id: "contradiction-negative-fever-days",
    category: "contradictory_input",
    description: "Negative fever duration (-5 days) with bleeding symptom",
    input: { feverDays: -5, bleeding: true, ageMonths: 18 }
  },
  {
    id: "contradiction-feeding-false-vomiting-true",
    category: "contradictory_input",
    description: "unableToFeed marked false while vomitingEverything marked true",
    input: { ageMonths: 12, unableToFeed: false, vomitingEverything: true }
  },

  // 8. Invalid ages
  {
    id: "invalid-age-negative-one-danger",
    category: "invalid_ages",
    description: "Negative age (-1 month) with chest indrawing",
    input: { ageMonths: -1, chestIndrawing: true }
  },
  {
    id: "invalid-age-negative-twelve-rr",
    category: "invalid_ages",
    description: "Negative age (-12 months) with fast breathing",
    input: { ageMonths: -12, rr: 55 }
  },
  {
    id: "invalid-age-zero-months-danger",
    category: "invalid_ages",
    description: "Neonate (0 months) with convulsions",
    input: { ageMonths: 0, convulsions: true }
  },
  {
    id: "invalid-age-decimal-one-point-five-rr",
    category: "invalid_ages",
    description: "Non-integer age (1.5 months) with respiratory rate 55",
    input: { ageMonths: 1.5, rr: 55 }
  },
  {
    id: "invalid-age-extreme-2000-months-danger",
    category: "invalid_ages",
    description: "Extreme age (2000 months / ~166 years) with chest indrawing",
    input: { ageMonths: 2000, chestIndrawing: true }
  },
  {
    id: "invalid-age-extreme-99999-months-rr",
    category: "invalid_ages",
    description: "Extreme age (99999 months) with fast breathing",
    input: { ageMonths: 99999, rr: 65 }
  },
  {
    id: "invalid-age-missing-with-danger-signs",
    category: "invalid_ages",
    description: "Age omitted entirely while presenting with 3 general danger signs",
    input: { chestIndrawing: true, convulsions: true, stridor: true }
  },
  {
    id: "invalid-age-missing-with-tachypnea",
    category: "invalid_ages",
    description: "Age omitted entirely with tachypnea RR 75",
    input: { rr: 75 }
  }
];

// Helper to extract (tier, directive, flags) matching the current engine
export function runThroughCurrentEngine(input: Record<string, any>) {
  const result = evaluate(input, rules);
  const tier = result.tier;
  const directive = result.rulesFired.length > 0
    ? (result.rulesFired.find((r) => r.tier === tier)?.action || result.rulesFired[0].action)
    : (result.defaultApplied?.action || rules.default.action);
  const flags = result.rulesFired.map((r) => r.flag);

  return {
    tier,
    directive,
    flags,
    rulesFired: result.rulesFired.map((r) => r.id),
    missingForSafety: result.missingForSafety,
  };
}

const goldenEntries = TEST_INPUTS.map((testCase) => {
  const output = runThroughCurrentEngine(testCase.input);
  return {
    id: testCase.id,
    category: testCase.category,
    description: testCase.description,
    input: testCase.input,
    tier: output.tier,
    directive: output.directive,
    flags: output.flags,
    rulesFired: output.rulesFired,
  };
});

// Output single golden.json to repository root
const rootGoldenPath = path.resolve(rootDir, 'golden.json');
fs.writeFileSync(rootGoldenPath, JSON.stringify(goldenEntries, null, 2) + '\n');

console.log(`Generated golden.json with ${goldenEntries.length} cases at ${rootGoldenPath}`);

