'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { authApi } from '@/client-api/auth.api';
import { useTranslate } from '@/locales';
import { useAccountManageModal } from './account-manage-modal-provider';

export function DeleteAccountModal() {
  const { t } = useTranslate();
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const { isDeleteModalOpen, closeDeleteModal } = useAccountManageModal();

  const deleteAccountMutation = useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      closeDeleteModal();
      router.replace('/login');
    },
  });

  const handleConfirm = () => {
    deleteAccountMutation.mutate();
  };

  if (!isDeleteModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--bg) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <h2 id={titleId} className="text-lg font-semibold text-(--red)">
            {t('profile.deleteAccountModalTitle')}
          </h2>
          <button
            type="button"
            onClick={closeDeleteModal}
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
          <div
            id={descriptionId}
            className="rounded-xl border border-(--red-bg) bg-(--red-bg/30) p-4 text-sm text-(--text)"
          >
            {t('profile.deleteAccountModalWarning')}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleteAccountMutation.isPending}
              className="rounded-lg bg-(--red-bg) px-4 py-2 text-sm font-medium text-(--red) transition hover:bg-(--red-bg)/80 disabled:opacity-50"
            >
              {t('profile.confirmDeleteAccount')}
            </button>
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm font-medium text-(--text) transition hover:bg-(--bg-elevated)"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
