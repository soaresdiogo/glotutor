'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslate } from '@/locales';
import { useVerifyEmail } from './use.verify-email';

export default function VerifyEmailPage() {
  const { t } = useTranslate();
  const { token, status, errorMessage } = useVerifyEmail();

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-medium tracking-tight text-(--text)">
                {t('verifyEmail.verifyingEmail')}
              </h1>
              <p className="mt-2 text-sm text-(--text-muted)">
                {t('verifyEmail.pleaseWait')}
              </p>
            </>
          )}
          {(status === 'error' || (status === 'idle' && !token)) && (
            <>
              <h1 className="text-2xl font-medium tracking-tight text-(--text)">
                {t('verifyEmail.verificationFailed')}
              </h1>
              <Callout.Root color="red" size="1" className="mt-4 rounded-lg">
                {errorMessage}
              </Callout.Root>
              <p className="mt-6 text-center text-sm text-(--text-muted)">
                <Link
                  href="/login"
                  className="font-medium text-(--accent) hover:underline"
                >
                  {t('common.backToLogin')}
                </Link>
              </p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-medium tracking-tight text-(--text)">
                {t('verifyEmail.emailVerified')}
              </h1>
              <p className="mt-2 text-sm text-(--text-muted)">
                {t('verifyEmail.redirectingSignIn')}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
