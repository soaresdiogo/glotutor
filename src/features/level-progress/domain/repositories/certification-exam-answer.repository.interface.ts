export interface ICertificationExamAnswerRepository {
  create(data: {
    examId: string;
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }): Promise<{ id: string }>;

  countByExamId(examId: string): Promise<number>;

  getCorrectCountByExamId(examId: string): Promise<number>;

  findQuestionIdsByExamId(examId: string): Promise<string[]>;
}
