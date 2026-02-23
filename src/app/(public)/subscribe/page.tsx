'use client';

import { Callout } from '@radix-ui/themes';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PrivacyPolicyModal } from '@/components/dashboard/privacy-policy-modal';
import { TermsOfUseModal } from '@/components/dashboard/terms-of-use-modal';
import { LanguageSelect } from '@/components/language-select';
import { PasswordInput } from '@/components/password-input';
import { PasswordMatchIndicator } from '@/components/password-match-indicator';
import { PasswordStrengthRules } from '@/components/password-strength-rules';
import { useTranslate } from '@/locales';
import { httpClient } from '@/shared/lib/http-client';
import { parsePlanFromQuery, useSubscribe } from './use.subscribe';

type AvailabilityStatus = 'loading' | 'no_plans' | 'plan_not_found' | 'ok';

export default function SubscribePage() {
  const { t, locale: appLocale } = useTranslate();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const currencyParam = searchParams.get('currency');
  const intervalParam = searchParams.get('interval');
  const languageParam = searchParams.get('language');
  const planType = parsePlanFromQuery(planParam);
  const currency =
    currencyParam != null && currencyParam.length > 0 ? currencyParam : null;
  const interval =
    intervalParam === 'month' || intervalParam === 'annual'
      ? intervalParam
      : null;
  const language =
    languageParam != null && languageParam.length > 0
      ? languageParam
      : appLocale;

  const [status, setStatus] = useState<AvailabilityStatus>('loading');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ plan: planType });
        if (currency) params.set('currency', currency);
        if (interval) params.set('interval', interval);
        const res = await httpClient
          .get(`subscriptions/plans/check?${params.toString()}`)
          .json<{
            available: boolean;
            planFound: boolean;
          }>();
        if (cancelled) return;
        if (!res.available) {
          setStatus('no_plans');
          return;
        }
        if (!res.planFound) {
          setStatus('plan_not_found');
          return;
        }
        setStatus('ok');
      } catch {
        if (cancelled) return;
        setStatus('no_plans');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planType, currency, interval]);

  const {
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
  } = useSubscribe(planType, { currency, interval, language });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
        <div className="absolute right-4 top-4">
          <LanguageSelect />
        </div>
        <div className="w-full max-w-[420px] rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
          <p className="text-center text-(--text-muted)">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
        <div className="absolute right-4 top-4">
          <LanguageSelect />
        </div>
        <div className="w-full max-w-[420px] rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
          <h1 className="text-2xl font-medium tracking-tight text-(--text)">
            {t('subscribe.checkEmailTitle')}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-(--text-muted)">
            {t('subscribe.checkEmailMessage')}
          </p>
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
    );
  }

  if (status === 'no_plans' || status === 'plan_not_found') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) p-4">
        <div className="absolute right-4 top-4">
          <LanguageSelect />
        </div>
        <div className="w-full max-w-[420px] rounded-2xl border border-(--border) bg-(--bg-card) p-10 shadow-2xl shadow-black/20">
          <Callout.Root
            color="amber"
            size="1"
            className="rounded-lg"
            role="alert"
          >
            {status === 'no_plans'
              ? t('subscribe.plansNotAvailable')
              : t('subscribe.planNotFound')}
          </Callout.Root>
          <p className="mt-6 text-center text-sm text-(--text-muted)">
            <Link
              href="/login"
              className="font-medium text-(--accent) hover:underline"
            >
              {t('common.backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

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

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <input
                  id={idAcceptTerms}
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-(--border) text-(--accent) focus:ring-(--accent)"
                  {...form.register('acceptTerms')}
                  aria-invalid={!!form.formState.errors.acceptTerms}
                />
                <label
                  htmlFor={idAcceptTerms}
                  className="text-sm text-(--text-muted)"
                >
                  {t('subscribe.acceptTerms')}{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTermsModalOpen(true);
                    }}
                    className="font-medium text-(--accent) hover:underline"
                  >
                    {t('profile.termsOfUse')}
                  </button>
                </label>
              </div>
              {showError('acceptTerms') && (
                <p className="text-sm text-(--red)">
                  {t('subscribe.termsRequired')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <input
                  id={idAcceptPrivacy}
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-(--border) text-(--accent) focus:ring-(--accent)"
                  {...form.register('acceptPrivacy')}
                  aria-invalid={!!form.formState.errors.acceptPrivacy}
                />
                <label
                  htmlFor={idAcceptPrivacy}
                  className="text-sm text-(--text-muted)"
                >
                  {t('subscribe.acceptPrivacy')}{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPrivacyModalOpen(true);
                    }}
                    className="font-medium text-(--accent) hover:underline"
                  >
                    {t('profile.privacyPolicy')}
                  </button>
                </label>
              </div>
              {showError('acceptPrivacy') && (
                <p className="text-sm text-(--red)">
                  {t('subscribe.privacyRequired')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={subscribeMutation.isPending || !isValid}
              className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl bg-(--accent) py-3.5 text-sm font-semibold text-white shadow-lg shadow-(--accent)/20 transition hover:opacity-95 disabled:opacity-60"
            >
              {subscribeMutation.isPending
                ? t('subscribe.processing')
                : t('subscribe.sendPaymentLink')}
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

      <PrivacyPolicyModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
      <TermsOfUseModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onOpenPrivacy={() => {
          setTermsModalOpen(false);
          setPrivacyModalOpen(true);
        }}
      />
    </div>
  );
}
