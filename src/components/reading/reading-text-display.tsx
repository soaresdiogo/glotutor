'use client';

import { useMemo } from 'react';

import type {
  TextVocabularyItem,
  WordScorePayload,
} from '@/client-api/reading.api';

type ReadingTextDisplayProps = Readonly<{
  content: string;
  wordScores: WordScorePayload[] | null;
  vocabulary: TextVocabularyItem[];
  onWordClick: (index: number, rect: DOMRect) => void;
}>;

function getStatusClass(
  status: WordScorePayload['status'] | undefined,
): string {
  if (status === 'green') return 'bg-(--green-bg) text-(--green) font-medium';
  if (status === 'yellow')
    return 'bg-(--yellow-bg) text-(--yellow) font-medium';
  if (status === 'red')
    return 'bg-(--red-bg) text-(--red) font-medium underline decoration-wavy decoration-(--red-border) underline-offset-1';
  if (status === 'missed')
    return 'bg-(--bg-elevated) text-(--text-dim) opacity-70 line-through';
  return '';
}

export function ReadingTextDisplay({
  content,
  wordScores,
  vocabulary: _vocabulary,
  onWordClick,
}: ReadingTextDisplayProps) {
  const words = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean),
    [content],
  );

  return (
    <div className="text-[19px] leading-loose">
      {words.map((word, i) => {
        const score = wordScores?.[i];
        const status =
          wordScores == null ? score?.status : (score?.status ?? 'missed');
        const isEvaluated = status != null;

        const handleActivate = () => {
          if (!isEvaluated) return;
          const el = document.getElementById(`word-${i}`);
          if (el) onWordClick(i, el.getBoundingClientRect());
        };

        const baseClass =
          'inline rounded px-1 py-0.5 transition border-0 p-0 font-inherit text-inherit';
        const interactiveClass = isEvaluated
          ? 'cursor-pointer hover:brightness-110'
          : 'cursor-default';
        const statusClass = getStatusClass(status);

        const content = <>{word} </>;

        if (isEvaluated) {
          return (
            <button
              key={`${i}-${word}`}
              id={`word-${i}`}
              type="button"
              className={`${baseClass} ${interactiveClass} ${statusClass}`}
              style={{ animationDelay: `${i * 15}ms` }}
              onClick={handleActivate}
              aria-label={`Word: ${word}, score: ${status}`}
            >
              {content}
            </button>
          );
        }

        return (
          <span
            key={`${i}-${word}`}
            id={`word-${i}`}
            className={`${baseClass} ${interactiveClass} ${statusClass}`}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}
