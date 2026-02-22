'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useId, useState } from 'react';
import { studentProfileApi } from '@/client-api/student-profile.api';
import type { MySubscriptionResponse } from '@/client-api/subscriptions.api';
import { subscriptionsApi } from '@/client-api/subscriptions.api';
import { useTranslate } from '@/locales';
import { useAccountManageModal } from './account-manage-modal-provider';
import { PrivacyPolicyModal } from './privacy-policy-modal';
import { TermsOfUseModal } from './terms-of-use-modal';

type View = 'options' | 'subscription' | 'confirm_cancel_subscription';

/** Phrase the user must type to confirm cancellation, in their native language. */
const CANCEL_PHRASES: Record<string, string> = {
  pt: 'Quero cancelar minha assinatura',
  en: 'I want to cancel my subscription',
  es: 'Quiero cancelar mi suscripción',
  fr: 'Je veux annuler mon abonnement',
  de: 'Ich möchte mein Abonnement kündigen',
  it: 'Voglio cancellare il mio abbonamento',
};

function formatSubscriptionDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function trialDaysLeft(trialEndIso: string | null): number | null {
  if (!trialEndIso) return null;
  const end = new Date(trialEndIso);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

function subscriptionStatusLabel(
  status: string,
  t: (key: string) => string,
): string {
  if (status === 'trialing') return t('profile.subscriptionTrialing');
  if (status === 'active') return t('profile.subscriptionActive');
  return t('profile.subscriptionCanceled');
}

function subscriptionAccessLabel(
  subscription: MySubscriptionResponse,
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  const days = trialDaysLeft(subscription.trialEnd);
  if (subscription.trialEnd && days !== null && days > 0) {
    return t('profile.trialDaysLeft', { count: days });
  }
  if (subscription.trialEnd) {
    return t('profile.trialEndsOn', {
      date: formatSubscriptionDate(subscription.accessUntil ?? null),
    });
  }
  if (subscription.accessUntil) {
    return t('profile.accessUntil', {
      date: formatSubscriptionDate(subscription.accessUntil),
    });
  }
  return null;
}

function getNativePhrase(nativeLanguageCode: string | null): string {
  if (!nativeLanguageCode) return CANCEL_PHRASES.en ?? '';
  const base = nativeLanguageCode.split('-')[0]?.toLowerCase() ?? 'en';
  return CANCEL_PHRASES[base] ?? CANCEL_PHRASES.en ?? '';
}

function getModalTitle(view: View, t: (key: string) => string): string {
  if (view === 'options') return t('profile.manageAccount');
  if (view === 'confirm_cancel_subscription')
    return t('profile.cancelSubscription');
  return t('profile.manageSubscription');
}

export function AccountManageModal() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const { isAccountModalOpen, closeAccountModal } = useAccountManageModal();
  const [view, setView] = useState<View>('options');
  const [cancelPhraseInput, setCancelPhraseInput] = useState('');
  const [cancelPhraseError, setCancelPhraseError] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const titleId = useId();
  const cancelPhraseErrorId = useId();

  const { data: subscription } = useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: () => subscriptionsApi.getMySubscription(),
    staleTime: 1000 * 60 * 2,
    enabled: isAccountModalOpen,
  });

  const { data: profileData } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentProfileApi.get(),
    staleTime: 1000 * 60 * 2,
    enabled: isAccountModalOpen,
  });

  const nativePhrase = getNativePhrase(
    profileData?.profile?.nativeLanguageCode ?? null,
  );

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => subscriptionsApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'me'] });
      setView('subscription');
      setCancelPhraseInput('');
      setCancelPhraseError(false);
    },
  });

  const handleClose = () => {
    closeAccountModal();
    setView('options');
    setCancelPhraseInput('');
    setCancelPhraseError(false);
  };

  const handleBack = () => {
    if (view === 'confirm_cancel_subscription') {
      setView('subscription');
      setCancelPhraseInput('');
      setCancelPhraseError(false);
    } else {
      setView('options');
    }
  };

  const handleCancelSubscriptionClick = () => {
    setView('confirm_cancel_subscription');
    setCancelPhraseInput('');
    setCancelPhraseError(false);
  };

  const handleConfirmCancelSubscription = () => {
    const normalizedInput = cancelPhraseInput.trim().toLowerCase();
    const normalizedPhrase = nativePhrase.trim().toLowerCase();
    if (normalizedInput !== normalizedPhrase) {
      setCancelPhraseError(true);
      return;
    }
    setCancelPhraseError(false);
    cancelSubscriptionMutation.mutate();
  };

  const isPhraseMatch =
    cancelPhraseInput.trim().toLowerCase() ===
    nativePhrase.trim().toLowerCase();

  const canCancelSubscription =
    subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    !subscription.cancelAtPeriodEnd;

  if (!isAccountModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--bg) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <h2 id={titleId} className="text-lg font-semibold text-(--text)">
            {getModalTitle(view, t)}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-(--text-muted) transition hover:bg-(--bg-elevated) hover:text-(--text)"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <title>Close</title>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'options' && (
            <>
              <p className="mb-6 text-sm text-(--text-muted)">
                {t('profile.manageAccountDescription')}
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setView('subscription')}
                  className="w-full rounded-xl border-2 border-(--border) bg-(--bg-card) px-4 py-3 text-left font-medium text-(--text) transition hover:border-(--accent/50) hover:bg-(--bg-elevated)"
                >
                  {subscription
                    ? t('profile.manageSubscription')
                    : t('profile.subscription')}
                </button>
                <Link
                  href="/dashboard/certificates"
                  onClick={handleClose}
                  className="w-full rounded-xl border-2 border-(--border) bg-(--bg-card) px-4 py-3 text-left font-medium text-(--text) transition hover:border-(--accent/50) hover:bg-(--bg-elevated)"
                >
                  {t('profile.certificates')}
                </Link>
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="w-full rounded-xl border-2 border-(--border) bg-(--bg-card) px-4 py-3 text-left font-medium text-(--text) transition hover:border-(--accent/50) hover:bg-(--bg-elevated)"
                >
                  {t('profile.termsOfUse')}
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="w-full rounded-xl border-2 border-(--border) bg-(--bg-card) px-4 py-3 text-left font-medium text-(--text) transition hover:border-(--accent/50) hover:bg-(--bg-elevated)"
                >
                  {t('profile.privacyPolicy')}
                </button>
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
            </>
          )}

          {view === 'subscription' && (
            <>
              <p className="mb-4 text-sm text-(--text-muted)">
                {t('profile.subscriptionDescription')}
              </p>
              {subscription ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-(--text-dim)">
                      {t('profile.subscriptionStatus')}
                    </p>
                    <p className="mt-1 font-medium text-(--text)">
                      {subscriptionStatusLabel(subscription.status, t)}
                    </p>
                    {subscriptionAccessLabel(subscription, t) && (
                      <p className="mt-1 text-sm text-(--text-muted)">
                        {subscriptionAccessLabel(subscription, t)}
                      </p>
                    )}
                    {subscription.cancelAtPeriodEnd && (
                      <p className="mt-2 text-sm text-(--text-muted)">
                        {t('profile.cancelAtPeriodEnd')}
                      </p>
                    )}
                  </div>

                  {subscription.status === 'trialing' && (
                    <p className="rounded-lg bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-muted)">
                      {t('profile.subscriptionWarningTrial')}
                    </p>
                  )}
                  {(subscription.status === 'active' ||
                    subscription.status === 'trialing') &&
                    !subscription.cancelAtPeriodEnd && (
                      <p className="rounded-lg border border-(--border) px-3 py-2 text-sm text-(--text-muted)">
                        {t('profile.subscriptionWarningCancel')}
                      </p>
                    )}

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm font-medium text-(--text) transition hover:bg-(--bg-elevated)"
                    >
                      {t('profile.back')}
                    </button>
                    {canCancelSubscription && (
                      <button
                        type="button"
                        onClick={handleCancelSubscriptionClick}
                        disabled={cancelSubscriptionMutation.isPending}
                        className="rounded-lg bg-(--red-bg) px-4 py-2 text-sm font-medium text-(--red) transition hover:bg-(--red-bg)/80 disabled:opacity-50"
                      >
                        {t('profile.cancelSubscription')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-(--text-muted)">
                    {t('subscriptions.notFound')}
                  </p>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm font-medium text-(--text) transition hover:bg-(--bg-elevated)"
                  >
                    {t('profile.back')}
                  </button>
                </div>
              )}
            </>
          )}

          {view === 'confirm_cancel_subscription' && (
            <div className="space-y-4">
              <p className="text-sm text-(--text-muted)">
                {t('profile.cancelSubscriptionConfirm')}
              </p>
              <p className="text-sm font-medium text-(--text)">
                {t('profile.cancelSubscriptionTypeInstruction')}
              </p>
              <div
                className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 font-medium text-(--text)"
                aria-hidden
              >
                &quot;{nativePhrase}&quot;
              </div>
              <div>
                <input
                  type="text"
                  value={cancelPhraseInput}
                  onChange={(e) => {
                    setCancelPhraseInput(e.target.value);
                    setCancelPhraseError(false);
                  }}
                  placeholder={t('profile.cancelSubscriptionTypePlaceholder')}
                  className="w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-(--text) placeholder:text-(--text-muted) focus:border-(--accent) focus:outline-none"
                  aria-invalid={cancelPhraseError}
                  aria-describedby={
                    cancelPhraseError ? cancelPhraseErrorId : undefined
                  }
                />
                {cancelPhraseError && (
                  <p
                    id={cancelPhraseErrorId}
                    className="mt-1 text-sm text-(--red)"
                    role="alert"
                  >
                    {t('profile.cancelSubscriptionPhraseMatchError')}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm font-medium text-(--text) transition hover:bg-(--bg-elevated)"
                >
                  {t('profile.back')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelSubscription}
                  disabled={
                    !isPhraseMatch || cancelSubscriptionMutation.isPending
                  }
                  className="rounded-lg bg-(--red-bg) px-4 py-2 text-sm font-medium text-(--red) transition hover:bg-(--red-bg)/80 disabled:opacity-50"
                >
                  {t('profile.confirmCancelSubscription')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
