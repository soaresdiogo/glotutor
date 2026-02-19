'use client';

import { useQuery } from '@tanstack/react-query';
import { userLanguagesStatsApi } from '@/client-api/user-languages-stats.api';

export function useLanguageStats() {
  return useQuery({
    queryKey: ['user-languages', 'stats'],
    queryFn: () => userLanguagesStatsApi.getStats(),
  });
}
