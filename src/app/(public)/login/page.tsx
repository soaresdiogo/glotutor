'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { LanguageSelect } from '@/components/language-select';
import { PasswordInput } from '@/components/password-input';
import { useTranslate } from '@/locales';
import { useLogin } from './use.login';

export default function LoginPage() {
  const { t } = useTranslate();
  const {
    idEmail,
    idPassword,
    registered,
    verified,
    maskedEmail,
    form,
    loginMutation,
    onSubmit,
  } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
      <div className="absolute right-4 top-4">
        <LanguageSelect />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
          <div className="mb-8">
            <h1 className="text-3xl font-medium tracking-tight text-(--text)">
              {t('login.welcomeBack')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
              {t('login.signInSubtitle')}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {verified && (
              <Callout.Root color="green" size="1" className="rounded-lg">
                {t('login.emailVerifiedSignIn')}
              </Callout.Root>
            )}
            {registered && !verified && (
              <Callout.Root color="blue" size="1" className="rounded-lg">
                {maskedEmail
                  ? t('login.checkEmailVerify', { email: maskedEmail })
                  : t('login.checkEmailVerifyNoEmail')}
              </Callout.Root>
            )}
            {errors.root && (
              <Callout.Root color="red" size="1" className="rounded-lg">
                {errors.root.message}
              </Callout.Root>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor={idEmail}
                className="text-sm font-medium text-(--text)"
              >
                {t('common.email')}
              </label>
              <input
                id={idEmail}
                type="email"
                autoComplete="email"
                placeholder={t('login.emailPlaceholder')}
                className="rounded-xl border border-(--border) bg-(--bg-elevated) px-4 py-3.5 text-(--text) placeholder:text-(--text-dim) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-(--red)">{errors.email.message}</p>
              )}
            </div>

            <PasswordInput
              id={idPassword}
              label={t('common.password')}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              labelRight={
                <Link
                  href="/forgot-password"
                  className="text-xs text-(--accent) hover:underline"
                >
                  {t('login.forgotPassword')}
                </Link>
              }
              {...register('password')}
            />

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-(--accent) py-3.5 text-sm font-semibold text-white shadow-lg shadow-(--accent)/20 transition hover:opacity-95 disabled:opacity-60"
            >
              {loginMutation.isPending
                ? t('login.signingIn')
                : t('login.signIn')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-(--text-muted)">
            {t('login.noAccountSignUp')}{' '}
            <Link
              href="/signup"
              className="font-medium text-(--accent) hover:underline"
            >
              {t('common.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
