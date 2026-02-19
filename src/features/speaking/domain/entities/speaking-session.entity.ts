export type SpeakingFeedbackEntity = {
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

export type SpeakingSessionEntity = {
  id: string;
  userId: string;
  topicId: string;
  status: 'in_progress' | 'completed';
  durationSeconds: number;
  startedAt: Date;
  completedAt: Date | null;
  feedback: SpeakingFeedbackEntity | null;
  createdAt: Date;
};
