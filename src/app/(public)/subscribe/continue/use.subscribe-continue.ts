'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { httpClient } from '@/shared/lib/http-client';

export type SubscribeContinueStatus =
  | 'idle'
  | 'loading'
  | 'redirecting'
  | 'error';

export function useSubscribeContinue() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<SubscribeContinueStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage(
        'Invalid or missing link. Please sign up again and use the link from your email.',
      );
      return;
    }
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const result = await httpClient
          .post('subscriptions/create-checkout-from-link', {
            json: { token },
          })
          .json<{ checkoutUrl: string | null }>();
        if (cancelled) return;
        if (result.checkoutUrl) {
          setStatus('redirecting');
          globalThis.location.href = result.checkoutUrl;
        } else {
          setStatus('error');
          setErrorMessage(
            'Could not create checkout. Please try the link from your email again.',
          );
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        const res = (err as { response?: Response })?.response;
        let message =
          'This link has expired or is invalid. Please sign up again to receive a new link.';
        if (res) {
          try {
            const data = (await res.json()) as { message?: string };
            if (data?.message) message = data.message;
          } catch {
            // ignore
          }
        }
        setErrorMessage(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const goToSubscribe = () => router.push('/subscribe?plan=pro');
  const goToLogin = () => router.push('/login');

  return {
    token,
    status,
    errorMessage,
    goToSubscribe,
    goToLogin,
  };
}
