'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { userLanguagesApi } from '@/client-api/user-languages.api';
import { useLanguageContext } from '@/providers/language-provider';

const LANGUAGE_NAMES: Record<string, string> = {
  pt: 'Portuguese',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  fr: 'French',
  de: 'German',
};

export default function OnboardingConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setActiveLanguage } = useLanguageContext();
  const language = searchParams.get('language') ?? '';
  const level = searchParams.get('level') ?? 'A1';
  const attemptId = searchParams.get('attemptId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!language) {
      router.replace('/dashboard/onboarding');
    }
  }, [language, router]);

  const handleConfirm = useCallback(async () => {
    if (!language) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await userLanguagesApi.add({
        language,
        ...(attemptId && { placementAttemptId: attemptId }),
        selectedLevel: level,
      });
      await queryClient.invalidateQueries({
        queryKey: ['user-languages-check'],
      });
      await queryClient.invalidateQueries({ queryKey: ['user-languages'] });
      setActiveLanguage(language);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  }, [language, level, attemptId, router, queryClient, setActiveLanguage]);

  if (!language) {
    return null;
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-6">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-6 text-5xl" aria-hidden>
          🎉
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-(--text)">
          You&apos;re starting at {level} in{' '}
          {LANGUAGE_NAMES[language] ?? language}
        </h2>
        <p className="mb-8 text-(--text-muted)">
          Let&apos;s go! Your personalized learning experience is ready.
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
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-(--accent) py-4 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Setting up…' : "Let's go!"}
        </button>
      </div>
    </main>
  );
}
