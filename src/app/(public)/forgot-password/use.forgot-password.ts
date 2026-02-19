'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/client-api/auth.api';
import {
  type RequestPasswordResetDto,
  RequestPasswordResetSchema,
} from '@/features/auth/application/dto/request-password-reset.dto';

export function useForgotPassword() {
  const form = useForm<RequestPasswordResetDto>({
    resolver: zodResolver(RequestPasswordResetSchema),
    defaultValues: { email: '' },
  });

  const requestResetMutation = useMutation({
    mutationFn: (data: RequestPasswordResetDto) =>
      authApi.requestPasswordReset(data),
  });

  const onSubmit = (data: RequestPasswordResetDto) =>
    requestResetMutation.mutate(data);

  return {
    form,
    requestResetMutation,
    showSuccess: requestResetMutation.isSuccess,
    onSubmit,
  };
}
