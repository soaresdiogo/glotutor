'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslate } from '@/locales';
import { useAuth } from '@/providers/auth-provider';

export default function Home() {
  const { t } = useTranslate();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }
    router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg)">
      <p className="text-(--text-muted)">{t('common.loading')}</p>
    </div>
  );
}
