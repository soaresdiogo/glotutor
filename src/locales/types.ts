export const LOCALE_STORAGE_KEY = 'glotutor-locale';

export const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'it', 'fr', 'de'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

const SUPPORTED_SET = new Set<string>(SUPPORTED_LOCALES);

/** Resolves browser language (e.g. "pt-BR", "en-US") to a supported locale code. */
export function getBrowserLocale(): LocaleCode {
  if (typeof navigator === 'undefined') return 'en';
  const languages = navigator.languages ?? [navigator.language];
  for (const lang of languages) {
    const code = (lang ?? '').split('-')[0]?.toLowerCase();
    if (code && SUPPORTED_SET.has(code)) return code as LocaleCode;
  }
  return 'en';
}

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
};

export type TranslationParams = Record<string, string | number>;
