'use client';

import {
  LOCALE_LABELS,
  type LocaleCode,
  SUPPORTED_LOCALES,
  useTranslate,
} from '@/locales';

type LanguageSelectProps = Readonly<{
  className?: string;
  'aria-label'?: string;
}>;

export function LanguageSelect({
  className = '',
  'aria-label': ariaLabel,
}: LanguageSelectProps) {
  const { locale, setLocale, t } = useTranslate();

  const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleCode)}
      style={{ backgroundImage: chevronSvg }}
      className={`appearance-none rounded-lg border border-(--border) bg-(--bg-elevated) bg-size-[1.25rem] bg-position-[right_0.75rem_center] bg-no-repeat py-2 pl-3 pr-10 text-sm text-(--text) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft) ${className}`}
      aria-label={ariaLabel ?? t('common.language')}
    >
      {SUPPORTED_LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
