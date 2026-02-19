'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { PasswordInput } from '@/components/password-input';
import { useTranslate } from '@/locales';
import { useChangePassword } from './use.change-password';

export default function ChangePasswordPage() {
  const { t } = useTranslate();
  const {
    form,
    changeMutation,
    success,
    onSubmit,
    idCurrent,
    idNew,
    idConfirm,
  } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm text-(--accent) hover:underline"
        >
          ← {t('changePassword.backToDashboard')}
        </Link>
        <h1 className="mb-1 text-2xl font-medium text-(--text)">
          {t('changePassword.title')}
        </h1>
        <p className="mb-8 text-sm text-(--text-muted)">
          {t('changePassword.subtitle')}
        </p>

        {success ? (
          <Callout.Root color="green" size="1" className="rounded-xl">
            {t('changePassword.success')}
          </Callout.Root>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 rounded-2xl border border-(--border) bg-(--bg-card) p-8"
          >
            {errors.root && (
              <Callout.Root color="red" size="1" className="rounded-lg">
                {errors.root.message}
              </Callout.Root>
            )}

            <PasswordInput
              id={idCurrent}
              label={t('changePassword.currentPassword')}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />

            <PasswordInput
              id={idNew}
              label={t('changePassword.newPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <PasswordInput
              id={idConfirm}
              label={t('changePassword.confirmPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <button
              type="submit"
              disabled={changeMutation.isPending}
              className="w-full rounded-xl bg-(--accent) py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {changeMutation.isPending
                ? t('changePassword.updating')
                : t('changePassword.submit')}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
