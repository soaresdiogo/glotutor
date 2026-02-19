'use client';

import { Button, Callout, TextField } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslate } from '@/locales';
import { useForgotPassword } from './use.forgot-password';

export default function ForgotPasswordPage() {
  const { t } = useTranslate();
  const { form, requestResetMutation, showSuccess, onSubmit } =
    useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-medium text-(--text)">
          {t('forgotPassword.title')}
        </h1>
        <p className="mb-6 text-sm text-(--text-muted)">
          {t('forgotPassword.subtitle')}
        </p>

        {showSuccess ? (
          <Callout.Root color="green" size="1" className="mb-4">
            {t('forgotPassword.resetLinkSuccess')}
          </Callout.Root>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField.Root
            placeholder={t('common.email')}
            type="email"
            autoComplete="email"
            {...register('email')}
            color={errors.email ? 'red' : undefined}
          />
          {errors.email && (
            <p className="text-sm text-(--red)">{errors.email.message}</p>
          )}
          <Button
            type="submit"
            size="3"
            className="w-full cursor-pointer"
            disabled={requestResetMutation.isPending}
          >
            {requestResetMutation.isPending
              ? t('forgotPassword.sending')
              : t('forgotPassword.sendResetLink')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-(--text-muted)">
          <Link href="/login" className="text-(--accent) hover:underline">
            {t('common.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
