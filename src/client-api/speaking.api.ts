import { httpClient } from '@/shared/lib/http-client';

export type SpeakingTopicListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cefrLevel: string;
  languageCode: string;
  createdAt: string;
};

export type SpeakingTopicDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cefrLevel: string;
  languageCode: string;
  contextPrompt: string;
  keyVocabulary: string[];
  nativeExpressions: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SpeakingSession = {
  id: string;
  topicId: string;
  status: string;
  durationSeconds: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  remainingSessions?: number;
  dailyLimit?: number;
};

export type SpeakingFeedback = {
  overall_score: number;
  strengths: string[];
  grammar_errors: Array<{
    what_student_said: string;
    correction: string;
    explanation: string;
  }>;
  pronunciation_notes: string[];
  vocabulary_used: Array<{
    word: string;
    context: string;
    is_native_expression: boolean;
  }>;
  improvement_suggestions: string[];
  encouragement_message: string;
};

export type SpeakingExercise = {
  id: string;
  topicId: string;
  questionNumber: number;
  type: string;
  questionText: string;
  options: string[] | Record<string, string>[] | null;
  correctAnswer: string;
  explanationText: string;
};

export type SessionResults = {
  sessionId: string;
  topicTitle: string;
  topicSlug: string;
  cefrLevel: string;
  feedback: SpeakingFeedback | null;
  exercises: Array<
    SpeakingExercise & {
      attempt: {
        id: string;
        answer: string | string[] | Record<string, string> | null;
        isCorrect: boolean;
        createdAt: string;
      } | null;
    }
  >;
  exerciseScore: { correct: number; total: number };
};

export const speakingApi = {
  listTopics: (params?: { level?: string; language?: string }) =>
    httpClient
      .get('speaking/topics', { searchParams: params ?? {} })
      .json<{ topics: SpeakingTopicListItem[] }>(),

  getTopicBySlug: (slug: string) =>
    httpClient.get(`speaking/topics/${slug}`).json<SpeakingTopicDetail>(),

  createSession: (topicId: string) =>
    httpClient
      .post('speaking/session', { json: { topicId } })
      .json<SpeakingSession>(),

  getSessionLimit: () =>
    httpClient
      .get('speaking/session/limit')
      .json<{ remainingSessions: number; dailyLimit: number }>(),

  completeSession: (sessionId: string) =>
    httpClient.post(`speaking/session/${sessionId}/complete`),

  sendMessageStart: (sessionId: string) =>
    httpClient
      .post('speaking/message', { json: { sessionId, isStart: true } })
      .json<{
        tutorText: string;
        tutorAudio: string;
        isSessionExpired: boolean;
        turnInfo: { current: number; max: number };
      }>(),

  sendMessage: (sessionId: string, audio: Blob) => {
    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('audio', audio, 'audio.webm');
    return httpClient.post('speaking/message', { body: form }).json<{
      studentText: string;
      tutorText: string;
      tutorAudio: string;
      isSessionExpired: boolean;
      turnInfo: { current: number; max: number };
      correction?: { correction: string; explanation: string };
    }>();
  },

  submitFeedback: (
    sessionId: string,
    transcript: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) =>
    httpClient
      .post(`speaking/session/${sessionId}/feedback`, {
        json: { transcript },
      })
      .json<SpeakingFeedback>(),

  getFeedback: (sessionId: string) =>
    httpClient
      .get(`speaking/session/${sessionId}/feedback`)
      .json<SpeakingFeedback | null>(),

  getTopicExercises: (topicId: string) =>
    httpClient
      .get(`speaking/topics/${topicId}/exercises`)
      .json<{ exercises: SpeakingExercise[] }>(),

  submitExerciseAttempt: (payload: {
    sessionId: string;
    exerciseId: string;
    answer: string | string[] | Record<string, string>;
  }) =>
    httpClient
      .post('speaking/exercises/attempt', { json: payload })
      .json<{ correct: boolean; attemptId: string; hint?: string }>(),

  getSessionResults: (sessionId: string) =>
    httpClient
      .get(`speaking/session/${sessionId}/results`)
      .json<SessionResults>(),

  getLastCompletedSession: (slug: string) =>
    httpClient
      .get(`speaking/topics/${slug}/last-session`)
      .json<{ sessionId: string | null; completedAt: string | null }>(),
};
