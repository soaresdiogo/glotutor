'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/client-api/auth.api';
import {
  type ResetPasswordWithTokenDto,
  ResetPasswordWithTokenSchema,
} from '@/features/auth/application/dto/reset-password-with-token.dto';

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<ResetPasswordWithTokenDto>({
    resolver: zodResolver(ResetPasswordWithTokenSchema),
    defaultValues: {
      token: token ?? '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordWithTokenDto) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      router.push('/login');
      router.refresh();
    },
    onError: (err: Error) => {
      form.setError('root', {
        message:
          err?.message ?? 'Invalid or expired reset link. Request a new one.',
      });
    },
  });

  const onSubmit = (data: ResetPasswordWithTokenDto) =>
    resetMutation.mutate(data);

  return {
    token,
    form,
    resetMutation,
    onSubmit,
  };
}
