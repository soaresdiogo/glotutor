'use client';

import Link from 'next/link';
import { useLevelProgress } from '@/hooks/level-progress/use-level-progress';
import { useTranslate } from '@/locales';
import { useLanguageContext } from '@/providers/language-provider';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LANGUAGE_NAMES: Record<string, string> = {
  pt: 'Portuguese',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  fr: 'French',
  de: 'German',
};

const FLAGS: Record<string, string> = {
  pt: '🇵🇹',
  en: '🇬🇧',
  es: '🇪🇸',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
};

export default function PathPage() {
  const { t } = useTranslate();
  const { languages, activeLanguage, setActiveLanguage } = useLanguageContext();
  const { data: levelData, isLoading } = useLevelProgress();

  const activeLang = languages.find((l) => l.language === activeLanguage);
  const currentLevel = activeLang?.currentLevel ?? 'A1';
  const currentIndex = CEFR_LEVELS.indexOf(currentLevel);

  if (languages.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 p-6">
        <h1 className="mb-2 text-2xl font-semibold text-(--text)">
          {t('dashboard.myPath')}
        </h1>
        <p className="text-(--text-muted)">
          Add a language from the sidebar to see your learning path.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 p-6">
      <h1 className="mb-2 text-2xl font-semibold text-(--text)">
        {t('dashboard.myPath')}
      </h1>
      <p className="mb-8 text-(--text-muted)">
        Your journey through each language and CEFR level. Switch languages
        below to see progress per language.
      </p>

      {/* Language tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {languages.map((lang) => {
          const isActive = lang.language === activeLanguage;
          return (
            <button
              key={lang.language}
              type="button"
              onClick={() => setActiveLanguage(lang.language)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-(--accent) bg-(--accent/10) text-(--accent)'
                  : 'border-(--border) bg-(--bg-card) text-(--text-muted) hover:border-(--accent/50) hover:text-(--text)'
              }`}
            >
              <span aria-hidden>{FLAGS[lang.language] ?? '🌐'}</span>
              {LANGUAGE_NAMES[lang.language] ?? lang.language}
              <span className="rounded-full bg-(--bg-elevated) px-2 py-0.5 text-xs tabular-nums">
                {lang.currentLevel}
              </span>
            </button>
          );
        })}
      </div>

      {/* CEFR ladder for active language */}
      <section className="mb-10" aria-label="CEFR levels">
        <h2 className="mb-4 text-lg font-semibold text-(--text)">
          {LANGUAGE_NAMES[activeLanguage] ?? activeLanguage} — CEFR progression
        </h2>
        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map((level, i) => {
            const isCurrent = level === currentLevel;
            const isPast = i < currentIndex;
            const isFuture = i > currentIndex;
            let pillClass = 'rounded-lg px-3 py-1.5 text-sm font-medium ';
            if (isCurrent) pillClass += 'bg-(--accent) text-white';
            else if (isPast)
              pillClass += 'bg-(--bg-elevated) text-(--text-muted)';
            else if (isFuture)
              pillClass += 'bg-(--border) text-(--text-muted) opacity-60';
            else pillClass += 'bg-(--bg-elevated) text-(--text)';
            return (
              <span key={level} className={pillClass}>
                {level}
                {isPast && ' ✓'}
              </span>
            );
          })}
        </div>
      </section>

      {/* Level progress summary for active language */}
      {isLoading && (
        <div className="mb-10 h-48 animate-pulse rounded-2xl bg-(--border)" />
      )}
      {!isLoading && levelData && (
        <section className="mb-10 rounded-2xl border border-(--border) bg-(--bg-card) p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-(--text)">
              Progress to next level
            </h2>
            <Link
              href="/dashboard/level-progress"
              className="text-sm font-medium text-(--accent) no-underline hover:underline"
            >
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-(--accent) bg-(--bg)">
              <span className="text-xl font-bold text-(--text)">
                {levelData.completionPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
          <p className="mb-4 text-center text-sm text-(--text-muted)">
            {levelData.lessonsCompleted}/{levelData.lessonsTotal} lessons ·{' '}
            {levelData.podcastsCompleted}/{levelData.podcastsTotal} podcasts ·{' '}
            {levelData.readingsCompleted}/{levelData.readingsTotal} readings
          </p>
          <Link
            href="/dashboard/level-progress"
            className="block rounded-xl bg-(--accent) px-4 py-3 text-center text-sm font-medium text-white no-underline transition hover:opacity-90"
          >
            View full level progress
          </Link>
        </section>
      )}

      {/* All languages summary cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-(--text)">
          Your languages
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {languages.map((lang) => (
            <li key={lang.language}>
              <Link
                href="/dashboard/level-progress"
                onClick={() => setActiveLanguage(lang.language)}
                className="flex items-center gap-4 rounded-2xl border border-(--border) bg-(--bg-card) p-4 no-underline transition hover:border-(--accent/50) hover:bg-(--bg-elevated)"
              >
                <span className="text-3xl" aria-hidden>
                  {FLAGS[lang.language] ?? '🌐'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-(--text)">
                    {LANGUAGE_NAMES[lang.language] ?? lang.language}
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    Level {lang.currentLevel}
                    {lang.currentStreakDays > 0 &&
                      ` · 🔥 ${lang.currentStreakDays} day streak`}
                  </p>
                </div>
                <span className="text-(--text-muted)" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
