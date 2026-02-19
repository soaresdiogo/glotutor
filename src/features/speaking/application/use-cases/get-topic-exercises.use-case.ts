import type { SpeakingExerciseEntity } from '@/features/speaking/domain/entities/speaking-exercise.entity';
import type { ISpeakingExerciseRepository } from '@/features/speaking/domain/repositories/speaking-exercise-repository.interface';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetTopicExercisesUseCase {
  execute(userId: string, topicId: string): Promise<SpeakingExerciseEntity[]>;
}

export class GetTopicExercisesUseCase implements IGetTopicExercisesUseCase {
  constructor(
    private readonly topicRepo: ISpeakingTopicRepository,
    private readonly exerciseRepo: ISpeakingExerciseRepository,
  ) {}

  async execute(
    _userId: string,
    topicId: string,
  ): Promise<SpeakingExerciseEntity[]> {
    const topic = await this.topicRepo.findById(topicId);
    if (!topic) {
      throw new NotFoundError(
        'Speaking topic not found.',
        'speaking.topicNotFound',
      );
    }
    return this.exerciseRepo.findManyByTopicId(topicId);
  }
}
