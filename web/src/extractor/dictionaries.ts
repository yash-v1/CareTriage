import type { BooleanField } from "../engine/types";

export type SupportedLang = "en" | "ta" | "hi";

export interface SymptomPattern {
  positive: string[];
  selfNegating?: boolean; 
  healthyOverride?: string[];
}

export const SYMPTOM_DICTIONARIES: Record<SupportedLang, Record<BooleanField, SymptomPattern>> = {
  en: {
    pregnant: { positive: ["pregnant", "pregnancy", "expecting"] },
    headache: { positive: ["headache", "head aches", "head hurts", "migraine"] },
    blurredVision: { positive: ["blurred vision", "blurry vision", "can't see clearly"] },
    chestIndrawing: { positive: ["chest indrawing", "lower chest indrawing", "ribs pulling", "chest drawing"] },
    stridor: { positive: ["stridor", "harsh noise when breathing", "wheezing noise on breath in"] },
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
    lethargic: { positive: ["lethargic", "unconscious", "not waking up", "unresponsive", "limp"] },
    convulsions: { positive: ["convulsions", "fits", "seizures", "shaking uncontrollably"] },
    vomitingEverything: { positive: ["vomiting everything", "throws up everything", "can't keep anything down"] },
    wheeze: { positive: ["wheeze", "wheezing", "whistling sound"] },
    bleeding: { positive: ["bleeding", "blood loss", "hemorrhage"] },
  },
  ta: {
    pregnant: { positive: ["garbam", "கர்ப்பம்", "கர்ப்பிணி"] },
    headache: { positive: ["thala vali", "thalai vali", "தலைவலி", "தலை வலி"] },
    blurredVision: { positive: ["mangalana parvai", "மங்கலான பார்வை", "கண் தெரியவில்லை"] },
    chestIndrawing: { positive: ["nenju kuzhi", "நெஞ்சு குழி", "மூச்சு விட சிரமம்"] },
    stridor: { positive: ["kazhuthil saththam", "மூச்சு சத்தம்"] },
    unableToFeed: { positive: ["paal kudikala", "பால் குடிக்கவில்லை", "சாப்பிடவில்லை"] },
    lethargic: { positive: ["mayakkam", "மயக்கம்", "சோர்வு"] },
    convulsions: { positive: ["valippu", "வலிப்பு", "ஜன்னி"] },
    vomitingEverything: { positive: ["ellam vaanthi", "எல்லாம் வாந்தி", "தொடர் வாந்தி"] },
    wheeze: { positive: ["wheezing", "இழுப்பு", "மூச்சுத்திணறல்"] },
    bleeding: { positive: ["raththam", "ரத்தம்", "இரத்தம் வருது"] },
  },
  hi: {
    pregnant: { positive: ["garbhavati", "गर्भवती", "प्रेग्नेंट"] },
    headache: { positive: ["sir dard", "सिर दर्द", "सरदर्द"] },
    blurredVision: { positive: ["dhundhla", "धुंधला", "साफ नहीं दिख रहा"] },
    chestIndrawing: { positive: ["chhati andar", "छाती धंसना", "पसली चलना"] },
    stridor: { positive: ["saans mein awaz", "सांस में आवाज", "खरखर"] },
    unableToFeed: { positive: ["doodh nahi pi raha", "दूध नहीं पी रहा", "खा नहीं रहा"] },
    lethargic: { positive: ["behoosh", "बेहोश", "सुस्त", "उठ नहीं रहा"] },
    convulsions: { positive: ["daure", "दौरे", "झटके"] },
    vomitingEverything: { positive: ["sab kuch ulti", "सब कुछ उल्टी", "लगातार उल्टी"] },
    wheeze: { positive: ["seeti ki awaz", "सांस फूलना", "सीटी की आवाज"] },
    bleeding: { positive: ["khoon behna", "खून बहना", "रक्तस्राव"] },
  }
};