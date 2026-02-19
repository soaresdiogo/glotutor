import type { CompletedListeningEntity } from './completed-listening.entity';
import type { CompletedNativeLessonEntity } from './completed-native-lesson.entity';
import type { CompletedReadingEntity } from './completed-reading.entity';
import type { CompletedSpeakingEntity } from './completed-speaking.entity';
import type { InProgressLessonEntity } from './in-progress-lesson.entity';
import type { ProgressOverviewEntity } from './progress-overview.entity';

export type ProgressResultEntity = {
  overview: ProgressOverviewEntity;
  inProgressLesson: InProgressLessonEntity | null;
  completedNativeLessons: CompletedNativeLessonEntity[];
  completedListening: CompletedListeningEntity[];
  completedReading: CompletedReadingEntity[];
  completedSpeaking: CompletedSpeakingEntity[];
};
