'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import {
  type SpeakingFeedback,
  type SpeakingSession,
  speakingApi,
} from '@/client-api/speaking.api';
import { getApiErrorMessage } from '@/shared/lib/api-error-message';

export type SpeakingSessionState =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'ending'
  | 'feedback'
  | 'exercises'
  | 'completed';

export type UseSpeakingSessionParams = {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  durationSeconds: number;
};

export function useSpeakingSession({
  topicId,
  topicSlug,
  topicTitle,
  durationSeconds,
}: UseSpeakingSessionParams) {
  const [state, setState] = useState<SpeakingSessionState>('idle');
  const [session, setSession] = useState<SpeakingSession | null>(null);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createSessionMutation = useMutation({
    mutationFn: () => speakingApi.createSession(topicId),
    onSuccess: (data) => {
      setSession(data);
      setState('active');
    },
    onError: (err: Error) => {
      setState('idle');
      getApiErrorMessage(err).then(setError);
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: () => {
      if (!session) throw new Error('No session');
      return speakingApi.completeSession(session.id);
    },
    onSuccess: () => {
      setState('feedback');
    },
    onError: (err: Error) => {
      getApiErrorMessage(err).then(setError);
    },
  });

  const startSession = useCallback(async () => {
    setError(null);
    setState('connecting');
    try {
      const sess = await createSessionMutation.mutateAsync();
      return sess;
    } catch {
      // Handled in onError
    }
  }, [createSessionMutation]);

  const endSession = useCallback(async () => {
    if (!session) return;
    setState('ending');
    await completeSessionMutation.mutateAsync();
  }, [session, completeSessionMutation]);

  const goToFeedback = useCallback((fb: SpeakingFeedback | null) => {
    setFeedback(fb ?? null);
    setState('feedback');
  }, []);

  const goToExercises = useCallback(() => {
    setState('exercises');
  }, []);

  const goToCompleted = useCallback(() => {
    setState('completed');
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setSession(null);
    setFeedback(null);
    setError(null);
  }, []);

  return {
    state,
    session,
    feedback,
    error,
    durationSeconds,
    topicId,
    topicSlug,
    topicTitle,
    startSession,
    endSession,
    setFeedback: goToFeedback,
    goToExercises,
    goToCompleted,
    reset,
    isCreatingSession: createSessionMutation.isPending,
    isCompleting: completeSessionMutation.isPending,
  };
}
