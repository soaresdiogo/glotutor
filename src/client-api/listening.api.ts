import { httpClient } from '@/shared/lib/http-client';

export type PodcastListItem = {
  id: string;
  title: string;
  description: string;
  languageCode: string;
  cefrLevel: string;
  durationSeconds: number;
  createdAt: string;
  exerciseCount: number;
  progress?: {
    listenedPercentage: number;
    exerciseScore: number | null;
    totalQuestions?: number | null;
    exerciseCompletedAt: string | null;
  };
};

export type PodcastExerciseItem = {
  id: string;
  podcastId: string;
  questionNumber: number;
  type: string;
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  explanationText: string;
};

export type PodcastDetail = {
  id: string;
  title: string;
  description: string;
  languageCode: string;
  cefrLevel: string;
  audioUrl: string;
  transcript: string;
  durationSeconds: number;
  vocabularyHighlights: Array<{ word: string; translation: string }>;
  createdAt: string;
  updatedAt: string;
  exercises: PodcastExerciseItem[];
  progress?: {
    listenedPercentage: number;
    exerciseScore: number | null;
    exerciseCompletedAt: string | null;
    exerciseAnswers: Array<{ questionNumber: number; answer: string }> | null;
    exerciseFeedback: ExerciseFeedback | null;
  };
};

export type ExerciseFeedback = {
  perQuestion?: Array<{
    questionNumber: number;
    correct: boolean;
    explanation: string;
    studentAnswer?: string;
    correctAnswer?: string;
  }>;
  overallFeedback?: string;
};

export type StudentProgress = {
  id: string;
  userId: string;
  podcastId: string;
  listenedPercentage: number;
  completedAt: string | null;
  exerciseScore: number | null;
  exerciseCompletedAt: string | null;
  exerciseAnswers: Array<{ questionNumber: number; answer: string }> | null;
  exerciseFeedback: ExerciseFeedback | null;
  createdAt: string;
  updatedAt: string;
};

export type SubmitExercisesPayload = {
  answers: Array<{ questionNumber: number; answer: string }>;
};

export type SubmitExercisesResponse = {
  score: number;
  totalQuestions: number;
  perQuestion: Array<{
    questionNumber: number;
    correct: boolean;
    explanation: string;
    studentAnswer: string;
    correctAnswer: string;
  }>;
  overallFeedback: string;
};

export type ExerciseResultsResponse = {
  podcastId: string;
  podcastTitle: string;
  exerciseScore: number;
  totalQuestions: number;
  exerciseCompletedAt: string;
  exerciseFeedback: ExerciseFeedback;
};

export const listeningApi = {
  listPodcasts: (params?: { language?: string; level?: string }) =>
    httpClient
      .get('listening/podcasts', {
        searchParams: params ?? {},
      })
      .json<{ podcasts: PodcastListItem[] }>(),

  getPodcast: (podcastId: string) =>
    httpClient.get(`listening/podcasts/${podcastId}`).json<PodcastDetail>(),

  updateProgress: (podcastId: string, listenedPercentage: number) =>
    httpClient
      .post(`listening/podcasts/${podcastId}/progress`, {
        json: { listenedPercentage },
      })
      .json<StudentProgress>(),

  submitExercises: (podcastId: string, payload: SubmitExercisesPayload) =>
    httpClient
      .post(`listening/podcasts/${podcastId}/exercises/submit`, {
        json: payload,
      })
      .json<SubmitExercisesResponse>(),

  getExerciseResults: (podcastId: string) =>
    httpClient
      .get(`listening/podcasts/${podcastId}/exercises/results`)
      .json<ExerciseResultsResponse>(),

  generatePodcast: (payload: {
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
    topic: string;
  }) =>
    httpClient
      .post('listening/generate', { json: payload })
      .json<PodcastDetail>(),
};
