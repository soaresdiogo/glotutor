import type { NextRequest } from 'next/server';

import { translations } from '@/locales/translations';
import type { LocaleCode } from '@/locales/types';
import { SUPPORTED_LOCALES } from '@/locales/types';

const SUPPORTED_SET = new Set<string>(SUPPORTED_LOCALES);

/**
 * Normalizes a single locale string (e.g. "en-US", "pt-BR") to a supported LocaleCode.
 * Used for DB-stored locale or request locale when sending emails.
 */
export function toLocaleCode(value: string | null | undefined): LocaleCode {
  if (!value || typeof value !== 'string') return 'en';
  const code = value.trim().split('-')[0]?.toLowerCase();
  return (code && SUPPORTED_SET.has(code) ? code : 'en') as LocaleCode;
}

/**
 * Resolves Accept-Language header value to a supported locale (e.g. "pt-BR,en;q=0.9" -> "pt").
 */
export function getLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): LocaleCode {
  if (!acceptLanguage) return 'en';
  const parts = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0]?.trim().toLowerCase());
  for (const part of parts) {
    const code = part?.split('-')[0];
    if (code && SUPPORTED_SET.has(code)) return code as LocaleCode;
  }
  return 'en';
}

/**
 * Resolves Accept-Language header to a supported locale (e.g. "pt-BR" -> "pt", "en-US" -> "en").
 */
export function getLocaleFromRequest(req: NextRequest): LocaleCode {
  return getLocaleFromAcceptLanguage(req.headers.get('Accept-Language'));
}

/**
 * Returns the translated message for API responses (e.g. error messages).
 * Falls back to English then to the key if not found.
 */
export function translateApiMessage(locale: LocaleCode, key: string): string {
  const record = translations[locale];
  const fallback = translations.en;
  return record?.[key] ?? fallback?.[key] ?? key;
}
