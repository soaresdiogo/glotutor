'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { studentProfileApi } from '@/client-api/student-profile.api';
import { userLanguagesApi } from '@/client-api/user-languages.api';
import {
  type ExistingLanguagesMap,
  LanguageGrid,
} from '@/components/onboarding/LanguageGrid';
import { LevelSelector } from '@/components/placement-test/LevelSelector';
import { useOnboarding } from './use.onboarding';

const LANGUAGE_NAMES: Record<string, string> = {
  pt: 'Portuguese',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  fr: 'French',
  de: 'German',
};

export default function OnboardingPage() {
  const { data: languagesData } = useQuery({
    queryKey: ['user-languages'],
    queryFn: () => userLanguagesApi.list(),
    staleTime: 60 * 1000,
  });

  const { data: profileData } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
    staleTime: 60 * 1000,
  });

  const nativeLanguageCode = profileData?.profile?.nativeLanguageCode ?? null;

  const existingLanguages = useMemo<ExistingLanguagesMap>(() => {
    const list = languagesData?.languages ?? [];
    return new Map(list.map((l) => [l.language, l.currentLevel]));
  }, [languagesData?.languages]);

  const {
    step,
    selectedLanguage,
    selectedLevel,
    setSelectedLevel,
    CEFR_LEVELS,
    CEFR_DESCRIPTIONS,
    goToPathStep,
    goToPlacementTest,
    goToLevelSelect,
    goToConfirm,
  } = useOnboarding();

  if (step === 'language') {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-6">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1 className="mb-2 text-3xl font-bold text-(--text)">
            Welcome! Let&apos;s get started
          </h1>
          <p className="mb-10 text-(--text-muted)">
            Choose the language you want to learn first.
          </p>
          <LanguageGrid
            selectedLanguage={selectedLanguage}
            onSelect={goToPathStep}
            existingLanguages={existingLanguages}
            excludeNativeLanguageCode={nativeLanguageCode}
          />
        </div>
      </main>
    );
  }

  if (step === 'path') {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg text-center">
          <p className="mb-2 text-sm text-(--text-muted)">
            You selected{' '}
            {LANGUAGE_NAMES[selectedLanguage ?? ''] ?? selectedLanguage}
          </p>
          <h2 className="mb-6 text-2xl font-semibold text-(--text)">
            How would you like to start?
          </h2>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={goToPlacementTest}
              className="rounded-2xl border-2 border-(--accent) bg-(--accent/10) px-6 py-4 text-left font-medium text-(--text) transition hover:bg-(--accent/20)"
            >
              <span className="block text-lg">Take the placement test</span>
              <span className="text-sm text-(--text-muted)">
                Answer a few questions so we can recommend the right level
              </span>
            </button>
            <button
              type="button"
              onClick={goToLevelSelect}
              className="rounded-2xl border-2 border-(--border) bg-(--bg-card) px-6 py-4 text-left font-medium text-(--text) transition hover:border-(--accent/50)"
            >
              <span className="block text-lg">I already know my level</span>
              <span className="text-sm text-(--text-muted)">
                Choose your CEFR level (A1–C2) and start learning
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (step === 'level-select') {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg">
          <h2 className="mb-2 text-center text-2xl font-semibold text-(--text)">
            Select your level
          </h2>
          <p className="mb-6 text-center text-sm text-(--text-muted)">
            Choose the level that best describes your current ability.
          </p>
          <div className="mb-4 space-y-2">
            {CEFR_LEVELS.map((lvl) => (
              <div
                key={lvl}
                className="rounded-xl border border-(--border) bg-(--bg-card) p-3"
              >
                <p className="text-sm font-medium text-(--text)">{lvl}</p>
                <p className="text-xs text-(--text-muted)">
                  {CEFR_DESCRIPTIONS[lvl]}
                </p>
              </div>
            ))}
          </div>
          <LevelSelector
            levels={CEFR_LEVELS}
            selectedLevel={selectedLevel}
            onSelect={setSelectedLevel}
            onConfirm={() => goToConfirm(selectedLevel)}
          />
        </div>
      </main>
    );
  }

  return null;
}
