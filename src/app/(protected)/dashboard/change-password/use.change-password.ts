'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi } from '@/client-api/auth.api';
import { getApiErrorMessage } from '@/shared/lib/api-error-message';

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

export function useChangePassword() {
  const idCurrent = useId();
  const idNew = useId();
  const idConfirm = useId();
  const [success, setSuccess] = useState(false);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changeMutation = useMutation({
    mutationFn: (data: ChangePasswordForm) => authApi.changePassword(data),
    onSuccess: () => setSuccess(true),
    onError: async (err: unknown) => {
      const message = await getApiErrorMessage(err, {
        400: 'Invalid current password or password requirements not met.',
        401: 'Session expired. Please sign in again.',
        501: 'Change password is not available yet. Use "Forgot password" from the login page.',
      });
      form.setError('root', { message });
    },
  });

  const onSubmit = (data: ChangePasswordForm) => changeMutation.mutate(data);

  return {
    form,
    changeMutation,
    success,
    onSubmit,
    idCurrent,
    idNew,
    idConfirm,
  };
}
