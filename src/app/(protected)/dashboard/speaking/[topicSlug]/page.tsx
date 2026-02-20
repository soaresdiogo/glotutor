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

function getDurationSeconds(cefrLevel: string): number {
  if (cefrLevel.startsWith('A')) return 5 * 60;
  if (cefrLevel.startsWith('B')) return 8 * 60;
  return 12 * 60;
}

function getDurationMinutes(cefrLevel: string): number {
  if (cefrLevel.startsWith('A')) return 5;
  if (cefrLevel.startsWith('B')) return 8;
  return 12;
}

function isConversationState(
  state: string,
): state is 'connecting' | 'active' | 'ending' {
  return state === 'connecting' || state === 'active' || state === 'ending';
}

function exercisesTopicIdFor(
  state: string,
  topicId: string | undefined,
): string | null {
  if (state === 'exercises' || state === 'completed') return topicId ?? null;
  return null;
}

function feedbackSessionIdFor(
  state: string,
  sessionId: string | null,
): string | null {
  if (state === 'exercises' || state === 'completed') return sessionId;
  return null;
}

function resultsSessionIdFor(
  state: string,
  sessionId: string | null,
): string | null {
  return state === 'completed' ? sessionId : null;
}

function useSubmitFeedbackWhenReady(
  session: ReturnType<typeof useSpeakingSession>,
  transcript: { role: 'user' | 'assistant'; content: string }[],
  submitFeedbackMutation: ReturnType<typeof useSubmitSpeakingFeedback>,
) {
  const feedbackSubmittedRef = useRef<string | null>(null);

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
}

// Loading / error views (low complexity)
function LoadingMain({ message }: { message: string }) {
  const { t } = useTranslate();
  return (
    <main className="p-6 md:p-8">
      <p className="text-(--text-muted)">{message || t('common.loading')}</p>
    </main>
  );
}

