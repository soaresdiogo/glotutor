'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '@/client-api/auth.api';
import {
  type LoginDto,
  LoginSchema,
} from '@/features/auth/application/dto/login.dto';
import { maskEmail } from '@/shared/lib/mask-email';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idEmail = useId();
  const idPassword = useId();
  const registered = searchParams.get('registered') === '1';
  const verified = searchParams.get('verified') === '1';
  const [maskedEmail, setMaskedEmail] = useState('');

  useEffect(() => {
    if (!registered || globalThis.window === undefined) return;
    const email = sessionStorage.getItem('glotutor_registered_email');
    if (email) {
      setMaskedEmail(maskEmail(email));
      sessionStorage.removeItem('glotutor_registered_email');
    }
  }, [registered]);

  const form = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (data) => {
      if (data.requiresMfa) {
        router.push(
          `/verify-token?sessionId=${encodeURIComponent(data.sessionId)}`,
        );
      }
    },
    onError: async (err: unknown) => {
      let message = 'Invalid email or password.';
      const res = (err as { response?: Response })?.response;
      if (res) {
        try {
          const data = (await res.json()) as { message?: string };
          if (data?.message) message = data.message;
        } catch {
          // ignore
        }
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      form.setError('root', { message });
    },
  });

  const onSubmit = (data: LoginDto) => loginMutation.mutate(data);

  return {
    idEmail,
    idPassword,
    registered,
    verified,
    maskedEmail,
    form,
    loginMutation,
    onSubmit,
  };
}
