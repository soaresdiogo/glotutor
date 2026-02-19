'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { useId } from 'react';

import { useTranslate } from '@/locales';

import { useLearningPreferences } from './use.learning-preferences';

const NATIVE_LABELS: Record<string, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ja: '日本語',
  zh: '中文',
};

const SELECT_CLASS =
  'w-full appearance-none rounded-lg border border-(--border) bg-(--bg-elevated) bg-size-[1.25rem] bg-position-[right_0.75rem_center] bg-no-repeat py-2 pl-3 pr-10 text-sm text-(--text) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)';
const CHEVRON_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
};

export default function LearningPreferencesPage() {
  const { t } = useTranslate();
  const idNative = useId();
  const idTarget = useId();
  const idLevel = useId();
  const {
    profile,
    supportedLanguages,
    options,
    isPending,
    isError,
    updateMutation,
  } = useLearningPreferences();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nativeLanguageCode = (form.nativeLanguageCode as HTMLSelectElement)
      .value;
    const targetLanguageId = (form.targetLanguageId as HTMLSelectElement).value;
    const currentLevel = (form.currentLevel as HTMLSelectElement).value;
    if (!targetLanguageId) return;
    updateMutation.mutate({
      nativeLanguageCode: nativeLanguageCode || undefined,
      targetLanguageId,
      currentLevel: currentLevel || undefined,
    });
  };

  if (isPending) {
    return (
      <main className="flex-1 p-8">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex-1 p-8">
        <Callout.Root color="red" size="1" className="rounded-xl">
          {t('learningPreferences.errorLoading')}
        </Callout.Root>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm text-(--accent) hover:underline"
        >
          ← {t('dashboard.title')}
        </Link>
        <h1 className="mb-1 text-2xl font-medium text-(--text)">
          {t('learningPreferences.title')}
        </h1>
        <p className="mb-8 text-sm text-(--text-muted)">
          {t('learningPreferences.subtitle')}
        </p>

        {updateMutation.isSuccess && (
          <Callout.Root color="green" size="1" className="mb-6 rounded-xl">
            {t('learningPreferences.saved')}
          </Callout.Root>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-2xl border border-(--border) bg-(--bg-card) p-8"
        >
          <div>
            <label
              htmlFor={idNative}
              className="mb-2 block text-sm font-medium text-(--text)"
            >
              {t('learningPreferences.nativeLanguage')}
            </label>
            <select
              id={idNative}
              name="nativeLanguageCode"
              defaultValue={profile?.nativeLanguageCode ?? 'pt-BR'}
              style={CHEVRON_STYLE}
              className={SELECT_CLASS}
            >
              {options.nativeLanguageCodes.map((code) => (
                <option key={code} value={code}>
                  {NATIVE_LABELS[code] ?? code}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-(--text-muted)">
              {t('learningPreferences.nativeLanguageHelp')}
            </p>
          </div>

          <div>
            <label
              htmlFor={idTarget}
              className="mb-2 block text-sm font-medium text-(--text)"
            >
              {t('learningPreferences.targetLanguage')}
            </label>
            <select
              id={idTarget}
              name="targetLanguageId"
              required
              defaultValue={profile?.targetLanguageId ?? ''}
              style={CHEVRON_STYLE}
              className={SELECT_CLASS}
            >
              <option value="">
                {t('learningPreferences.chooseLanguage')}
              </option>
              {supportedLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.nativeName ?? lang.name} ({lang.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-(--text-muted)">
              {t('learningPreferences.targetLanguageHelp')}
            </p>
          </div>

          <div>
            <label
              htmlFor={idLevel}
              className="mb-2 block text-sm font-medium text-(--text)"
            >
              {t('learningPreferences.currentLevel')}
            </label>
            <select
              id={idLevel}
              name="currentLevel"
              defaultValue={profile?.currentLevel ?? 'A1'}
              style={CHEVRON_STYLE}
              className={SELECT_CLASS}
            >
              {options.cefrLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-(--text-muted)">
              {t('learningPreferences.currentLevelHelp')}
            </p>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full cursor-pointer rounded-xl bg-(--accent) py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending
              ? t('learningPreferences.saving')
              : t('learningPreferences.save')}
          </button>
        </form>
      </div>
    </main>
  );
}
