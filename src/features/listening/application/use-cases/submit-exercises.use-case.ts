import type { PodcastExerciseEntity } from '@/features/listening/domain/entities/podcast-exercise.entity';
import type { IAIGateway } from '@/features/listening/domain/ports/ai-gateway.interface';
import type { IStudentProfileProvider } from '@/features/listening/domain/ports/student-profile-provider.interface';
import type { IPodcastRepository } from '@/features/listening/domain/repositories/podcast-repository.interface';
import type { IStudentPodcastProgressRepository } from '@/features/listening/domain/repositories/student-podcast-progress-repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

export type SubmitExercisesInput = {
  answers: Array<{ questionNumber: number; answer: string }>;
};

export type SubmitExercisesOutput = {
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

export interface ISubmitExercisesUseCase {
  execute(
    userId: string,
    podcastId: string,
    input: SubmitExercisesInput,
  ): Promise<SubmitExercisesOutput>;
}

const MIN_LISTEN_PERCENTAGE = 80;

function normalizeForCompare(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Normalize for sentence_order: collapse spaces and common delimiters (|, comma, etc.) to single space for comparison. */
function normalizeSentenceOrder(s: string): string {
  return normalizeForCompare(s)
    .replace(/\s*\|\s*/g, ' ')
    .replace(/\s*,\s*/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Build expected answer string from options when correctAnswer is indices (e.g. "1,3,2,4") or JSON array. */
function resolveSentenceOrderCorrect(
  options: string[] | null,
  correctAnswer: string,
): string {
  if (!options?.length) return correctAnswer;
  const raw = correctAnswer.trim();
  // Indices 1-based: "1,3,2,4" or "1, 3, 2, 4"
  const indexMatch = raw.match(/^\d[\d,\s]*$/);
  if (indexMatch) {
    const indices = raw.split(/[\s,]+/).map((n) => parseInt(n, 10) - 1);
    return indices
      .filter((i) => i >= 0 && i < options.length)
      .map((i) => options[i])
      .join(' ');
  }
  // JSON array of strings
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string').join(' ');
    }
  } catch {
    // not JSON
  }
  return raw;
}

function scoreAnswer(
  exercise: PodcastExerciseEntity,
  studentAnswer: string,
): boolean {
  const normalized = normalizeForCompare(studentAnswer);
  const correct = normalizeForCompare(exercise.correctAnswer);
  if (exercise.type === 'sentence_order') {
    const expected = resolveSentenceOrderCorrect(
      exercise.options,
      exercise.correctAnswer,
    );
    const studentNorm = normalizeSentenceOrder(studentAnswer);
    const correctNorm = normalizeSentenceOrder(expected);
    return studentNorm === correctNorm;
  }
  return normalized === correct;
}

function getOverallFeedback(score: number, total: number): string {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 1) return 'excellent';
  if (pct >= 0.6) return 'good';
  return 'needsWork';
}

export class SubmitExercisesUseCase implements ISubmitExercisesUseCase {
  constructor(
    private readonly podcastRepo: IPodcastRepository,
    private readonly progressRepo: IStudentPodcastProgressRepository,
    private readonly aiGateway: IAIGateway,
    private readonly profileProvider: IStudentProfileProvider,
  ) {}

  async execute(
    userId: string,
    podcastId: string,
    input: SubmitExercisesInput,
  ): Promise<SubmitExercisesOutput> {
    const detail = await this.podcastRepo.findDetailById(podcastId, userId);
    if (!detail) {
      throw new NotFoundError(
        'Podcast not found.',
        'listening.api.podcastNotFound',
      );
    }
    const progress = detail.progress;
    if (progress?.exerciseCompletedAt) {
      throw new BadRequestError(
        'Exercises already completed for this podcast.',
        'listening.api.exercisesAlreadyCompleted',
      );
    }
    if ((progress?.listenedPercentage ?? 0) < MIN_LISTEN_PERCENTAGE) {
      throw new BadRequestError(
        'Listen to at least 80% of the audio before submitting.',
        'listening.api.listenMoreRequired',
      );
    }

    const exercises = detail.exercises;
    if (!exercises.length) {
      throw new BadRequestError(
        'Podcast has no exercises.',
        'listening.api.invalidExercises',
      );
    }

    const totalQuestions = exercises.length;
    if (!input.answers || input.answers.length !== totalQuestions) {
      throw new BadRequestError(
        `Exactly ${totalQuestions} answers are required.`,
        'listening.api.invalidAnswers',
      );
    }

    const profile = await this.profileProvider.getProfile(userId);
    const nativeLanguage = profile?.nativeLanguageCode ?? 'en';

    const byNumber = new Map(exercises.map((e) => [e.questionNumber, e]));
    const answersByNumber = new Map(
      input.answers.map((a) => [a.questionNumber, a.answer]),
    );
    const perQuestion: SubmitExercisesOutput['perQuestion'] = [];
    let score = 0;

    for (let i = 1; i <= totalQuestions; i++) {
      const ex = byNumber.get(i);
      const studentAnswer = answersByNumber.get(i) ?? '';
      if (!ex) {
        perQuestion.push({
          questionNumber: i,
          correct: false,
          explanation: '',
          studentAnswer,
          correctAnswer: '',
        });
        continue;
      }
      let correct: boolean;
      if (ex.type === 'open_ended') {
        const evalResult = await this.aiGateway.evaluateOpenEndedAnswer({
          questionText: ex.questionText,
          expectedAnswer: ex.correctAnswer,
          studentAnswer,
          targetLanguage: detail.languageCode,
          nativeLanguage,
          cefrLevel: detail.cefrLevel,
        });
        correct = evalResult.score === 1;
        perQuestion.push({
          questionNumber: i,
          correct,
          explanation: evalResult.feedback || ex.explanationText,
          studentAnswer,
          correctAnswer: ex.correctAnswer,
        });
      } else {
        correct = scoreAnswer(ex, studentAnswer);
        const displayCorrect =
          ex.type === 'sentence_order'
            ? resolveSentenceOrderCorrect(ex.options, ex.correctAnswer)
            : ex.correctAnswer;
        perQuestion.push({
          questionNumber: i,
          correct,
          explanation: ex.explanationText,
          studentAnswer,
          correctAnswer: displayCorrect,
        });
      }
      if (correct) score++;
    }

    const feedbackKey = getOverallFeedback(score, totalQuestions);
    const overallFeedback = feedbackKey;

    await this.progressRepo.updateExerciseResults(userId, podcastId, {
      exerciseScore: score,
      totalQuestions,
      exerciseAnswers: input.answers,
      exerciseFeedback: {
        perQuestion: perQuestion.map((q) => ({
          questionNumber: q.questionNumber,
          correct: q.correct,
          explanation: q.explanation,
          studentAnswer: q.studentAnswer,
          correctAnswer: q.correctAnswer,
        })),
        overallFeedback,
      },
    });

    return {
      score,
      totalQuestions,
      perQuestion,
      overallFeedback,
    };
  }
}
