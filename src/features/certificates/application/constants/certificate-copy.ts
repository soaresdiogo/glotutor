import { translations } from '@/locales/translations';
import type { LocaleCode } from '@/locales/types';

/**
 * Texts shown on the certificate (by course language).
 * Keys come from src/locales/*.json under "certificate.*".
 */
export type CertificateCopy = {
  completionLabel: string;
  certifiesThat: string;
  completedSuccessfully: string;
  courseNameTemplate: string;
  platformName: string;
  skillsDescription: string;
  workloadLabel: string;
  completionDateLabel: string;
  modalityLabel: string;
  modalityValue: string;
  directorRole: string;
  platformRole: string;
  footerDisclaimer: string;
  hours: string;
};

const CERTIFICATE_KEYS: (keyof CertificateCopy)[] = [
  'completionLabel',
  'certifiesThat',
  'completedSuccessfully',
  'courseNameTemplate',
  'platformName',
  'skillsDescription',
  'workloadLabel',
  'completionDateLabel',
  'modalityLabel',
  'modalityValue',
  'directorRole',
  'platformRole',
  'footerDisclaimer',
  'hours',
];

const KEY_PREFIX = 'certificate.';

function toLocaleCode(langCode: string): LocaleCode {
  const base = langCode.split('-')[0]?.toLowerCase() ?? 'en';
  const supported: LocaleCode[] = ['en', 'pt', 'es', 'it', 'fr', 'de'];
  return supported.includes(base as LocaleCode) ? (base as LocaleCode) : 'en';
}

/**
 * Returns certificate copy for the given language using src/locales translations.
 * Used so the certificate is always rendered in the course language, not the app UI locale.
 */
export function getCertificateCopy(langCode: string): CertificateCopy {
  const locale = toLocaleCode(langCode);
  const record = translations[locale] ?? translations.en;
  const fallback = translations.en;

  const copy: Record<string, string> = {};
  for (const key of CERTIFICATE_KEYS) {
    const fullKey = KEY_PREFIX + key;
    copy[key] = record[fullKey] ?? fallback?.[fullKey] ?? '';
  }
  return copy as CertificateCopy;
}
