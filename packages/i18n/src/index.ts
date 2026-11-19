import mr from './mr.json';
import hi from './hi.json';
import en from './en.json';

export type TranslationKey = typeof mr;
export type SupportedLocale = 'mr' | 'hi' | 'en';

export const DICTIONARIES: Record<SupportedLocale, TranslationKey> = {
  mr,
  hi,
  en,
};

export const DEFAULT_LOCALE: SupportedLocale = 'mr';

export function getDictionary(locale: SupportedLocale = DEFAULT_LOCALE): TranslationKey {
  return DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
}

export function t<
  Section extends keyof TranslationKey,
  Key extends keyof TranslationKey[Section]
>(
  section: Section,
  key: Key,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const dict = getDictionary(locale);
  const sec = dict[section];
  if (sec && key in sec) {
    return (sec as Record<string, string>)[key as string];
  }
  // Fallback to default locale or empty string
  const fallback = DICTIONARIES[DEFAULT_LOCALE][section];
  if (fallback && key in fallback) {
    return (fallback as Record<string, string>)[key as string];
  }
  return String(key);
}

export { mr, hi, en };
