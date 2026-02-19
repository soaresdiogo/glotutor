'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const CEFR_DESCRIPTIONS: Record<string, string> = {
  A1: 'Beginner — You can understand basic expressions and introduce yourself.',
  A2: 'Elementary — You can communicate in simple routine tasks.',
  B1: 'Intermediate — You can deal with most situations while travelling.',
  B2: 'Upper intermediate — You can interact with fluency on familiar topics.',
  C1: 'Advanced — You can use the language flexibly for professional purposes.',
  C2: 'Proficient — You can understand virtually everything heard or read.',
};

export type OnboardingStep = 'language' | 'path' | 'level-select' | 'confirm';

export function useOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');

  const goToPathStep = useCallback((language: string) => {
    setSelectedLanguage(language);
    setStep('path');
  }, []);

  const goToPlacementTest = useCallback(() => {
    if (!selectedLanguage) return;
    router.push(`/dashboard/placement-test/${selectedLanguage}?onboarding=1`);
  }, [selectedLanguage, router]);

  const goToLevelSelect = useCallback(() => {
    setStep('level-select');
  }, []);

  const goToConfirm = useCallback(
    (level: string) => {
      if (!selectedLanguage) return;
      router.push(
        `/dashboard/onboarding/confirm?language=${encodeURIComponent(selectedLanguage)}&level=${encodeURIComponent(level)}`,
      );
    },
    [selectedLanguage, router],
  );

  return {
    step,
    selectedLanguage,
    selectedLevel,
    setSelectedLevel,
    CEFR_LEVELS: CEFR_LEVELS as unknown as string[],
    CEFR_DESCRIPTIONS,
    goToPathStep,
    goToPlacementTest,
    goToLevelSelect,
    goToConfirm,
  };
}
