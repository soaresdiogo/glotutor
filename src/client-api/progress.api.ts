import type {
  CompletedListeningDto,
  CompletedNativeLessonDto,
  CompletedReadingDto,
  CompletedSpeakingDto,
  ProgressResponseDto,
} from '@/features/progress/application/dto/progress-response.dto';
import { httpClient } from '@/shared/lib/http-client';

/** Re-export API response types from feature DTO (single source of truth) */
export type ProgressOverview = ProgressResponseDto['overview'];
export type InProgressLesson = NonNullable<
  ProgressResponseDto['inProgressLesson']
>;
export type CompletedNativeLesson = CompletedNativeLessonDto;
export type CompletedListening = CompletedListeningDto;
export type CompletedReading = CompletedReadingDto;
export type CompletedSpeaking = CompletedSpeakingDto;
export type ProgressResponse = ProgressResponseDto;

export const progressApi = {
  get: (language?: string) =>
    httpClient
      .get('progress', language ? { searchParams: { language } } : undefined)
      .json<ProgressResponse>(),
};
