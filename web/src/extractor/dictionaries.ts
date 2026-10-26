// Symptom dictionaries keyed by language.
// Phase 3A covers English ("en"). Tamil ("ta") and Hindi ("hi") will be added in Phase 3B.

import type { BooleanField } from "../engine/types";

export type SupportedLang = "en" | "ta" | "hi";

export interface SymptomPattern {
  /** Phrases that indicate the condition is present (true). */
  positive: string[];
  /**
   * Optional phrases that explicitly indicate the healthy/false state
   * (used for unableToFeed where "not feeding" is positive and "feeding well" is false).
   */
  healthyOverride?: string[];
  /**
   * If true, positive phrases already contain words like "not" or "unable"
   * so pre-negation checks should not invert them.
   */
  selfNegating?: boolean;
}

export const SYMPTOM_DICTIONARIES: Record<
  SupportedLang,
  Record<BooleanField, SymptomPattern>
> = {
  en: {
    pregnant: {
      positive: [
        "pregnant",
        "pregnancy",
        "expecting a baby",
        "antenatal",
        "gestation",
        "gravida",
      ],
    },
    headache: {
      positive: [
        "severe headache",
        "headache",
        "head ache",
        "head pain",
        "pain in head",
        "pain in the head",
        "aching head",
      ],
    },
    blurredVision: {
      positive: [
        "blurred vision",
        "blurry vision",
        "vision is blurred",
        "vision is blurry",
        "vision blurred",
        "cannot see clearly",
        "can't see clearly",
        "unable to see clearly",
        "dim vision",
        "visual disturbance",
        "spots before eyes",
        "flashing lights",
      ],
    },
    chestIndrawing: {
      positive: [
        "chest indrawing",
        "chest in-drawing",
        "chest in drawing",
        "lower chest indrawing",
        "chest drawing in",
        "chest pulls in",
        "chest pulling in",
        "ribs pulling in",
        "subcostal retraction",
        "subcostal indrawing",
      ],
    },
    stridor: {
      positive: [
        "stridor",
        "harsh noise when breathing",
        "harsh breathing sound",
        "noisy breathing in",
        "inspiratory stridor",
      ],
    },
    unableToFeed: {
      selfNegating: true,
      positive: [
        "unable to feed",
        "not able to feed",
        "unable to breastfeed",
        "unable to drink",
        "not feeding",
        "not breastfeeding",
        "not drinking",
        "not taking feeds",
        "cannot feed",
        "can't feed",
        "cannot drink",
        "can't drink",
        "refusing feed",
        "refusing feeds",
        "refuses to feed",
        "refusing to feed",
        "refuses breastmilk",
        "stopped feeding",
        "poor feeding",
      ],
      healthyOverride: [
        "feeding well",
        "feeds well",
        "able to feed",
        "breastfeeding well",
        "drinking well",
        "taking feeds well",
        "feeding normally",
      ],
    },
    lethargic: {
      positive: [
        "lethargic",
        "lethargy",
        "unconscious",
        "drowsy",
        "very sleepy",
        "difficult to wake",
        "hard to wake",
        "not responding",
        "unresponsive",
        "listless",
        "floppy",
      ],
    },
    convulsions: {
      positive: [
        "convulsions",
        "convulsion",
        "convulsing",
        "seizures",
        "seizure",
        "having fits",
        "fits",
      ],
    },
    vomitingEverything: {
      positive: [
        "vomiting everything",
        "vomits everything",
        "throwing up everything",
        "throws up everything",
        "cannot keep anything down",
        "can't keep anything down",
        "unable to keep anything down",
        "persistent vomiting",
        "intractable vomiting",
      ],
    },
    wheeze: {
      positive: [
        "wheeze",
        "wheezing",
        "whistling sound when breathing",
        "whistling breathing",
      ],
    },
    bleeding: {
      positive: [
        "bleeding",
        "blood in stool",
        "blood in vomit",
        "vomiting blood",
        "gum bleeding",
        "bleeding gums",
        "nosebleed",
        "nose bleed",
        "epistaxis",
        "vaginal bleeding",
        "hemorrhage",
        "black tarry stool",
      ],
    },
  },
  // Placeholders for Phase 3B
  ta: {
    pregnant: { positive: [] },
    headache: { positive: [] },
    blurredVision: { positive: [] },
    chestIndrawing: { positive: [] },
    stridor: { positive: [] },
    unableToFeed: { selfNegating: true, positive: [], healthyOverride: [] },
    lethargic: { positive: [] },
    convulsions: { positive: [] },
    vomitingEverything: { positive: [] },
    wheeze: { positive: [] },
    bleeding: { positive: [] },
  },
  hi: {
    pregnant: { positive: [] },
    headache: { positive: [] },
    blurredVision: { positive: [] },
    chestIndrawing: { positive: [] },
    stridor: { positive: [] },
    unableToFeed: { selfNegating: true, positive: [], healthyOverride: [] },
    lethargic: { positive: [] },
    convulsions: { positive: [] },
    vomitingEverything: { positive: [] },
    wheeze: { positive: [] },
    bleeding: { positive: [] },
  },
};