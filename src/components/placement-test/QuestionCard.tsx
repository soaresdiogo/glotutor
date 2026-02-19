'use client';

import type { PlacementQuestion } from '@/client-api/placement-test.api';

type QuestionCardProps = {
  question: PlacementQuestion;
  onSelect: (optionIndex: number) => void;
  disabled?: boolean;
};

export function QuestionCard({
  question,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6 shadow-sm">
      <p className="mb-4 text-lg text-(--text)">{question.questionText}</p>
      {question.audioUrl && (
        <audio
          src={question.audioUrl}
          controls
          className="mb-4 w-full"
          preload="metadata"
        >
          <track kind="captions" />
        </audio>
      )}
      <ul className="flex flex-col gap-2" aria-label="Options">
        {question.options.map((option, index) => (
          <li key={option}>
            <button
              type="button"
              role="option"
              disabled={disabled}
              onClick={() => onSelect(index)}
              className="w-full rounded-xl border border-(--border) bg-(--bg) px-4 py-3 text-left text-(--text) transition hover:border-(--accent) hover:bg-(--bg-card) disabled:opacity-50"
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
