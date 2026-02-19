'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useExerciseSubmit } from '@/hooks/listening/use-exercise-submit';
import { usePodcastDetail } from '@/hooks/listening/use-podcast-detail';
import { useTranslate } from '@/locales';

const SENTENCE_ORDER_DELIMITER = ' | ';

/** Reorderable sentence list for sentence_order exercises. */
function SentenceOrderInput({
  options,
  selectedOrder,
  onChange,
}: Readonly<{
  options: string[];
  selectedOrder: string[];
  onChange: (ordered: string[]) => void;
}>) {
  const remaining = options.filter((o) => !selectedOrder.includes(o));
  return (
    <div className="mt-2 space-y-3">
      <div className="flex min-h-[44px] flex-wrap gap-2 rounded-lg border-2 border-dashed border-(--border) bg-(--bg) p-3">
        {selectedOrder.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(selectedOrder.filter((x) => x !== s))}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-left text-sm hover:border-(--accent)"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-xs text-(--text-muted)">
        Click the sentences in the order they should appear.
      </p>
      <div className="flex flex-wrap gap-2">
        {remaining.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange([...selectedOrder, s])}
            className="rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm hover:border-(--accent) hover:bg-(--accent-soft)"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.podcastId as string;
  const { t } = useTranslate();
  const { data: podcast, isPending, isError } = usePodcastDetail(podcastId);
  const submit = useExerciseSubmit(podcastId);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  /** For sentence_order: ordered list of option strings per question number. */
  const [sentenceOrder, setSentenceOrder] = useState<Record<number, string[]>>(
    {},
  );
  const [confirming, setConfirming] = useState(false);

  if (isPending) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </main>
    );
  }

  if (isError || !podcast || !podcast.exercises?.length) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">
          {t('listening.errorLoadingPodcasts')}
        </p>
        <Link
          href="/dashboard/listening"
          className="mt-4 inline-block text-(--accent)"
        >
          {t('listening.results.backToList')}
        </Link>
      </main>
    );
  }

  const getAnswerForQuestion = (ex: (typeof podcast.exercises)[0]): string => {
    if (ex.type === 'sentence_order' && ex.options?.length) {
      const ordered = sentenceOrder[ex.questionNumber] ?? [];
      return ordered.join(SENTENCE_ORDER_DELIMITER);
    }
    return answers[ex.questionNumber] ?? '';
  };

  const handleSubmit = async () => {
    const payload = {
      answers: podcast.exercises.map((e) => ({
        questionNumber: e.questionNumber,
        answer: getAnswerForQuestion(e),
      })),
    };
    try {
      await submit.mutateAsync(payload);
      router.push(`/dashboard/listening/${podcastId}/exercises/results`);
    } catch {
      // Error shown by mutation
    }
  };

  return (
    <main className="p-6 md:p-8">
      <Link
        href={`/dashboard/listening/${podcastId}`}
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← {podcast.title}
      </Link>
      <h1 className="text-2xl font-medium text-(--text)">
        {t('listening.exercises.title')}
      </h1>
      <p className="mt-1 text-sm text-(--text-muted)">
        Question 1 of {podcast.exercises.length}
      </p>
      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setConfirming(true);
        }}
      >
        {podcast.exercises.map((ex) => (
          <fieldset
            key={ex.id}
            className="rounded-xl border border-(--border) p-4"
          >
            <legend className="text-sm font-medium text-(--text)">
              {ex.questionNumber}. {ex.questionText}
            </legend>
            {ex.type === 'sentence_order' && ex.options?.length ? (
              <SentenceOrderInput
                options={ex.options}
                selectedOrder={sentenceOrder[ex.questionNumber] ?? []}
                onChange={(ordered) =>
                  setSentenceOrder((prev) => ({
                    ...prev,
                    [ex.questionNumber]: ordered,
                  }))
                }
              />
            ) : ex.options?.length ? (
              <div className="mt-2 space-y-2">
                {ex.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q${ex.questionNumber}`}
                      value={opt}
                      checked={answers[ex.questionNumber] === opt}
                      onChange={() =>
                        setAnswers((a) => ({ ...a, [ex.questionNumber]: opt }))
                      }
                      className="rounded border-(--border)"
                    />
                    <span className="text-(--text)">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-(--border) bg-(--bg) px-3 py-2 text-(--text)"
                placeholder={
                  ex.type === 'fill_blank'
                    ? 'Type the missing word...'
                    : 'Write your answer...'
                }
                value={answers[ex.questionNumber] ?? ''}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    [ex.questionNumber]: e.target.value,
                  }))
                }
              />
            )}
          </fieldset>
        ))}
        {!confirming ? (
          <button
            type="submit"
            className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t('listening.exercises.submitAnswers')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-(--border) px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submit.isPending}
              className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {submit.isPending
                ? t('common.loading')
                : t('listening.exercises.submitAnswers')}
            </button>
          </div>
        )}
      </form>
    </main>
  );
}
