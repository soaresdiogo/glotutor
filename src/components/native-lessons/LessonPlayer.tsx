'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  LessonDetail,
  LessonExercise,
} from '@/client-api/native-lessons.api';
import type { ExerciseState } from '@/hooks/native-lessons/use-lesson-player';
import { useTranslate } from '@/locales';

import { ConceptSection } from './ConceptSection';
import { ChoiceExercise } from './exercises/ChoiceExercise';
import { MatchExercise } from './exercises/MatchExercise';
import { ReorderExercise } from './exercises/ReorderExercise';
import { SituationExercise } from './exercises/SituationExercise';
import { TransformExercise } from './exercises/TransformExercise';

function getExerciseKey(exercise: LessonExercise): string {
  const base = `${exercise.type}-${exercise.prompt.slice(0, 40)}`;
  switch (exercise.type) {
    case 'REORDER':
      return `${base}-${exercise.words.join('-')}`;
    case 'SITUATION':
      return `${base}-${exercise.scenario.slice(0, 30)}`;
    case 'MATCH':
      return `${base}-${exercise.pairs[0]?.situation ?? ''}`;
    case 'CHOICE':
      return `${base}-${exercise.options[0]?.text.slice(0, 20) ?? ''}`;
    case 'TRANSFORM':
      return `${base}-${exercise.pairs[0]?.textbook?.slice(0, 20) ?? ''}`;
    default:
      return base;
  }
}

type Props = {
  lessonId: string;
  lesson: LessonDetail | null;
  isLoading: boolean;
  isError: boolean;
  exerciseStates: Record<number, ExerciseState>;
  setExerciseAnswer: (index: number, answer: string | string[]) => void;
  submitExercise: (
    index: number,
    exercise: LessonExercise,
    answer: string | string[],
  ) => boolean;
  retryExercise: (index: number) => void;
  completedCount: number;
  totalExercises: number;
  progressPercent: number;
  allSubmittedAtLeastOnce: boolean;
  finalScore: number;
  saveAndExit: () => Promise<unknown>;
  isSaving: boolean;
  isCompleted?: boolean;
  redoLesson?: () => Promise<unknown>;
  isRedoing?: boolean;
};

