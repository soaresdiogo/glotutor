import { httpClient } from '@/shared/lib/http-client';

export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type LessonListItem = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  language: string;
  sortOrder: number;
  progress?: {
    status: LessonProgressStatus;
    score: number | null;
    completedAt: string | null;
  };
};

export type LessonDetailProgress = {
  status: LessonProgressStatus;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
  exerciseResults: unknown;
};

export type LessonSectionExample = {
  native: string;
  translation: string;
  context: string;
  never_say?: string;
};

export type LessonSectionContent = {
  intro: { title: string; text: string };
  examples: LessonSectionExample[];
  cultural_note?: string;
};

export type LessonSection = {
  type: 'CONCEPT';
  icon: string;
  title: string;
  content: LessonSectionContent;
};

export type LessonExercise =
  | {
      type: 'REORDER';
      prompt: string;
      prompt_native?: string;
      scenario?: string;
      scenario_native?: string;
      words: string[];
      answer: string;
    }
  | {
      type: 'SITUATION';
      prompt: string;
      prompt_native?: string;
      scenario: string;
      scenario_native?: string;
      placeholder?: string;
      hint?: string;
      expected_answer?: string;
      acceptable_patterns?: string[];
      key_phrases?: string[];
      feedback_correct?: string;
      feedback_needs_improvement?: string;
    }
  | {
      type: 'MATCH';
      prompt: string;
      prompt_native?: string;
      pairs: Array<{ situation: string; chunk: string }>;
    }
  | {
      type: 'CHOICE';
      prompt: string;
      prompt_native?: string;
      scenario: string;
      scenario_native?: string;
      options: Array<{ text: string; correct: boolean; explanation: string }>;
    }
  | {
      type: 'TRANSFORM';
      prompt: string;
      prompt_native?: string;
      pairs: Array<{
        textbook: string;
        hint?: string;
        expected_answer?: string;
        acceptable_patterns?: string[];
        feedback_correct?: string;
        feedback_needs_improvement?: string;
      }>;
    };

export type LessonContent = {
  sections: LessonSection[];
  exercises: LessonExercise[];
  /** Language code (e.g. "pt") for which prompt_native/scenario_native are provided. Used for A1/A2. */
  nativeLanguage?: string;
};

export type LessonDetail = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  language: string;
  sortOrder: number;
  content: LessonContent | null;
  progress?: LessonDetailProgress;
};

export type DailyLimitResponse = {
  used: number;
  limit: number;
  canStartNew: boolean;
};

export type LessonCompletionResult = {
  exerciseIndex: number;
  type: string;
  correct: boolean;
  score?: number;
  userAnswer?: string | string[];
  correctAnswer?: string | string[];
  feedback?: string;
};

export const nativeLessonsApi = {
  getLessons: (language: string, level: string) =>
    httpClient
      .get('native-lessons', { searchParams: { language, level } })
      .json<{ lessons: LessonListItem[] }>(),

  getLesson: (id: string) =>
    httpClient.get(`native-lessons/${id}`).json<LessonDetail>(),

  getDailyLimit: () =>
    httpClient.get('native-lessons/daily-limit').json<DailyLimitResponse>(),

  startLesson: (id: string) =>
    httpClient
      .post(`native-lessons/${id}/start`)
      .json<{ status: string; startedAt: string | null }>(),

  completeLesson: (id: string, results: LessonCompletionResult[]) =>
    httpClient
      .post(`native-lessons/${id}/complete`, { json: { results } })
      .json<{ status: string; score: number; completedAt: string | null }>(),

  saveProgress: (id: string, results: LessonCompletionResult[]) =>
    httpClient
      .patch(`native-lessons/${id}/progress`, { json: { results } })
      .json<{ status: string }>(),

  redoLesson: (id: string) =>
    httpClient.post(`native-lessons/${id}/redo`).json<{ status: string }>(),
};
