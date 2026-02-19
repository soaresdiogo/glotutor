import type { NextRequest } from 'next/server';

import { translations } from '@/locales/translations';
import type { LocaleCode } from '@/locales/types';
import { SUPPORTED_LOCALES } from '@/locales/types';

const SUPPORTED_SET = new Set<string>(SUPPORTED_LOCALES);

/**
 * Resolves Accept-Language header to a supported locale (e.g. "pt-BR" -> "pt", "en-US" -> "en").
 */
export function getLocaleFromRequest(req: NextRequest): LocaleCode {
  const accept = req.headers.get('Accept-Language');
  if (!accept) return 'en';
  const parts = accept
    .split(',')
    .map((s) => s.split(';')[0]?.trim().toLowerCase());
  for (const part of parts) {
    const code = part?.split('-')[0];
    if (code && SUPPORTED_SET.has(code)) return code as LocaleCode;
  }
  return 'en';
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