function TopicErrorView() {
  const { t } = useTranslate();
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

// Idle: start screen or previous results
type IdleStartScreenProps = {
  topic: { title: string; description: string; cefrLevel: string };
  session: ReturnType<typeof useSpeakingSession>;
  limitQuery: ReturnType<typeof useSpeakingSessionLimit>;
  onStart: () => Promise<void>;
};

function IdleStartScreen({
  topic,
  session,
  limitQuery,
  onStart,
}: IdleStartScreenProps) {
  const { t } = useTranslate();
  const durationMinutes = getDurationMinutes(topic.cefrLevel);
  const limit = limitQuery.data;

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
          {t('speaking.durationMinutes', { count: durationMinutes })}
        </p>
        {limit != null && (
          <p className="mt-2 text-sm text-(--text-muted)">
            {t('speaking.sessionsRemaining', {
              remaining: limit.remainingSessions,
              total: limit.dailyLimit,
            })}
          </p>
        )}
        {session.error && (
          <p className="mt-4 text-sm text-(--red)">{session.error}</p>
        )}
        <button
          type="button"
          onClick={onStart}
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

type IdleSubView = 'loading' | 'previous-results' | 'loading-results' | 'start';

function getIdleSubView(
  lastCompleted: { isPending: boolean },
  showPreviousResults: boolean,
  previousResultsQuery: { data: unknown; isPending: boolean },
): IdleSubView {
  if (lastCompleted.isPending) return 'loading';
  if (
    showPreviousResults &&
    previousResultsQuery.data &&
    !previousResultsQuery.isPending
  ) {
    return 'previous-results';
  }
  if (showPreviousResults && previousResultsQuery.isPending)
    return 'loading-results';
  return 'start';
}

type IdleViewProps = {
  topic: { title: string; description: string; cefrLevel: string };
  session: ReturnType<typeof useSpeakingSession>;
  lastCompleted: ReturnType<typeof useLastCompletedSession>;
  previousResultsQuery: ReturnType<typeof useSessionResults>;
  limitQuery: ReturnType<typeof useSpeakingSessionLimit>;
  showPreviousResults: boolean;
  onStart: () => Promise<void>;
  onPracticeAgain: () => void;
};

function IdleView({
  topic,
  session,
  lastCompleted,
  previousResultsQuery,
  limitQuery,
  showPreviousResults,
  onStart,
  onPracticeAgain,
}: IdleViewProps) {
  const { t } = useTranslate();
  const subView = getIdleSubView(
    lastCompleted,
    showPreviousResults,
    previousResultsQuery,
  );

  switch (subView) {
    case 'loading':
      return <LoadingMain message={t('common.loading')} />;
    case 'previous-results': {
      const results = previousResultsQuery.data;
      if (!results) return <LoadingMain message={t('common.loading')} />;
      return (
        <main className="p-6 md:p-8">
          <SpeakingResultsView
            results={results}
            onPracticeAgain={onPracticeAgain}
          />
        </main>
      );
    }
    case 'loading-results':
      return <LoadingMain message={t('common.loading')} />;
    default:
      return (
        <IdleStartScreen
          topic={topic}
          session={session}
          limitQuery={limitQuery}
          onStart={onStart}
        />
      );
  }
}

// Conversation step
type ConversationViewProps = {
  session: ReturnType<typeof useSpeakingSession>;
  conversation: ReturnType<typeof useSpeakingConversation>;
  onTimerExpire: () => void;
  onEndSession: () => Promise<void>;
};

function ConversationView({
  session,
  conversation,
  onTimerExpire,
  onEndSession,
}: ConversationViewProps) {
  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-6">
      <SpeakingConversation
        durationSeconds={session.durationSeconds}
        topicTitle={session.topicTitle}
        onExpire={onTimerExpire}
        onEndClick={onEndSession}
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

// Feedback step
type FeedbackStepProps = {
  session: ReturnType<typeof useSpeakingSession>;
  feedbackQuery: ReturnType<typeof useSpeakingFeedback>;
  onContinue: () => void;
};

function FeedbackStep({
  session,
  feedbackQuery,
  onContinue,
}: FeedbackStepProps) {
  const { t } = useTranslate();
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
      <SpeakingFeedbackView feedback={feedback} onContinue={onContinue} />
    </main>
  );
}

// Exercises step
type ExercisesStepProps = {
  session: ReturnType<typeof useSpeakingSession>;
  exercisesQuery: ReturnType<typeof useSpeakingExercises>;
  onComplete: () => void;
};

function ExercisesStep({
  session,
  exercisesQuery,
  onComplete,
}: ExercisesStepProps) {
  const { t } = useTranslate();
  const exercises = exercisesQuery.data ?? [];

  if (exercisesQuery.isPending) {
    return <LoadingMain message={t('common.loading')} />;
  }
  return (
    <main className="p-6 md:p-8">
      <SpeakingExercisesView
        sessionId={session.session?.id ?? ''}
        exercises={exercises}
        onComplete={onComplete}
      />
    </main>
  );
}

// Completed step
type CompletedStepProps = {
  resultsQuery: ReturnType<typeof useSessionResults>;
};

function CompletedStep({ resultsQuery }: CompletedStepProps) {
  const { t } = useTranslate();
  const results = resultsQuery.data;

  if (resultsQuery.isPending || !results) {
    return <LoadingMain message={t('common.loading')} />;
  }
  return (
    <main className="p-6 md:p-8">
      <SpeakingResultsView results={results} />
    </main>
  );
}

// Routes by session state to keep main page under complexity limit
type SessionViewRouterProps = {
  topic: { id: string; title: string; description: string; cefrLevel: string };
  session: ReturnType<typeof useSpeakingSession>;
  conversation: ReturnType<typeof useSpeakingConversation>;
  exercisesQuery: ReturnType<typeof useSpeakingExercises>;
  feedbackQuery: ReturnType<typeof useSpeakingFeedback>;
  resultsQuery: ReturnType<typeof useSessionResults>;
  previousResultsQuery: ReturnType<typeof useSessionResults>;
  limitQuery: ReturnType<typeof useSpeakingSessionLimit>;
  showPreviousResults: boolean;
  lastCompleted: ReturnType<typeof useLastCompletedSession>;
  onStart: () => Promise<void>;
  onPracticeAgain: () => void;
  onTimerExpire: () => void;
  onEndSession: () => Promise<void>;
  onFeedbackContinue: () => void;
  onExercisesComplete: () => void;
};

function SessionViewRouter(props: SessionViewRouterProps) {
  const { session } = props;
  const viewKey = isConversationState(session.state)
    ? 'conversation'
    : session.state;
  const ViewComponent = SESSION_VIEW_MAP[viewKey];
  return ViewComponent ? <ViewComponent {...props} /> : null;
}

function IdleRoute(props: SessionViewRouterProps) {
  const {
    topic,
    session,
    lastCompleted,
    previousResultsQuery,
    limitQuery,
    showPreviousResults,
    onStart,
    onPracticeAgain,
  } = props;
  return (
    <IdleView
      topic={topic}
      session={session}
      lastCompleted={lastCompleted}
      previousResultsQuery={previousResultsQuery}
      limitQuery={limitQuery}
      showPreviousResults={showPreviousResults}
      onStart={onStart}
      onPracticeAgain={onPracticeAgain}
    />
  );
}

function ConversationRoute(props: SessionViewRouterProps) {
  const { session, conversation, onTimerExpire, onEndSession } = props;
  return (
    <ConversationView
      session={session}
      conversation={conversation}
      onTimerExpire={onTimerExpire}
      onEndSession={onEndSession}
    />
  );
}

function FeedbackRoute(props: SessionViewRouterProps) {
  const { session, feedbackQuery, onFeedbackContinue } = props;
  return (
    <FeedbackStep
      session={session}
      feedbackQuery={feedbackQuery}
      onContinue={onFeedbackContinue}
    />
  );
}

function ExercisesRoute(props: SessionViewRouterProps) {
  const { session, exercisesQuery, onExercisesComplete } = props;
  return (
    <ExercisesStep
      session={session}
      exercisesQuery={exercisesQuery}
      onComplete={onExercisesComplete}
    />
  );
}

function CompletedRoute(props: SessionViewRouterProps) {
  return <CompletedStep resultsQuery={props.resultsQuery} />;
}

const SESSION_VIEW_MAP: Partial<
  Record<
    'idle' | 'conversation' | 'feedback' | 'exercises' | 'completed',
    (p: SessionViewRouterProps) => React.ReactNode
  >
> = {
  idle: IdleRoute,
  conversation: ConversationRoute,
  feedback: FeedbackRoute,
  exercises: ExercisesRoute,
  completed: CompletedRoute,
};

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
    durationSeconds: topic ? getDurationSeconds(topic.cefrLevel) : 300,
  });

  const conversation = useSpeakingConversation({
    sessionId: session.session?.id ?? null,
    enabled: isConversationState(session.state),
    onSessionExpired: () => session.endSession(),
  });

  const submitFeedbackMutation = useSubmitSpeakingFeedback(
    session.session?.id ?? null,
  );
  const transcript = conversation.messages.map((m) => ({
    role: m.role,
    content: m.text,
  }));
  useSubmitFeedbackWhenReady(session, transcript, submitFeedbackMutation);

  const sessionId = session.session?.id ?? null;
  const topicId = session.session?.topicId;
  const exercisesQuery = useSpeakingExercises(
    exercisesTopicIdFor(session.state, topicId),
  );
  const feedbackQuery = useSpeakingFeedback(
    feedbackSessionIdFor(session.state, sessionId),
  );
  const resultsQuery = useSessionResults(
    resultsSessionIdFor(session.state, sessionId),
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
    return <LoadingMain message={t('common.loading')} />;
  }

  if (topicError || !topic) {
    return <TopicErrorView />;
  }

  return (
    <SessionViewRouter
      topic={topic}
      session={session}
      conversation={conversation}
      exercisesQuery={exercisesQuery}
      feedbackQuery={feedbackQuery}
      resultsQuery={resultsQuery}
      previousResultsQuery={previousResultsQuery}
      limitQuery={limitQuery}
      showPreviousResults={showPreviousResults}
      lastCompleted={lastCompleted}
      onStart={handleStart}
      onPracticeAgain={() => setWantsNewSession(true)}
      onTimerExpire={handleTimerExpire}
      onEndSession={handleEndSession}
      onFeedbackContinue={handleFeedbackContinue}
      onExercisesComplete={handleExercisesComplete}
    />
  );
}
