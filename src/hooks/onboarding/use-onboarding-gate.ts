'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { userLanguagesApi } from '@/client-api/user-languages.api';

const ONBOARDING_PREFIX = '/dashboard/onboarding';
const PLACEMENT_TEST_PREFIX = '/dashboard/placement-test';

export function useOnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['user-languages-check'],
    queryFn: () => userLanguagesApi.check(),
    staleTime: 60 * 1000,
  });

  const hasLanguages = data?.hasLanguages ?? false;
  const isOnboardingRoute = pathname?.startsWith(ONBOARDING_PREFIX) ?? false;
  const isPlacementTestRoute =
    pathname?.startsWith(PLACEMENT_TEST_PREFIX) ?? false;
  const isAllowedWithoutLanguages = isOnboardingRoute || isPlacementTestRoute;

  useEffect(() => {
    if (isLoading || hasLanguages) return;
    if (isAllowedWithoutLanguages) return;
    router.replace('/dashboard/onboarding');
  }, [hasLanguages, isLoading, isAllowedWithoutLanguages, router]);

  return {
    hasLanguages,
    isLoading,
    requiresOnboarding: !hasLanguages && !isAllowedWithoutLanguages,
  };
}
