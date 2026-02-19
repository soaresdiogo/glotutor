'use client';

import { Button, Callout, TextField } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslate } from '@/locales';
import { useResetPassword } from './use.reset-password';

export default function ResetPasswordPage() {
  const { t } = useTranslate();
  const { token, form, resetMutation, onSubmit } = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) p-8">
          <Callout.Root color="red" size="1">
            {t('resetPassword.missingToken')}
          </Callout.Root>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-(--accent) hover:underline"
          >
            {t('resetPassword.requestResetLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-medium text-(--text)">
          {t('resetPassword.setNewPassword')}
        </h1>
        <p className="mb-6 text-sm text-(--text-muted)">
          {t('resetPassword.enterNewPassword')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && (
            <Callout.Root color="red" size="1">
              {errors.root.message}
            </Callout.Root>
          )}
          <input type="hidden" {...register('token')} />
          <TextField.Root
            placeholder={t('resetPassword.newPasswordPlaceholder')}
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            color={errors.newPassword ? 'red' : undefined}
          />
          {errors.newPassword && (
            <p className="text-sm text-(--red)">{errors.newPassword.message}</p>
          )}
          <TextField.Root
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            color={errors.confirmPassword ? 'red' : undefined}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-(--red)">
              {errors.confirmPassword.message}
            </p>
          )}
          <Button
            type="submit"
            size="3"
            className="w-full cursor-pointer"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending
              ? t('resetPassword.resetting')
              : t('resetPassword.resetPassword')}
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
