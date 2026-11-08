import { en, type Translations } from "./en";
import { ta } from "./ta";
import { hi } from "./hi";

export type SupportedLang = "en" | "ta" | "hi";

export const translations: Record<SupportedLang, Translations> = {
  en,
  ta,
  hi,
};

export function getTranslations(lang: SupportedLang): Translations {
  return translations[lang] || en;
}

export { en, ta, hi };

