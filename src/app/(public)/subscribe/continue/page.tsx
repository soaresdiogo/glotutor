'use client';

import Link from 'next/link';
import { useTranslate } from '@/locales';
import { useSubscribeContinue } from './use.subscribe-continue';

export default function SubscribeContinuePage() {
  const { t } = useTranslate();
  const { status, errorMessage, goToSubscribe } = useSubscribeContinue();

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
        {(status === 'loading' || status === 'redirecting') && (
          <p className="text-center text-(--text)">
            {t('subscribe.continueProcessing')}
          </p>
        )}
        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-center text-(--red)">{errorMessage}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={goToSubscribe}
                className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white"
              >
                {t('subscribe.continueTryAgain')}
              </button>
              <Link
                href="/login"
                className="text-center text-sm font-medium text-(--accent) hover:underline"
              >
                {t('common.backToLogin')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
