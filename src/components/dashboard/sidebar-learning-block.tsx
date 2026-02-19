'use client';

import { useLanguageSwitcher } from '@/hooks/language-switcher';
import { useProgress } from '@/hooks/use-progress';
import { useTranslate } from '@/locales';

const CHEVRON_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")";

/**
 * Compact language + streak block for the sidebar.
 * Replaces the header language switcher for better responsive/mobile UX.
 */
export function SidebarLearningBlock() {
  const { t } = useTranslate();
  const languageSwitcher = useLanguageSwitcher();
  const { data: progressData } = useProgress();
  const streak = progressData?.overview?.streakDays ?? 0;

  if (languageSwitcher.languages.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-(--border) px-3 py-4">
      <div className="rounded-xl border border-(--border) bg-(--bg-elevated) p-3">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
            {t('common.language')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {languageSwitcher.activeFlag}
            </span>
            <select
              value={languageSwitcher.activeLanguage}
              onChange={(e) => languageSwitcher.switchTo(e.target.value)}
              aria-label={t('common.language')}
              style={{ backgroundImage: CHEVRON_SVG }}
              className="min-w-0 flex-1 appearance-none rounded-lg border border-(--border) bg-(--bg) bg-size-[1.25rem] bg-position-[right_0.75rem_center] bg-no-repeat py-2 pl-2 pr-10 text-sm font-medium text-(--text) transition focus:outline-none focus:ring-2 focus:ring-(--accent)"
            >
              {languageSwitcher.languages.map((lang) => (
                <option key={lang.language} value={lang.language}>
                  {languageSwitcher.getFlag(lang.language)}{' '}
                  {languageSwitcher.getLanguageName(lang.language)}{' '}
                  {lang.currentLevel}
                  {lang.currentStreakDays > 0
                    ? ` · ${lang.currentStreakDays} 🔥`
                    : ''}
                </option>
              ))}
            </select>
          </div>
        </label>
        <div className="mt-3 flex items-center justify-between gap-2">
          <output
            className="flex items-center gap-1.5 text-sm text-(--text-muted)"
            aria-label={t('dashboard.streakStatus')}
          >
            <span aria-hidden>🔥</span>
            <span className="font-semibold tabular-nums text-(--orange)">
              {streak}
            </span>
            <span>{t('dashboard.streakDays')}</span>
          </output>
          <button
            type="button"
            onClick={languageSwitcher.goToAddLanguage}
            className="cursor-pointer rounded-lg border border-(--border) bg-(--bg) px-2.5 py-1.5 text-xs font-medium text-(--accent) transition hover:border-(--accent/50) hover:bg-(--accent/5)"
          >
            + {t('dashboard.addLanguage')}
          </button>
        </div>
      </div>
    </div>
  );
}
