import {
  buildAnswersByLevel,
  getAdaptiveDecision,
} from '@/features/placement-test/application/services/adaptive-placement.service';
import { CEFR_LEVEL_ORDER } from '@/features/placement-test/domain/constants/cefr-levels';
import type { PlacementAttemptEntity } from '@/features/placement-test/domain/entities/placement-attempt.entity';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';
import type { IPlacementAnswerRepository } from '@/features/placement-test/domain/repositories/placement-answer.repository.interface';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import type { IPlacementQuestionRepository } from '@/features/placement-test/domain/repositories/placement-question.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'it', 'fr', 'de'] as const;

export interface IStartPlacementTestUseCase {
  execute(
    userId: string,
    language: string,
  ): Promise<{
    attempt: PlacementAttemptEntity;
    question: PlacementQuestionEntity;
  }>;
}

export class StartPlacementTestUseCase implements IStartPlacementTestUseCase {
  constructor(
    private readonly attemptRepo: IPlacementAttemptRepository,
    private readonly questionRepo: IPlacementQuestionRepository,
    private readonly answerRepo: IPlacementAnswerRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
  ): Promise<{
    attempt: PlacementAttemptEntity;
    question: PlacementQuestionEntity;
  }> {
    const lang = language.toLowerCase();
    if (
      !SUPPORTED_LANGUAGES.includes(
        lang as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      throw new BadRequestError(
        'Unsupported language for placement test.',
        'placementTest.unsupportedLanguage',
      );
    }

    const inProgress = await this.attemptRepo.findInProgressByUserAndLanguage(
      userId,
      lang,
    );
    if (inProgress) {
      const answers = await this.answerRepo.findByAttemptId(inProgress.id);
      if (answers.length === 0) {
        const questions = await this.questionRepo.findRandomByLanguageAndLevel(
          lang,
          CEFR_LEVEL_ORDER[0],
          1,
          [],
        );
        if (questions.length === 0) {
          throw new BadRequestError(
            'No placement questions available for this language and level.',
            'placementTest.noQuestions',
          );
        }
        return { attempt: inProgress, question: questions[0] };
      }
      const answersByLevel = buildAnswersByLevel(
        answers.map((a) => ({
          cefrLevel: a.cefrLevel,
          isCorrect: a.isCorrect,
        })),
      );
      const totalAnswered = answers.length;
      const currentLevel = answers.at(-1)?.cefrLevel ?? 'A1';
      const decision = getAdaptiveDecision(
        answersByLevel,
        currentLevel,
        totalAnswered,
      );
      if (decision.done) {
        await this.attemptRepo.update(inProgress.id, {
          status: 'completed',
          recommendedLevel: decision.recommendedLevel,
          selectedLevel: decision.recommendedLevel,
          totalQuestions: totalAnswered,
          completedAt: new Date(),
        });
        throw new BadRequestError(
          'Placement test was already completed. Start a new test after refreshing.',
          'placementTest.alreadyInProgress',
        );
      }
      const excludeIds = answers.map((a) => a.questionId);
      const nextQuestions =
        await this.questionRepo.findRandomByLanguageAndLevel(
          lang,
          decision.nextLevel,
          1,
          excludeIds,
        );
      if (nextQuestions.length === 0) {
        await this.attemptRepo.update(inProgress.id, {
          status: 'completed',
          recommendedLevel: decision.nextLevel,
          selectedLevel: decision.nextLevel,
          totalQuestions: totalAnswered,
          completedAt: new Date(),
        });
        throw new BadRequestError(
          'No placement questions available for this language and level.',
          'placementTest.noQuestions',
        );
      }
      return { attempt: inProgress, question: nextQuestions[0] };
    }

    const level = CEFR_LEVEL_ORDER[0];
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/585dfbd9-11ed-4a7b-8723-960821f4c7ae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'eff39f',
      },
      body: JSON.stringify({
        sessionId: 'eff39f',
        location: 'start-placement-test.use-case.ts:beforeQuery',
        message: 'before findRandomByLanguageAndLevel',
        data: { userId, lang, level },
        timestamp: Date.now(),
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    const questions = await this.questionRepo.findRandomByLanguageAndLevel(
      lang,
      level,
      1,
    );
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/585dfbd9-11ed-4a7b-8723-960821f4c7ae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'eff39f',
      },
      body: JSON.stringify({
        sessionId: 'eff39f',
        location: 'start-placement-test.use-case.ts:afterQuery',
        message: 'after findRandomByLanguageAndLevel',
        data: { questionsLength: questions.length },
        timestamp: Date.now(),
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    if (questions.length === 0) {
      throw new BadRequestError(
        'No placement questions available for this language and level.',
        'placementTest.noQuestions',
      );
    }

    const attempt = await this.attemptRepo.create({
      userId,
      language: lang,
      totalQuestions: 1,
    });

    return { attempt, question: questions[0] };
  }
}
