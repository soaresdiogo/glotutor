'use client';

import { useMutation } from '@tanstack/react-query';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { httpClient } from '@/shared/lib/http-client';
import { safeZodResolver } from '@/shared/lib/safe-zod-resolver';

export const SUBSCRIBE_PLAN_VALUES = ['pro', 'basic', 'pro_plus'] as const;
export type SubscribePlanType = (typeof SUBSCRIBE_PLAN_VALUES)[number];

const strongPassword = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .refine((p) => /[A-Z]/.test(p), {
    message: 'Include at least one uppercase letter',
  })
  .refine((p) => /[a-z]/.test(p), {
    message: 'Include at least one lowercase letter',
  })
  .refine((p) => /\d/.test(p), {
    message: 'Include at least one number',
  })
  .refine((p) => /[^A-Za-z0-9]/.test(p), {
    message: 'Include at least one special character (e.g. !@#$%)',
  });

const SubscribeFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z
      .string()
      .min(1, 'Email is required')
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.email('Invalid email address')),
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptPrivacy: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Privacy Policy to create an account.',
    }),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms of Use to create an account.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SubscribeFormDto = z.infer<typeof SubscribeFormSchema>;

export function parsePlanFromQuery(plan: string | null): SubscribePlanType {
  if (plan && SUBSCRIBE_PLAN_VALUES.includes(plan as SubscribePlanType)) {
    return plan as SubscribePlanType;
  }
  return 'pro';
}

export type SubscribeUrlParams = {
  currency?: string | null;
  interval?: 'month' | 'annual' | null;
  /** Language from URL (?language=pt). Used for payment-link email and saved as user.locale after signup. */
  language?: string | null;
};

export function useSubscribe(
  planType: SubscribePlanType,
  urlParams?: SubscribeUrlParams,
) {
  const currency = urlParams?.currency ?? null;
  const interval = urlParams?.interval ?? null;
  const language = urlParams?.language ?? null;
  const idName = useId();
  const idEmail = useId();
  const idPassword = useId();
  const idConfirm = useId();
  const idAcceptPrivacy = useId();
  const idAcceptTerms = useId();

  const form = useForm<SubscribeFormDto>({
    resolver: safeZodResolver<SubscribeFormDto>(SubscribeFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptPrivacy: false,
      acceptTerms: false,
    },
  });

  const { touchedFields, isSubmitted, errors } = form.formState;
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const showError = (field: keyof SubscribeFormDto) =>
    (touchedFields[field] || isSubmitted) && errors[field];

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscribeFormDto) => {
      const body: Record<string, unknown> = {
        fullName: data.name,
        email: data.email,
        planType,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptPrivacy: true,
        acceptTerms: true,
      };
      if (currency) body.currency = currency;
      if (interval) body.interval = interval;
      if (language) body.locale = language;
      await httpClient
        .post('subscriptions/request-payment-link', {
          json: body,
        })
        .json<{ success: boolean }>();
    },
    onError: async (err: unknown) => {
      let message = 'Something went wrong. Please try again.';
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

  const onSubmit = (data: SubscribeFormDto) => subscribeMutation.mutate(data);

  const emailSent = subscribeMutation.isSuccess;

  const isValid =
    form.formState.isValid &&
    form.watch('acceptPrivacy') === true &&
    form.watch('acceptTerms') === true;

  return {
    idName,
    idEmail,
    idPassword,
    idConfirm,
    idAcceptPrivacy,
    idAcceptTerms,
    form,
    showError,
    password,
    confirmPassword,
    subscribeMutation,
    onSubmit,
    emailSent,
    isValid,
  };
}
