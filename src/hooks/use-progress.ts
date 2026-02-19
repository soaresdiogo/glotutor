'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { progressApi } from '@/client-api/progress.api';

/**
 * Format an ISO date string for display (relative or absolute).
 */
export function formatProgressDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(d);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(d);
}

/**
 * Format total practice minutes for display (e.g. "2.5h" or "45 min").
 */
export function formatPracticeMinutes(
  totalMinutes: number,
  minutesShortLabel: string,
): string {
  if (totalMinutes >= 60) {
    return `${(totalMinutes / 60).toFixed(1)}h`;
  }
  return `${totalMinutes} ${minutesShortLabel}`;
}

/**
 * Format accuracy (0–1) as percentage string (e.g. "85%").
 */
export function formatAccuracyPercent(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

export function useProgress() {
  const query = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.get(),
  });

  const totalCompleted = useMemo(() => {
    const data = query.data;
    if (!data) return 0;
    return (
      data.nativeLessons.length +
      data.listening.length +
      data.reading.length +
      data.speaking.length
    );
  }, [query.data]);

  return {
    ...query,
    formatDate: formatProgressDate,
    formatPracticeMinutes,
    formatAccuracyPercent,
    totalCompleted,
  };
}
