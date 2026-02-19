'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslate } from '@/locales';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
