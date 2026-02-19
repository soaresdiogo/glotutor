'use client';

import { useEffect, useState } from 'react';

import type {
  ComprehensionAnswerEntry,
  ComprehensionQuestion,
} from '@/client-api/reading.api';
import { readingApi } from '@/client-api/reading.api';
import { useTranslate } from '@/locales';

type ReadingComprehensionProps = Readonly<{
  questions: ComprehensionQuestion[];
  sessionId?: string;
  savedAnswers?: Record<string, ComprehensionAnswerEntry>;
}>;

/** Unique key per question so each has independent reveal state (handles duplicate or missing ids from API). */
function questionKey(q: ComprehensionQuestion, index: number): string {
  const id = q.id && q.id.trim() !== '' ? q.id : `q-${index}`;
  return `${id}-${index}`;
}

function normalizeForComparison(s: string): string {
  return s.trim().toLowerCase().replaceAll(/\s+/g, ' ');
}

function isAnswerCorrect(student: string, correct: string): boolean {
  return normalizeForComparison(student) === normalizeForComparison(correct);
}

export function ReadingComprehension({
  questions,
  sessionId,
  savedAnswers,
}: ReadingComprehensionProps) {
  const { t } = useTranslate();
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  /** Student answers per question key. */
  const [answers, setAnswers] = useState<Record<string, string>>({});
  /** Question keys that the student has submitted (locked). */
  const [submitted, setSubmitted] = useState<Set<string>>(() => new Set());
  /** For submitted questions: whether the answer was correct (for showing correction). */
  const [correctByKey, setCorrectByKey] = useState<Record<string, boolean>>(
    () => ({}),
  );
  const [saving, setSaving] = useState(false);

  const hasSaved = savedAnswers != null && Object.keys(savedAnswers).length > 0;

  useEffect(() => {
    if (!hasSaved) return;
    const initialAnswers: Record<string, string> = {};
    const initialSubmitted = new Set<string>();
    const initialCorrect: Record<string, boolean> = {};
    for (const [key, entry] of Object.entries(savedAnswers)) {
      initialAnswers[key] = entry.answer;
      initialSubmitted.add(key);
      initialCorrect[key] = entry.correct;
    }
    setAnswers(initialAnswers);
    setSubmitted(initialSubmitted);
    setCorrectByKey(initialCorrect);
  }, [hasSaved, savedAnswers]);

  const buildPayload = (
    submittedSet: Set<string>,
    answersMap: Record<string, string>,
    correctMap: Record<string, boolean>,
  ): Record<string, ComprehensionAnswerEntry> => {
    const out: Record<string, ComprehensionAnswerEntry> = {};
    for (const k of submittedSet) {
      const ans = answersMap[k] ?? savedAnswers?.[k]?.answer ?? '';
      const cor =
        correctMap[k] ??
        savedAnswers?.[k]?.correct ??
        (() => {
          const q = questions.find(
            (_, i) => questionKey(questions[i], i) === k,
          );
          return q ? isAnswerCorrect(ans, q.correct_answer) : false;
        })();
      out[k] = { answer: ans, correct: cor };
    }
    return out;
  };

  const handleSubmitAnswer = (key: string, correctAnswer: string) => {
    const studentAnswer = answers[key] ?? '';
    const correct = isAnswerCorrect(studentAnswer, correctAnswer);
    const nextCorrect = { ...correctByKey, [key]: correct };
    const nextSubmitted = new Set(submitted).add(key);
    const nextAnswers = { ...answers, [key]: studentAnswer };
    setCorrectByKey(nextCorrect);
    setSubmitted(nextSubmitted);

    if (sessionId) {
      setSaving(true);
      const payload = buildPayload(nextSubmitted, nextAnswers, nextCorrect);
      readingApi
        .saveComprehensionAnswers(sessionId, payload)
        .then(() => {})
        .finally(() => setSaving(false));
    }
  };

  const toggleReveal = (key: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (questions.length === 0) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-lg font-semibold text-(--text)">
        {t('reading.comprehensionTitle')}
      </h2>
      <p className="text-sm text-(--text-muted)">
        {t('reading.comprehensionIntro')}
      </p>
      <ul className="space-y-4">
        {questions.map((q, index) => {
          const key = questionKey(q, index);
          const isSubmitted = submitted.has(key);
          const isRevealed = revealed.has(key);
          const studentAnswer = answers[key] ?? '';
          const correct = correctByKey[key];
          const isFromServer = hasSaved && savedAnswers?.[key] != null;

          return (
            <li
              key={key}
              className="rounded-xl border border-(--border) bg-(--bg-card) p-4"
            >
              <p className="font-medium text-(--text)">{q.question}</p>
              {q.question_translation && (
                <p className="mt-1 text-sm text-(--text-dim)">
                  {q.question_translation}
                </p>
              )}
              {isSubmitted ? (
                <>
                  <div className="mt-3 rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text)">
                    <span className="text-xs font-medium text-(--text-muted)">
                      {t('reading.yourAnswer')}:
                    </span>{' '}
                    {studentAnswer}
                  </div>
                  {correct !== undefined && (
                    <p
                      className={`mt-2 text-sm font-medium ${
                        correct ? 'text-(--green)' : 'text-(--red)'
                      }`}
                    >
                      {correct ? t('reading.correct') : t('reading.incorrect')}
                    </p>
                  )}
                  {isFromServer ? null : (
                    <button
                      type="button"
                      onClick={() => toggleReveal(key)}
                      className="mt-2 rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2 text-sm font-medium text-(--text-muted) hover:bg-(--bg-card) hover:text-(--text)"
                    >
                      {isRevealed
                        ? t('reading.hideAnswer')
                        : t('reading.revealAnswer')}
                    </button>
                  )}
                  {(isRevealed || isFromServer) && (
                    <div className="mt-3 space-y-2 rounded-lg border border-(--green-border) bg-(--green-bg) p-3 text-sm">
                      <p className="font-medium text-(--green)">
                        {q.correct_answer}
                      </p>
                      <p className="text-(--text-muted)">{q.explanation}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="mt-3 block">
                    <span className="mb-1 block text-xs font-medium text-(--text-muted)">
                      {t('reading.yourAnswer')}
                    </span>
                    <textarea
                      value={studentAnswer}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={t('reading.writeYourInterpretation')}
                      rows={2}
                      className="w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-muted)"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSubmitAnswer(key, q.correct_answer)}
                    disabled={!studentAnswer.trim() || saving}
                    className="mt-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {t('reading.submitAnswer')}
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
