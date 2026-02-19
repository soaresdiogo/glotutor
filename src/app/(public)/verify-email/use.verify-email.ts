'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export type VerifyEmailStatus = 'idle' | 'loading' | 'success' | 'error';

export function useVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerifyEmailStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage(
        'Invalid verification link. Please check your email or request a new link.',
      );
      return;
    }

    setStatus('loading');
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          router.replace('/login?verified=1');
          router.refresh();
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setErrorMessage(
            data?.error ??
              'Invalid or expired link. Please request a new verification email.',
          );
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      });
  }, [token, router]);

  return {
    token,
    status,
    errorMessage,
  };
}
