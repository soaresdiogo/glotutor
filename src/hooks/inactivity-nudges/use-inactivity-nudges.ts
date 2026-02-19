'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { userLanguagesApi } from '@/client-api/user-languages.api';
import { useLanguageContext } from '@/providers/language-provider';

const DISMISS_KEY_PREFIX = 'glotutor-nudge-dismiss-';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

function getDismissedUntil(language: string): number | null {
  if (typeof globalThis.window === 'undefined') return null;
  const raw = globalThis.localStorage.getItem(
    `${DISMISS_KEY_PREFIX}${language}`,
  );
  if (!raw) return null;
  const t = Number.parseInt(raw, 10);
  return Number.isFinite(t) ? t : null;
}

function setDismissed(language: string): void {
  if (typeof globalThis.window === 'undefined') return;
  const until = Date.now() + DISMISS_TTL_MS;
  globalThis.localStorage.setItem(
    `${DISMISS_KEY_PREFIX}${language}`,
    String(until),
  );
}

export type InactiveReminder = {
  language: string;
  daysSinceActivity: number;
};

export function useInactivityNudges() {
  const { setActiveLanguage } = useLanguageContext();
  const [dismissedSet, setDismissedSet] = useState<Set<string>>(
    () => new Set(),
  );

  const { data } = useQuery({
    queryKey: ['user-languages', 'inactive-reminders'],
    queryFn: () => userLanguagesApi.getInactiveReminders(),
    staleTime: 1000 * 60 * 5,
  });

  const reminders = useMemo(() => {
    const list = (data?.reminders ?? []) as InactiveReminder[];
    const now = Date.now();
    return list.filter((r) => {
      const until = getDismissedUntil(r.language);
      if (until != null && now < until) return false;
      if (dismissedSet.has(r.language)) return false;
      return true;
    });
  }, [data?.reminders, dismissedSet]);

  const dismiss = useCallback((language: string) => {
    setDismissed(language);
    setDismissedSet((prev) => new Set(prev).add(language));
  }, []);

  const practiceNow = useCallback(
    (language: string) => {
      setActiveLanguage?.(language);
      dismiss(language);
    },
    [setActiveLanguage, dismiss],
  );

  return { reminders, dismiss, practiceNow };
}
