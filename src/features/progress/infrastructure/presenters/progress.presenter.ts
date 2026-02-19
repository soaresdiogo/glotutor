import type { ProgressResponseDto } from '@/features/progress/application/dto/progress-response.dto';
import type { ProgressResultEntity } from '@/features/progress/domain/entities/progress-result.entity';

export const ProgressPresenter = {
  toResponse(entity: ProgressResultEntity): ProgressResponseDto {
    return {
      overview: entity.overview,
      inProgressLesson: entity.inProgressLesson,
      nativeLessons: entity.completedNativeLessons,
      listening: entity.completedListening,
      reading: entity.completedReading,
      speaking: entity.completedSpeaking,
    };
  },
};
