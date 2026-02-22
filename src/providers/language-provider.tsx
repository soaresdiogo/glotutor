'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { userLanguagesApi } from '@/client-api/user-languages.api';

const ACTIVE_LANGUAGE_KEY = 'glotutor-active-language';

type LanguageContextValue = {
  activeLanguage: string;
  setActiveLanguage: (language: string) => void;
  languages: Array<{
    language: string;
    currentLevel: string;
    isPrimary: boolean;
    currentStreakDays: number;
    longestStreakDays: number;
    progressId: string;
  }>;
  isLoading: boolean;
  refetchLanguages: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();
  const [activeLanguage, setActiveLanguageState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem(ACTIVE_LANGUAGE_KEY) ?? 'en';
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-languages'],
    queryFn: () => userLanguagesApi.list(),
    staleTime: 60 * 1000,
  });

  const languages = data?.languages ?? [];
  const firstLanguage = languages[0]?.language ?? 'en';

  useEffect(() => {
    const hasActive = languages.some((l) => l.language === activeLanguage);
    if (languages.length > 0 && !hasActive) {
      setActiveLanguageState(firstLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_LANGUAGE_KEY, firstLanguage);
      }
    }
  }, [languages, activeLanguage, firstLanguage]);

  const setActiveLanguage = useCallback(
    (language: string) => {
      setActiveLanguageState(language);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_LANGUAGE_KEY, language);
      }
      queryClient.invalidateQueries({ queryKey: ['level-progress'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['native-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['listening', 'podcasts'] });
      queryClient.invalidateQueries({ queryKey: ['speaking', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['speaking', 'topic'] });
      queryClient.invalidateQueries({
        queryKey: ['speaking', 'lastCompletedSession'],
      });
      queryClient.invalidateQueries({ queryKey: ['reading', 'texts'] });
    },
    [queryClient],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      activeLanguage: languages.some((l) => l.language === activeLanguage)
        ? activeLanguage
        : firstLanguage,
      setActiveLanguage,
      languages,
      isLoading,
      refetchLanguages: refetch,
    }),
    [
      activeLanguage,
      firstLanguage,
      languages,
      isLoading,
      refetch,
      setActiveLanguage,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return ctx;
}
