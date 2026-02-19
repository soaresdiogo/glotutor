'use client';

import type { useLanguageSwitcher } from '@/hooks/language-switcher';
import { useTranslate } from '@/locales';

type LanguageSwitcherProps = ReturnType<typeof useLanguageSwitcher>;

export function LanguageSwitcher({
  activeLanguage,
  activeFlag,
  activeLanguageName,
  languages,
  isLoading,
  switchTo,
  goToAddLanguage,
  getLanguageName,
  getFlag,
}: Readonly<LanguageSwitcherProps>) {
  const { t } = useTranslate();

  if (isLoading) {
    return <div className="h-10 w-12 animate-pulse rounded-xl bg-(--border)" />;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          {activeFlag}
        </span>
        <select
          value={activeLanguage}
          onChange={(e) => switchTo(e.target.value)}
          aria-label={t('common.language')}
          className="cursor-pointer rounded-xl border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium text-(--text) transition hover:border-(--border-light) focus:outline-none focus:ring-2 focus:ring-(--accent)"
        >
          {languages.map((lang) => (
            <option key={lang.language} value={lang.language}>
              {getFlag(lang.language)} {getLanguageName(lang.language)}{' '}
              {lang.currentLevel}
              {lang.currentStreakDays > 0
                ? ` 🔥 ${lang.currentStreakDays}`
                : ''}
            </option>
          ))}
        </select>
      </label>
      <span className="hidden text-sm text-(--text-muted) sm:inline">
        {activeLanguageName}
      </span>
      <button
        type="button"
        onClick={goToAddLanguage}
        className="cursor-pointer rounded-xl border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm text-(--accent) transition hover:border-(--border-light) hover:bg-(--bg-card)"
      >
        {t('dashboard.addLanguage')}
      </button>
    </div>
  );
}
