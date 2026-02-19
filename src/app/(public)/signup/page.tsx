'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { LanguageSelect } from '@/components/language-select';
import { PasswordInput } from '@/components/password-input';
import { PasswordMatchIndicator } from '@/components/password-match-indicator';
import { PasswordStrengthRules } from '@/components/password-strength-rules';
import { useTranslate } from '@/locales';
import { useSignup } from './use.signup';

export default function SignupPage() {
  const { t } = useTranslate();
  const {
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
  } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
              {t('signup.createAccount')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
              {t('signup.enterDetails')}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {errors.root && (
              <Callout.Root color="red" size="1" className="rounded-lg">
                {errors.root.message}
              </Callout.Root>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor={idName}
                className="text-sm font-medium text-(--text)"
              >
                {t('common.name')}
              </label>
              <input
                id={idName}
                type="text"
                autoComplete="name"
                placeholder={t('signup.namePlaceholder')}
                className="rounded-xl border border-(--border) bg-(--bg-elevated) px-4 py-3.5 text-(--text) placeholder:text-(--text-dim) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
                {...register('name')}
              />
              {showError('name') && (
                <p className="text-sm text-(--red)">{errors.name?.message}</p>
              )}
            </div>

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
                placeholder={t('signup.emailPlaceholder')}
                className="rounded-xl border border-(--border) bg-(--bg-elevated) px-4 py-3.5 text-(--text) placeholder:text-(--text-dim) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
                {...register('email')}
              />
              {showError('email') && (
                <p className="text-sm text-(--red)">{errors.email?.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <PasswordInput
                id={idPassword}
                label={t('common.password')}
                placeholder="••••••••"
                autoComplete="new-password"
                error={
                  showError('password') ? errors.password?.message : undefined
                }
                {...register('password')}
              />
              <PasswordStrengthRules password={password} className="mt-1" />
            </div>

            <div className="flex flex-col gap-2">
              <PasswordInput
                id={idConfirm}
                label={t('signup.confirmPassword')}
                placeholder="••••••••"
                autoComplete="new-password"
                error={
                  showError('confirmPassword')
                    ? errors.confirmPassword?.message
                    : undefined
                }
                {...register('confirmPassword')}
              />
              <PasswordMatchIndicator
                password={password}
                confirmPassword={confirmPassword}
              />
            </div>

            <button
              type="submit"
              disabled={!isValid || signupMutation.isPending}
              className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-(--accent) py-3.5 text-sm font-semibold text-white shadow-lg shadow-(--accent)/20 transition hover:opacity-95 disabled:opacity-60"
            >
              {signupMutation.isPending
                ? t('signup.creatingAccount')
                : t('signup.signUp')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-(--text-muted)">
            {t('signup.haveAccountSignIn')}{' '}
            <Link
              href="/login"
              className="font-medium text-(--accent) hover:underline"
            >
              {t('common.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
