'use client';

import { useTranslate } from '@/locales';

type ReadingControlsProps = Readonly<{
  isRecording: boolean;
  isEvaluating: boolean;
  hasEvaluated: boolean;
  elapsedSeconds: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}>;

export function ReadingControls({
  isRecording,
  isEvaluating,
  hasEvaluated,
  elapsedSeconds,
  onStart,
  onStop,
  onReset,
}: ReadingControlsProps) {
  const { t } = useTranslate();
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60);
  const timerText = `${mins}:${secs.toString().padStart(2, '0')}`;

  const getButtonContent = () => {
    if (isRecording) {
      return (
        <>
          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          {t('reading.stopReading')}
        </>
      );
    }
    if (isEvaluating) {
      return t('reading.evaluating');
    }
    return (
      <>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden
        >
          <title>{t('reading.startReading')}</title>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        {t('reading.startReading')}
      </>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {hasEvaluated ? null : (
        <button
          type="button"
          onClick={isRecording ? onStop : onStart}
          disabled={isEvaluating}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
            isRecording
              ? 'bg-(--red) text-white hover:bg-(--red)/90'
              : 'bg-(--accent) text-white hover:bg-(--accent)/90'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {getButtonContent()}
        </button>
      )}
      {hasEvaluated && (
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--bg-elevated) px-5 py-3 text-sm font-semibold text-(--text-muted) transition hover:bg-(--bg-card) hover:text-(--text)"
        >
          <span aria-hidden>↻</span>
          {t('reading.tryAgain')}
        </button>
      )}
      {isRecording && (
        <div className="flex items-center gap-2 text-[13px] font-medium text-(--red)">
          <span className="h-2.5 w-2.5 rounded-full bg-(--red) animate-pulse" />
          {t('reading.recording')}
        </div>
      )}
      <div className="font-mono text-sm text-(--text-muted) min-w-12 tabular-nums">
        {timerText}
      </div>
    </div>
  );
}
