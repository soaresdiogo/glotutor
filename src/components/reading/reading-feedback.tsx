'use client';

import type { FeedbackResponse } from '@/client-api/reading.api';

import { useTranslate } from '@/locales';

import { SpeedMeter } from './speed-meter';

type ReadingFeedbackProps = Readonly<{
  data: FeedbackResponse;
  wpm: number;
  onPlayWord: (word: string) => void;
}>;

export function ReadingFeedback({
  data,
  wpm,
  onPlayWord,
}: ReadingFeedbackProps) {
  const { t } = useTranslate();
  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
      <h3 className="text-xl font-medium text-(--text) mb-4">
        {t('reading.feedbackTitle')}
      </h3>
      {data.summary && (
        <p className="mb-5 text-[15px] leading-relaxed text-(--text-muted)">
          {data.summary}
        </p>
      )}
      {data.tips && data.tips.length > 0 && (
        <ul className="mb-5 space-y-2">
          {data.tips.map((tip) => (
            <li
              key={tip}
              className="flex gap-2 rounded-lg border-l-4 border-(--accent) bg-(--bg-elevated) px-4 py-3 text-sm text-(--text)"
            >
              {tip}
            </li>
          ))}
        </ul>
      )}
      {data.focusWords && data.focusWords.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
            {t('reading.wordsToPractice')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.focusWords.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => onPlayWord(word)}
                className="cursor-pointer rounded-lg border border-(--red-border) bg-(--red-bg) px-3 py-1.5 text-[13px] font-medium text-(--red) transition hover:opacity-90"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
      <SpeedMeter wpm={wpm} />
    </div>
  );
}
