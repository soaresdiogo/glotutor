'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SpeakingConversation,
  SpeakingExercisesView,
  SpeakingFeedbackView,
  SpeakingResultsView,
} from '@/components/speaking';
import {
  useLastCompletedSession,
  useSessionResults,
  useSpeakingConversation,
  useSpeakingExercises,
  useSpeakingFeedback,
  useSpeakingSession,
  useSpeakingSessionLimit,
  useSpeakingTopic,
  useSubmitSpeakingFeedback,
} from '@/hooks/speaking';
import { useTranslate } from '@/locales';

export default function SpeakingTopicPage() {
  const params = useParams();
  const slug = params.topicSlug as string;
  const { t } = useTranslate();
  const {
    data: topic,
    isPending: topicPending,
    isError: topicError,
  } = useSpeakingTopic(slug);

  const [wantsNewSession, setWantsNewSession] = useState(false);
  const lastCompleted = useLastCompletedSession(slug);
  const lastSessionId = lastCompleted.data?.sessionId ?? null;

  const session = useSpeakingSession({
    topicId: topic?.id ?? '',
    topicSlug: slug,
    topicTitle: topic?.title ?? '',
    durationSeconds: (() => {
      if (!topic) return 300;
      if (topic.cefrLevel.startsWith('A')) return 5 * 60;
      if (topic.cefrLevel.startsWith('B')) return 8 * 60;
      return 12 * 60;
    })(),
  });

  const conversation = useSpeakingConversation({
    sessionId: session.session?.id ?? null,
    enabled:
      session.state === 'connecting' ||
      session.state === 'active' ||
      session.state === 'ending',
    onSessionExpired: () => session.endSession(),
  });

  const submitFeedbackMutation = useSubmitSpeakingFeedback(
    session.session?.id ?? null,
  );
  const feedbackSubmittedRef = useRef<string | null>(null);

  const transcript = conversation.messages.map((m) => ({
    role: m.role,
    content: m.text,
  }));

  useEffect(() => {
    if (session.state !== 'feedback' || !session.session?.id) return;
    if (transcript.length === 0) {
      session.setFeedback(null);
      return;
    }
    const sid = session.session.id;
    if (session.feedback || feedbackSubmittedRef.current === sid) return;
    feedbackSubmittedRef.current = sid;
    submitFeedbackMutation
      .mutateAsync(transcript)
      .then((fb) => session.setFeedback(fb))
      .catch(() => session.setFeedback(null));
  }, [
    session.state,
    session.session?.id,
    transcript,
    session.feedback,
    session.setFeedback,
    submitFeedbackMutation,
  ]);

  const exercisesQuery = useSpeakingExercises(
    session.state === 'exercises' || session.state === 'completed'
      ? (session.session?.topicId ?? null)
      : null,
  );
  const feedbackQuery = useSpeakingFeedback(
    session.state === 'exercises' || session.state === 'completed'
      ? (session.session?.id ?? null)
      : null,
  );
  const resultsQuery = useSessionResults(
    session.state === 'completed' ? (session.session?.id ?? null) : null,
  );
  const showPreviousResults =
    session.state === 'idle' && Boolean(lastSessionId) && !wantsNewSession;
  const previousResultsQuery = useSessionResults(
    showPreviousResults ? lastSessionId : null,
  );
  const limitQuery = useSpeakingSessionLimit();

  const handleEndSession = useCallback(async () => {
    await session.endSession();
  }, [session]);

  const handleTimerExpire = useCallback(() => {
    // Defer to next tick so we never run setState during another component's render
    setTimeout(() => session.endSession(), 0);
  }, [session]);

  const handleFeedbackContinue = useCallback(() => {
    session.goToExercises();
  }, [session]);

  const handleExercisesComplete = useCallback(() => {
    session.goToCompleted();
  }, [session]);

  const handleStart = useCallback(async () => {
    await session.startSession();
  }, [session]);

  if (topicPending || !slug) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </main>
    );
  }

  if (topicError || !topic) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('speaking.topicNotFound')}</p>
        <Link
          href="/dashboard/speaking"
          className="mt-4 inline-block text-sm text-(--accent) hover:underline"
        >
          {t('speaking.backToTopics')}
        </Link>
      </main>
    );
  }

  if (session.state === 'idle') {
    if (lastCompleted.isPending) {
      return (
        <main className="p-6 md:p-8">
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        </main>
      );
    }
    if (
      showPreviousResults &&
      previousResultsQuery.data &&
      !previousResultsQuery.isPending
    ) {
      return (
        <main className="p-6 md:p-8">
          <SpeakingResultsView
            results={previousResultsQuery.data}
            onPracticeAgain={() => setWantsNewSession(true)}
          />
        </main>
      );
    }
    if (showPreviousResults && previousResultsQuery.isPending) {
      return (
        <main className="p-6 md:p-8">
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        </main>
      );
    }
    return (
      <main className="p-6 md:p-8">
        <Link
          href="/dashboard/speaking"
          className="mb-6 inline-block text-sm text-(--accent) hover:underline"
        >
          ← {t('speaking.backToTopics')}
        </Link>
        <div className="mx-auto max-w-xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--accent-soft) border border-(--accent-border)">
            <span className="text-3xl">🎙️</span>
          </div>
          <h1 className="text-2xl font-medium text-(--text)">{topic.title}</h1>
          <p className="mt-2 text-(--text-muted)">{topic.description}</p>
          <p className="mt-4 text-sm text-(--text-muted)">
            {t('speaking.introDescription')}{' '}
            {t('speaking.durationMinutes', {
              count: topic.cefrLevel.startsWith('A')
                ? 5
                : topic.cefrLevel.startsWith('B')
                  ? 8
                  : 12,
            })}
          </p>
          {limitQuery.data != null && (
            <p className="mt-2 text-sm text-(--text-muted)">
              {t('speaking.sessionsRemaining', {
                remaining: limitQuery.data.remainingSessions,
                total: limitQuery.data.dailyLimit,
              })}
            </p>
          )}
          {session.error && (
            <p className="mt-4 text-sm text-(--red)">{session.error}</p>
          )}
          <button
            type="button"
            onClick={handleStart}
            disabled={session.isCreatingSession}
            className="mt-8 w-full rounded-xl bg-(--accent) py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {session.isCreatingSession
              ? t('speaking.starting')
              : t('speaking.startConversation')}
          </button>
        </div>
      </main>
    );
  }

  if (
    session.state === 'connecting' ||
    session.state === 'active' ||
    session.state === 'ending'
  ) {
    return (
      <main className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-6">
        <SpeakingConversation
          durationSeconds={session.durationSeconds}
          topicTitle={session.topicTitle}
          onExpire={handleTimerExpire}
          onEndClick={handleEndSession}
          isConnecting={session.state === 'connecting'}
          messages={conversation.messages}
          isRecording={conversation.isRecording}
          isTutorSpeaking={conversation.isTutorSpeaking}
          isProcessing={conversation.isProcessing}
          greetingComplete={conversation.greetingComplete}
          error={conversation.error}
          onStartRecording={conversation.startRecording}
          onStopRecording={conversation.stopRecording}
          onStartGreeting={conversation.startGreeting}
          sessionId={session.session?.id ?? null}
        />
      </main>
    );
  }

  if (session.state === 'feedback') {
    const feedback = session.feedback ?? feedbackQuery.data;
    if (!feedback) {
      return (
        <main className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--accent) border-t-transparent" />
            <p className="mt-4 text-(--text-muted)">
              {t('speaking.generatingFeedback')}
            </p>
          </div>
        </main>
      );
    }
    return (
      <main className="p-6 md:p-8">
        <SpeakingFeedbackView
          feedback={feedback}
          onContinue={handleFeedbackContinue}
        />
      </main>
    );
  }

  if (session.state === 'exercises') {
    const exercises = exercisesQuery.data ?? [];
    if (exercisesQuery.isPending) {
      return (
        <main className="p-6 md:p-8">
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        </main>
      );
    }
    return (
      <main className="p-6 md:p-8">
        <SpeakingExercisesView
          sessionId={session.session?.id ?? ''}
          exercises={exercises}
          onComplete={handleExercisesComplete}
        />
      </main>
    );
  }

  if (session.state === 'completed') {
    const results = resultsQuery.data;
    if (resultsQuery.isPending || !results) {
      return (
        <main className="p-6 md:p-8">
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        </main>
      );
    }
    return (
      <main className="p-6 md:p-8">
        <SpeakingResultsView results={results} />
      </main>
    );
  }

  return null;
}
