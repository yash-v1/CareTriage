import { describe, expect, it } from "vitest";
import rulesJson from "../../../shared/rules.json";
import { evaluate } from "../engine/evaluate";
import type { Fields, RulesFile } from "../engine/types";
import type { SupportedLang } from "./dictionaries";
import { extract } from "./extract";
import { isNegated } from "./negation";
import { replaceNumberWords } from "./numberWords";
import transcriptsJson from "./transcripts.json";

const rules = rulesJson as unknown as RulesFile;

interface TranscriptCase {
  id: string;
  lang: SupportedLang;
  transcript: string;
  expect: {
    fields: Fields;
    lowConfidence: string[];
  };
}

const cases = transcriptsJson.cases as unknown as TranscriptCase[];

describe("replaceNumberWords", () => {
  it("converts simple, compound, and hyphenated number words", () => {
    expect(replaceNumberWords("thirty-two weeks")).toBe("32 weeks");
    expect(replaceNumberWords("one hundred and forty over ninety")).toBe("140 over 90");
    expect(replaceNumberWords("hundred forty over ninety")).toBe("140 over 90");
    expect(replaceNumberWords("four days of fever")).toBe("4 days of fever");
  });

  it("handles spoken clinical BP shorthand", () => {
    expect(replaceNumberWords("BP one forty by ninety")).toBe("BP 140 by 90");
    expect(replaceNumberWords("one sixty over one ten")).toBe("160 over 110");
  });

  it("does not merge unrelated numbers across 'and' when not after 'hundred'", () => {
    expect(replaceNumberWords("two years and six months")).toBe("2 years and 6 months");
  });
});

describe("isNegated", () => {
  it("detects pre-negation across a list of symptoms", () => {
    const text = "no headache or blurred vision";
    expect(isNegated(text, text.indexOf("headache"), text.indexOf("headache") + 8)).toBe(true);
    expect(
      isNegated(text, text.indexOf("blurred vision"), text.indexOf("blurred vision") + 14),
    ).toBe(true);
  });

  it("stops negation scope at contrast words like 'but' or 'has'", () => {
    const text = "no headache but has blurred vision";
    expect(isNegated(text, text.indexOf("headache"), text.indexOf("headache") + 8)).toBe(true);
    expect(
      isNegated(text, text.indexOf("blurred vision"), text.indexOf("blurred vision") + 14),
    ).toBe(false);
  });

  it("detects immediate post-negation", () => {
    const text = "stridor absent, headache: no";
    expect(isNegated(text, 0, 7)).toBe(true);
    expect(isNegated(text, text.indexOf("headache"), text.indexOf("headache") + 8)).toBe(true);
  });
});

describe("transcripts.json test table", () => {
  it.each(cases)("$id", (c) => {
    const result = extract(c.transcript, c.lang);
    expect(result.fields).toEqual(c.expect.fields);
    expect(result.lowConfidence).toEqual(c.expect.lowConfidence);
  });
});

describe("extractor -> evaluate integration", () => {
  it("routes spoken maternal preeclampsia to RED", () => {
    const { fields } = extract(
      "Pregnant thirty weeks, blood pressure one forty over ninety with severe headache",
    );
    const result = evaluate(fields, rules);
    expect(result.tier).toBe("RED");
    expect(result.rulesFired.map((r) => r.id)).toEqual(["MAT_RED_PE"]);
  });

  it("routes spoken infant fast breathing without danger signs to YELLOW", () => {
    const { fields } = extract(
      "Eight month old infant, respiratory rate fifty two, no chest indrawing, feeding well",
    );
    const result = evaluate(fields, rules);
    expect(result.tier).toBe("YELLOW");
    expect(result.rulesFired.map((r) => r.id)).toEqual(["PED_YELLOW_FASTBREATH_INFANT"]);
  });

  it("routes spoken child convulsions and vomiting everything to RED", () => {
    const { fields } = extract("Ten month old baby vomiting everything and having convulsions");
    const result = evaluate(fields, rules);
    expect(result.tier).toBe("RED");
    expect(result.rulesFired.map((r) => r.id)).toEqual(["PED_RED_DANGER"]);
  });

  it("routes spoken febrile illness with bleeding to RED (firing severe and prolonged rules)", () => {
    const { fields } = extract("Ten year old child, fever for five days and gum bleeding");
    const result = evaluate(fields, rules);
    expect(result.tier).toBe("RED");
    expect(result.rulesFired.map((r) => r.id)).toEqual([
      "FEB_RED_SEVERE",
      "FEB_YELLOW_PROLONGED",
    ]);
  });
});