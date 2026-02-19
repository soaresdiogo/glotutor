'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '@/client-api/auth.api';
import {
  type RegisterDto,
  RegisterSchema,
} from '@/features/auth/application/dto/register.dto';
import { safeZodResolver } from '@/shared/lib/safe-zod-resolver';

export function useSignup() {
  const router = useRouter();
  const idName = useId();
  const idEmail = useId();
  const idPassword = useId();
  const idConfirm = useId();

  const form = useForm<RegisterDto>({
    resolver: safeZodResolver<RegisterDto>(RegisterSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { touchedFields, isSubmitted, errors } = form.formState;
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const showError = (field: keyof RegisterDto) =>
    (touchedFields[field] || isSubmitted) && errors[field];

  const signupMutation = useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (_data, variables) => {
      if (globalThis.window !== undefined) {
        sessionStorage.setItem('glotutor_registered_email', variables.email);
      }
      router.push('/login?registered=1');
      router.refresh();
    },
    onError: (err: Error) => {
      form.setError('root', {
        message: err?.message ?? 'Something went wrong. Please try again.',
      });
    },
  });

  const onSubmit = (data: RegisterDto) => signupMutation.mutate(data);

  return {
    idName,
    idEmail,
    idPassword,
    idConfirm,
    form,
    showError,
    password,
    confirmPassword,
    signupMutation,
    onSubmit,
  };
}
