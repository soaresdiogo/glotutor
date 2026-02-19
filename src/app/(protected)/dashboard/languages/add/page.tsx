'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userLanguagesApi } from '@/client-api/user-languages.api';
import { LANGUAGES } from '@/components/onboarding/LanguageGrid';

export default function AddLanguagePage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['user-languages'],
    queryFn: () => userLanguagesApi.list(),
  });

  const userLanguages = new Set(data?.languages?.map((l) => l.language) ?? []);
  const languageLevels = new Map(
    data?.languages?.map((l) => [l.language, l.currentLevel]) ?? [],
  );

  const handleSelect = (language: string) => {
    if (userLanguages.has(language)) return;
    router.push(`/dashboard/placement-test/${language}?onboarding=0`);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl flex-1 p-6">
        <p className="text-(--text-muted)">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 p-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mb-2 text-2xl font-semibold text-(--text)">
        Add a language
      </h1>
      <p className="mb-8 text-(--text-muted)">
        Choose a language to start learning. You’ll take a quick placement test
        or choose your level.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {LANGUAGES.map((lang) => {
          const added = userLanguages.has(lang.code);
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              disabled={added}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition focus:outline-none focus:ring-2 focus:ring-(--accent) ${
                added
                  ? 'cursor-default border-(--border) bg-(--bg-elevated) opacity-80'
                  : 'border-(--border) bg-(--bg-card) hover:border-(--accent/50)'
              }`}
            >
              <span className="text-4xl" aria-hidden>
                {lang.flag}
              </span>
              <span className="text-sm font-medium text-(--text)">
                {lang.name}
              </span>
              {added && (
                <span className="text-xs text-(--text-muted)">
                  Studying — Level {languageLevels.get(lang.code) ?? '—'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
