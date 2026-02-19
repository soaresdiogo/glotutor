import type { PlacementQuestionDto } from '@/features/placement-test/application/dto/placement-question.dto';
import type {
  PlacementAnswerResponseDto,
  PlacementCompleteResponseDto,
  PlacementOverrideResponseDto,
  PlacementSkipResponseDto,
  PlacementStartResponseDto,
} from '@/features/placement-test/application/dto/placement-result.dto';
import type { AnswerPlacementResult } from '@/features/placement-test/application/use-cases/answer-placement-question.use-case';
import type { PlacementAttemptEntity } from '@/features/placement-test/domain/entities/placement-attempt.entity';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';

export const PlacementPresenter = {
  questionToDto(q: PlacementQuestionEntity): PlacementQuestionDto {
    return {
      id: q.id,
      language: q.language,
      cefrLevel: q.cefrLevel,
      questionType: q.questionType,
      questionText: q.questionText,
      audioUrl: q.audioUrl,
      options: q.options,
    };
  },

  toStartResponse(
    attempt: PlacementAttemptEntity,
    question: PlacementQuestionEntity,
  ): PlacementStartResponseDto {
    return {
      attemptId: attempt.id,
      language: attempt.language,
      totalQuestions: attempt.totalQuestions,
      question: this.questionToDto(question),
    };
  },

  toAnswerResponse(result: AnswerPlacementResult): PlacementAnswerResponseDto {
    if (result.kind === 'next') {
      return {
        kind: 'next',
        question: this.questionToDto(result.question),
        questionsAnswered: result.questionsAnswered,
      };
    }
    return {
      kind: 'result',
      recommendedLevel: result.recommendedLevel,
      questionsAnswered: result.questionsAnswered,
      attemptId: result.attemptId,
    };
  },

  toCompleteResponse(
    attemptId: string,
    recommendedLevel: string,
    selectedLevel: string,
  ): PlacementCompleteResponseDto {
    return {
      attemptId,
      recommendedLevel,
      selectedLevel,
    };
  },

  toSkipResponse(attempt: PlacementAttemptEntity): PlacementSkipResponseDto {
    return {
      attemptId: attempt.id,
      language: attempt.language,
      selectedLevel: attempt.selectedLevel,
    };
  },

  toOverrideResponse(
    attemptId: string,
    selectedLevel: string,
  ): PlacementOverrideResponseDto {
    return { attemptId, selectedLevel };
  },
};
