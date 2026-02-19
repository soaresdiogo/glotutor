'use client';

import { useCallback } from 'react';
import { createPortal } from 'react-dom';

import type { WordScorePayload } from '@/client-api/reading.api';
import { useTranslate } from '@/locales';

function getStatusColor(status: WordScorePayload['status']): string {
  if (status === 'green') return 'var(--green)';
  if (status === 'yellow') return 'var(--yellow)';
  if (status === 'red') return 'var(--red)';
  return 'var(--text-dim)';
}

type WordTooltipProps = Readonly<{
  score: WordScorePayload;
  phoneticIpa: string | null;
  definition: string | null;
  onPlay: (word: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}>;

export function WordTooltip({
  score,
  phoneticIpa,
  definition,
  onPlay,
  onClose,
  anchorRect,
}: WordTooltipProps) {
  const { t } = useTranslate();

  const statusLabels: Record<string, string> = {
    green: t('reading.tooltipGreat'),
    yellow: t('reading.tooltipAlmost'),
    red: t('reading.tooltipNeedsPractice'),
    missed: t('reading.tooltipSkipped'),
  };

  const handlePlay = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onPlay(score.expected);
    },
    [onPlay, score.expected],
  );

  const statusColor = getStatusColor(score.status);

  let top = anchorRect.bottom + 10;
  let left = anchorRect.left + anchorRect.width / 2 - 130;
  if (typeof globalThis.window !== 'undefined') {
    if (left < 16) left = 16;
    if (left + 260 > window.innerWidth - 16) left = window.innerWidth - 276;
    if (top + 280 > window.innerHeight) top = anchorRect.top - 280;
  }

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  const handleContentKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60"
        aria-hidden
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal
        aria-label={t('reading.wordDetailsAria')}
        className="fixed min-w-[260px] max-w-[90vw] rounded-xl border border-(--border) bg-(--bg-elevated) p-4 shadow-xl z-[9999]"
        style={{ top, left }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleContentKeyDown}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-(--text-muted) transition hover:bg-(--bg-hover) hover:text-(--text)"
          aria-label="Close"
        >
          <span className="text-lg leading-none" aria-hidden>
            ×
          </span>
        </button>

        <div className="pr-8">
          <div className="text-2xl font-medium" style={{ color: statusColor }}>
            {score.expected}
          </div>
          {phoneticIpa && (
            <div className="mt-2">
              <p className="font-mono text-lg text-(--text-muted)">
                /{phoneticIpa}/
              </p>
            </div>
          )}
        </div>
        {definition != null && definition !== '' && (
          <div className="mt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
              {t('reading.translation')}
            </span>
            <div className="mt-0.5 text-[13px] text-(--text-muted)">
              {definition}
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: statusColor }}
          />
          <span>{statusLabels[score.status] ?? score.status}</span>
          <span className="ml-auto font-mono text-(--text-dim)">
            {Math.round(score.combinedScore * 100)}%
          </span>
        </div>
        {score.spoken && score.status !== 'green' && (
          <div className="mt-2 text-[13px] text-(--text-muted)">
            {t('reading.youSaid')} <em>&quot;{score.spoken}&quot;</em>
          </div>
        )}
        <button
          type="button"
          onClick={handlePlay}
          className="cursor-pointer mt-4 flex h-14 w-14 mx-auto items-center justify-center rounded-full border-0 bg-(--accent) text-white shadow-lg transition hover:opacity-90 active:scale-95"
          aria-label={t('reading.hearPronunciation')}
        >
          <span className="text-xl leading-none" aria-hidden>
            ▶
          </span>
        </button>
        <p className="text-center mt-1 text-[13px] text-(--text-muted)">
          {t('reading.hearPronunciation')}
        </p>
      </div>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
