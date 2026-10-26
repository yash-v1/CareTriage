import rulesJson from "../../../shared/rules.json";
import type { RulesFile } from "./types";

/** Bundled clinical rules from shared/rules.json, ready for offline evaluation. */
export const RULES = rulesJson as unknown as RulesFile;