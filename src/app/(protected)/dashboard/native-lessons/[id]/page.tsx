'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LessonPlayer } from '@/components/native-lessons';
import { useLessonPlayer } from '@/hooks/native-lessons';
import { useTranslate } from '@/locales';

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const { t } = useTranslate();
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  const {
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
    startLesson,
    isStarting,
    redoLesson,
    isRedoing,
  } = useLessonPlayer(resolvedId);

  const progress = lesson?.progress;
  const needsStart =
    progress?.status !== 'in_progress' && progress?.status !== 'completed';

  const handleStart = async () => {
    if (!resolvedId) return;
    try {
      await startLesson();
    } catch {
      router.push('/dashboard/native-lessons');
    }
  };

  if (!resolvedId) {
    return (
      <main className="p-6 md:p-8">
        <div className="py-12 text-center text-(--text-muted)">
          {t('common.loading')}
        </div>
      </main>
    );
  }

  if (needsStart && !isLoading && lesson) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
            <h1 className="text-2xl font-medium text-(--text)">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="mt-2 text-sm text-(--text-muted)">
                {lesson.description}
              </p>
            )}
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting}
              className="mt-8 rounded-xl bg-(--accent) px-8 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {isStarting
                ? t('common.loading')
                : t('nativeLessons.startLesson')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isCompleted = progress?.status === 'completed';

  return (
    <main className="p-6 md:p-8">
      <LessonPlayer
        lessonId={resolvedId}
        lesson={lesson}
        isLoading={isLoading}
        isError={isError}
        exerciseStates={exerciseStates}
        setExerciseAnswer={setExerciseAnswer}
        submitExercise={submitExercise}
        retryExercise={retryExercise}
        completedCount={completedCount}
        totalExercises={totalExercises}
        progressPercent={progressPercent}
        allSubmittedAtLeastOnce={allSubmittedAtLeastOnce}
        finalScore={finalScore}
        saveAndExit={saveAndExit}
        isSaving={isSaving}
        isCompleted={isCompleted}
        redoLesson={redoLesson}
        isRedoing={isRedoing}
      />
    </main>
  );
}
