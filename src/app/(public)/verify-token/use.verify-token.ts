'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi } from '@/client-api/auth.api';
import { getApiErrorMessage } from '@/shared/lib/api-error-message';

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

const VerifyTokenSchema = z.object({
  mfaCode: z.string().length(6, 'Enter the 6-digit code from your email'),
});

export type VerifyTokenForm = z.infer<typeof VerifyTokenSchema>;

export function useVerifyToken() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const form = useForm<VerifyTokenForm>({
    resolver: zodResolver(VerifyTokenSchema),
    defaultValues: { mfaCode: '' },
  });

  const verifyMutation = useMutation({
    mutationFn: (params: { mfaCode: string; sessionId: string }) =>
      authApi.verifyMfa(params),
    onSuccess: async () => {
      // Refetch auth session so refresh() runs with the new cookie before we navigate.
      // Otherwise the redirect to / can trigger refresh before the cookie is sent.
      try {
        await queryClient.refetchQueries({ queryKey: AUTH_QUERY_KEY });
      } catch {
        // If refetch fails, still navigate; AuthProvider will retry on /
      }
      router.push('/');
      router.refresh();
    },
    onError: async (err: unknown) => {
      const message = await getApiErrorMessage(err, {
        401: 'Invalid or expired code. Please sign in again to get a new code.',
        500: 'Something went wrong. Please try again or sign in to get a new code.',
      });
      form.setError('root', { message });
    },
  });

  const onSubmit = (data: VerifyTokenForm) => {
    if (sessionId) {
      verifyMutation.mutate({ mfaCode: data.mfaCode, sessionId });
    }
  };

  return { sessionId, form, verifyMutation, onSubmit };
}