export function LessonPlayer({
  lesson,
  isLoading,
  isError,
  exerciseStates,
  setExerciseAnswer,
  submitExercise,
  retryExercise,
  completedCount,
  totalExercises,
  progressPercent,
  allSubmittedAtLeastOnce,
  finalScore,
  saveAndExit,
  isSaving,
  isCompleted = false,
  redoLesson,
  isRedoing = false,
}: Readonly<Props>) {
  const { t, locale } = useTranslate();
  const router = useRouter();
  const contentWithNative = lesson?.content as
    | { nativeLanguage?: string }
    | undefined;
  const nativeLanguage = contentWithNative?.nativeLanguage;
  const level = lesson?.level ?? '';
  const useNativeDescription = Boolean(
    lesson &&
      (level === 'A1' || level === 'A2') &&
      nativeLanguage &&
      (locale === nativeLanguage || locale.startsWith(`${nativeLanguage}-`)),
  );

  if (isLoading || !lesson) {
    return (
      <div className="py-12 text-center text-(--text-muted)">
        {t('common.loading')}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">{t('nativeLessons.errorLoading')}</p>
        <Link
          href="/dashboard/native-lessons"
          className="mt-4 inline-block text-(--accent) hover:underline"
        >
          {t('nativeLessons.backToList')}
        </Link>
      </div>
    );
  }

  const sections = lesson.content?.sections ?? [];
  const exercises = lesson.content?.exercises ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/native-lessons"
          className="text-sm text-(--text-muted) hover:text-(--text)"
        >
          ← {t('nativeLessons.backToList')}
        </Link>
      </div>

      <header>
        <div className="mb-2 flex gap-2">
          <span className="rounded bg-(--bg-elevated) px-2 py-0.5 text-xs font-medium text-(--text-muted)">
            {lesson.level}
          </span>
          <span className="rounded bg-(--bg-elevated) px-2 py-0.5 text-xs font-medium text-(--text-muted)">
            {lesson.language}
          </span>
        </div>
        <h1 className="text-2xl font-medium text-(--text)">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-sm text-(--text-muted)">
            {lesson.description}
          </p>
        )}
      </header>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--bg-elevated)">
          <div
            className="h-full rounded-full bg-(--accent) transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="font-mono text-xs text-(--text-muted)">
          {completedCount}/{totalExercises}
        </span>
      </div>

      {sections.map((section) => (
        <ConceptSection
          key={`${section.title}-${section.icon}`}
          section={section}
        />
      ))}

      {exercises.map((exercise, i) => {
        const state = exerciseStates[i];
        const submit = (answer: string | string[]) =>
          submitExercise(i, exercise, answer);
        const exerciseKey = `${getExerciseKey(exercise)}-${i}`;

        if (exercise.type === 'REORDER') {
          return (
            <ReorderExercise
              key={exerciseKey}
              exercise={exercise}
              index={i}
              state={state}
              useNativeDescription={useNativeDescription}
              onAnswer={(_, answer) => setExerciseAnswer(i, answer)}
              onSubmit={(answer) => submit(answer)}
              onRetry={() => retryExercise(i)}
            />
          );
        }
        if (exercise.type === 'SITUATION') {
          return (
            <SituationExercise
              key={exerciseKey}
              exercise={exercise}
              index={i}
              state={state}
              useNativeDescription={useNativeDescription}
              onAnswer={(_, answer) => setExerciseAnswer(i, answer)}
              onSubmit={(answer) => submit(answer)}
              onRetry={() => retryExercise(i)}
            />
          );
        }
        if (exercise.type === 'CHOICE') {
          return (
            <ChoiceExercise
              key={exerciseKey}
              exercise={exercise}
              index={i}
              state={state}
              useNativeDescription={useNativeDescription}
              onAnswer={(_, answer) => setExerciseAnswer(i, answer)}
              onSubmit={(answer) => submit(answer)}
              onRetry={() => retryExercise(i)}
            />
          );
        }
        if (exercise.type === 'MATCH') {
          return (
            <MatchExercise
              key={exerciseKey}
              exercise={exercise}
              index={i}
              state={state}
              useNativeDescription={useNativeDescription}
              onAnswer={(_, answer) => setExerciseAnswer(i, answer)}
              onSubmit={(answer) => submit(answer)}
              onRetry={() => retryExercise(i)}
            />
          );
        }
        if (exercise.type === 'TRANSFORM') {
          return (
            <TransformExercise
              key={exerciseKey}
              exercise={exercise}
              index={i}
              state={state}
              useNativeDescription={useNativeDescription}
              onAnswer={(_, answer) => setExerciseAnswer(i, answer)}
              onSubmit={(answer) => submit(answer)}
              onRetry={() => retryExercise(i)}
            />
          );
        }
        return null;
      })}

      {allSubmittedAtLeastOnce && (
        <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
          <h3 className="text-lg font-semibold text-(--text)">
            {t('nativeLessons.lessonComplete')}
          </h3>
          <p className="mt-2 text-sm font-medium text-(--text)">
            {t('nativeLessons.scoreLabel')}: {finalScore}%
          </p>
          <p className="mt-2 text-sm text-(--text-muted)">
            {t('nativeLessons.retryAnyHint')}
          </p>
          {isCompleted ? (
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard/native-lessons"
                className="rounded-xl bg-(--accent) px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                {t('nativeLessons.backToLessons')}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await redoLesson?.();
                  router.refresh();
                }}
                disabled={isRedoing}
                className="rounded-xl border border-(--border) bg-(--bg-card) px-6 py-3 font-semibold text-(--text) hover:bg-(--bg-elevated) disabled:opacity-50"
              >
                {isRedoing
                  ? t('common.loading')
                  : t('nativeLessons.redoLesson')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await saveAndExit();
                router.push('/dashboard/native-lessons');
              }}
              disabled={isSaving}
              className="mt-6 rounded-xl bg-(--accent) px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSaving
                ? t('common.loading')
                : t('nativeLessons.saveAndBackToLessons')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
