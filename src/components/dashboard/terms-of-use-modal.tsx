'use client';

import { useId } from 'react';
import { TermsOfUseContent } from '@/components/terms-of-use-content';
import { useTranslate } from '@/locales';

type TermsOfUseModalProps = {
  open: boolean;
  onClose: () => void;
  /** When provided, "Privacy Policy" link in terms content will call this (e.g. open privacy modal) instead of navigating. */
  onOpenPrivacy?: () => void;
};

export function TermsOfUseModal({
  open,
  onClose,
  onOpenPrivacy,
}: TermsOfUseModalProps) {
  const { t } = useTranslate();
  const scrollContainerId = useId();
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--bg) shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-(--border) px-4 py-3">
          <h2
            id={titleId}
            className="text-lg font-semibold text-(--text) truncate pr-4"
          >
            {t('terms.pageTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-(--text-muted) transition hover:bg-(--bg-elevated) hover:text-(--text)"
            aria-label={t('common.cancel')}
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
        <div
          id={scrollContainerId}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6"
        >
          <TermsOfUseContent
            isInsideModal
            scrollContainerId={scrollContainerId}
            onOpenPrivacy={onOpenPrivacy}
          />
        </div>
      </div>
    </div>
  );
}
