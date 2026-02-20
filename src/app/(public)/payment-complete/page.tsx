'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslate } from '@/locales';
import { httpClient } from '@/shared/lib/http-client';

export default function PaymentCompletePage() {
  const { t } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage(t('paymentComplete.errorMissingSession'));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const session = await httpClient
          .get(`subscriptions/checkout-session/${sessionId}`)
          .json<{
            sessionId: string;
            paymentStatus: string;
            customerEmail: string | null;
            subscriptionId: string | null;
            metadata: Record<string, string>;
          }>();
        if (cancelled) return;
        await httpClient
          .post('subscriptions/complete-registration', {
            json: {
              sessionId,
              email: session.customerEmail ?? undefined,
            },
          })
          .json();
        if (cancelled) return;
        setStatus('success');
        setTimeout(() => router.replace('/login'), 2000);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          err instanceof Error
            ? err.message
            : t('paymentComplete.errorGeneric'),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
        {status === 'loading' && (
          <p className="text-center text-(--text)">
            {t('paymentComplete.loading')}
          </p>
        )}
        {status === 'success' && (
          <p className="text-center text-(--text)">
            {t('paymentComplete.success')}
          </p>
        )}
        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-center text-(--red)">{message}</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white"
              >
                {t('paymentComplete.goToLogin')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
