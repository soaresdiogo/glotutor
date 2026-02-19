'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { translations } from './translations';
import {
  getBrowserLocale,
  LOCALE_STORAGE_KEY,
  type LocaleCode,
  type TranslationParams,
} from './types';

const VALID_LOCALES = new Set<LocaleCode>(['en', 'pt', 'es', 'it', 'fr', 'de']);

function getInitialLocale(): LocaleCode {
  if (globalThis.window === undefined) return 'en';
  const stored = globalThis.window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && VALID_LOCALES.has(stored as LocaleCode)) {
    return stored as LocaleCode;
  }
  return getBrowserLocale();
}

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return Object.entries(params).reduce(
    (acc, [key, value]) =>
      acc.replaceAll(new RegExp(String.raw`\{${key}\}`, 'g'), String(value)),
    text,
  );
}

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [locale, setLocale] = useState<LocaleCode>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocaleAndPersist = useCallback((code: LocaleCode) => {
    setLocale(code);
    if (globalThis.window !== undefined) {
      globalThis.window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      const record = translations[locale];
      const fallback = translations.en;
      const text = record?.[key] ?? fallback?.[key] ?? key;
      return interpolate(text, params);
    },
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: mounted ? locale : 'en',
      setLocale: setLocaleAndPersist,
      t,
    }),
    [locale, setLocaleAndPersist, t, mounted],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useTranslate(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useTranslate must be used within a LocaleProvider');
  }
  return ctx;
}
