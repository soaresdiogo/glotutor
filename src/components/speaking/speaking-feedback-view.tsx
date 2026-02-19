'use client';

import type { SpeakingFeedback } from '@/client-api/speaking.api';
import { useTranslate } from '@/locales';

type SpeakingFeedbackViewProps = Readonly<{
  feedback: SpeakingFeedback | null;
  onContinue: () => void;
}>;

export function SpeakingFeedbackView({
  feedback,
  onContinue,
}: SpeakingFeedbackViewProps) {
  const { t } = useTranslate();

  if (!feedback) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-12">
        <header className="text-center">
          <h1 className="text-2xl font-medium text-(--text)">
            {t('speaking.sessionComplete')}
          </h1>
          <p className="mt-4 text-sm text-(--text-muted)">
            {t('speaking.tooShortForFeedback')}
          </p>
        </header>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl bg-(--accent) px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            {t('speaking.continueToExercises')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <header className="text-center">
        <h1 className="text-2xl font-medium text-(--text)">
          {t('speaking.sessionComplete')}
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {t('speaking.overallScore', { score: feedback.overall_score })}
        </p>
        <p className="mt-4 text-sm text-(--text-muted)">
          {feedback.encouragement_message}
        </p>
      </header>

      <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="mb-3 text-lg font-medium text-(--text)">
          {t('speaking.strengths')}
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-(--text-muted)">
          {feedback.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      {feedback.grammar_errors.length > 0 && (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
          <h2 className="mb-3 text-lg font-medium text-(--text)">
            {t('speaking.corrections')}
          </h2>
          <ul className="space-y-3">
            {feedback.grammar_errors.map((e) => (
              <li
                key={`${e.what_student_said}|${e.correction}|${e.explanation}`}
                className="rounded-lg border-l-4 border-(--yellow) bg-(--bg-elevated) p-3"
              >
                <span className="line-through text-(--red)">
                  {e.what_student_said}
                </span>
                <span className="ml-2 text-(--green)">{e.correction}</span>
                <p className="mt-1 text-xs text-(--text-dim)">
                  {e.explanation}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {feedback.improvement_suggestions.length > 0 && (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
          <h2 className="mb-3 text-lg font-medium text-(--text)">
            {t('speaking.suggestions')}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-(--text-muted)">
            {feedback.improvement_suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-xl bg-(--accent) px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          {t('speaking.continueToExercises')}
        </button>
      </div>
    </div>
  );
}
