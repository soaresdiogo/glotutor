'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import { studentProfileApi } from '@/client-api/student-profile.api';
import { userLanguagesApi } from '@/client-api/user-languages.api';
import {
  type ExistingLanguagesMap,
  LanguageGrid,
} from '@/components/onboarding/LanguageGrid';
import { LevelSelector } from '@/components/placement-test/LevelSelector';
import { useTranslate } from '@/locales';
import { useLanguageContext } from '@/providers/language-provider';
import { useAddLanguageModal } from './AddLanguageModalProvider';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const CEFR_DESCRIPTIONS: Record<string, string> = {
  A1: 'Beginner — You can understand basic expressions and introduce yourself.',
  A2: 'Elementary — You can communicate in simple routine tasks.',
  B1: 'Intermediate — You can deal with most situations while travelling.',
  B2: 'Upper intermediate — You can interact with fluency on familiar topics.',
  C1: 'Advanced — You can use the language flexibly for professional purposes.',
  C2: 'Proficient — You can understand virtually everything heard or read.',
};

const LANGUAGE_NAMES: Record<string, string> = {
  pt: 'Portuguese',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  fr: 'French',
  de: 'German',
};

type Step = 'language' | 'path' | 'level-select' | 'confirm';

export function AddLanguageModal() {
  const { t } = useTranslate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { closeAddLanguageModal, isOpen } = useAddLanguageModal();
  const { setActiveLanguage } = useLanguageContext();
  const titleId = useId();

  const [step, setStep] = useState<Step>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: languagesData } = useQuery({
    queryKey: ['user-languages'],
    queryFn: () => userLanguagesApi.list(),
    staleTime: 60 * 1000,
    enabled: isOpen,
  });

  const { data: profileData } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
    staleTime: 60 * 1000,
    enabled: isOpen,
  });

  const nativeLanguageCode = profileData?.profile?.nativeLanguageCode ?? null;

  const existingLanguages = useMemo<ExistingLanguagesMap>(() => {
    const list = languagesData?.languages ?? [];
    return new Map(list.map((l) => [l.language, l.currentLevel]));
  }, [languagesData?.languages]);

  const handleSelectLanguage = useCallback((language: string) => {
    setSelectedLanguage(language);
    setStep('path');
  }, []);

  const handlePlacementTest = useCallback(() => {
    if (!selectedLanguage) return;
    closeAddLanguageModal();
    router.push(`/dashboard/placement-test/${selectedLanguage}?onboarding=1`);
  }, [selectedLanguage, closeAddLanguageModal, router]);

  const handleLevelSelect = useCallback(() => {
    setStep('level-select');
  }, []);

  const handleConfirmLevel = useCallback((level: string) => {
    setSelectedLevel(level);
    setStep('confirm');
  }, []);

  const handleAddAndClose = useCallback(async () => {
    if (!selectedLanguage) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await userLanguagesApi.add({
        language: selectedLanguage,
        selectedLevel: selectedLevel,
      });
      await queryClient.invalidateQueries({
        queryKey: ['user-languages-check'],
      });
      await queryClient.invalidateQueries({ queryKey: ['user-languages'] });
      setActiveLanguage(selectedLanguage);
      closeAddLanguageModal();
      setStep('language');
      setSelectedLanguage(null);
      setSelectedLevel('A1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedLanguage,
    selectedLevel,
    queryClient,
    setActiveLanguage,
    closeAddLanguageModal,
  ]);

  const handleClose = useCallback(() => {
    closeAddLanguageModal();
    setStep('language');
    setSelectedLanguage(null);
    setSelectedLevel('A1');
    setError(null);
  }, [closeAddLanguageModal]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--bg) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <h2 id={titleId} className="text-lg font-semibold text-(--text)">
            {t('dashboard.addLanguageModalTitle')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-(--text-muted) transition hover:bg-(--bg-elevated) hover:text-(--text)"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <title>Close</title>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'language' && (
            <>
              <p className="mb-6 text-sm text-(--text-muted)">
                Choose a language to start learning.
              </p>
              <LanguageGrid
                selectedLanguage={selectedLanguage}
                onSelect={handleSelectLanguage}
                existingLanguages={existingLanguages}
                excludeNativeLanguageCode={nativeLanguageCode}
              />
            </>
          )}

          {step === 'path' && (
            <>
              <p className="mb-2 text-sm text-(--text-muted)">
                You selected{' '}
                {LANGUAGE_NAMES[selectedLanguage ?? ''] ?? selectedLanguage}
              </p>
              <h3 className="mb-6 text-lg font-semibold text-(--text)">
                How would you like to start?
              </h3>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handlePlacementTest}
                  className="rounded-2xl border-2 border-(--accent) bg-(--accent/10) px-6 py-4 text-left font-medium text-(--text) transition hover:bg-(--accent/20)"
                >
                  <span className="block text-lg">Take the placement test</span>
                  <span className="text-sm text-(--text-muted)">
                    Answer a few questions so we can recommend the right level
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLevelSelect}
                  className="rounded-2xl border-2 border-(--border) bg-(--bg-card) px-6 py-4 text-left font-medium text-(--text) transition hover:border-(--accent/50)"
                >
                  <span className="block text-lg">I already know my level</span>
                  <span className="text-sm text-(--text-muted)">
                    Choose your CEFR level (A1–C2) and start learning
                  </span>
                </button>
              </div>
            </>
          )}

          {step === 'level-select' && (
            <>
              <h3 className="mb-2 text-lg font-semibold text-(--text)">
                Select your level
              </h3>
              <p className="mb-6 text-sm text-(--text-muted)">
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
                levels={CEFR_LEVELS as unknown as string[]}
                selectedLevel={selectedLevel}
                onSelect={setSelectedLevel}
                onConfirm={() => handleConfirmLevel(selectedLevel)}
              />
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="mb-6 text-5xl" aria-hidden>
                🎉
              </div>
              <h3 className="mb-2 text-xl font-semibold text-(--text)">
                You&apos;re starting at {selectedLevel} in{' '}
                {LANGUAGE_NAMES[selectedLanguage ?? ''] ?? selectedLanguage}
              </h3>
              <p className="mb-6 text-(--text-muted)">
                Let&apos;s begin! Your new language will be added and set as
                active.
              </p>
              {error && (
                <p
                  className="mb-4 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleAddAndClose}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-(--accent) py-4 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding…' : "Let's go!"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
