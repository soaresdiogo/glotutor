export type StudentPodcastProgressEntity = {
  id: string;
  userId: string;
  podcastId: string;
  listenedPercentage: number;
  completedAt: Date | null;
  exerciseScore: number | null;
  totalQuestions: number | null;
  exerciseCompletedAt: Date | null;
  exerciseAnswers: Array<{ questionNumber: number; answer: string }> | null;
  exerciseFeedback: {
    perQuestion?: Array<{
      questionNumber: number;
      correct: boolean;
      explanation: string;
      studentAnswer?: string;
      correctAnswer?: string;
    }>;
    overallFeedback?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};
