'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { OtpInput } from '@/components/otp-input';
import { useTranslate } from '@/locales';
import { useVerifyToken } from './use.verify-token';

export default function VerifyTokenPage() {
  const { t } = useTranslate();
  const { sessionId, form, verifyMutation, onSubmit } = useVerifyToken();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) p-8">
          <Callout.Root color="red" size="1">
            {t('verifyToken.invalidLink')}
          </Callout.Root>
          <Link
            href="/login"
            className="mt-4 inline-block text-(--accent) hover:underline"
          >
            {t('common.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-medium text-(--text)">
          {t('verifyToken.checkYourEmail')}
        </h1>
        <p className="mb-6 text-sm text-(--text-muted)">
          {t('verifyToken.enterCodeBelow')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && (
            <Callout.Root color="red" size="1">
              {errors.root.message}
            </Callout.Root>
          )}
          <Controller
            name="mfaCode"
            control={control}
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.mfaCode)}
                aria-label={t('verifyToken.verificationCode')}
                autoComplete="one-time-code"
              />
            )}
          />
          {errors.mfaCode && (
            <p className="text-sm text-(--red)">{errors.mfaCode.message}</p>
          )}
          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-(--accent) py-3.5 text-sm font-semibold text-white shadow-lg shadow-(--accent)/20 transition hover:opacity-95 disabled:opacity-60"
          >
            {verifyMutation.isPending
              ? t('verifyToken.verifying')
              : t('verifyToken.verify')}
          </button>
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
