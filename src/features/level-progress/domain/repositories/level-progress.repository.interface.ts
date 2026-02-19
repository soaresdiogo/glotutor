export type ActivityType = 'lesson' | 'podcast' | 'reading' | 'conversation';

export type LevelProgressRow = {
  id: string;
  userId: string;
  language: string;
  cefrLevel: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  podcastsTotal: number;
  podcastsCompleted: number;
  readingsTotal: number;
  readingsCompleted: number;
  conversationsTotal: number;
  conversationsCompleted: number;
  completionPercentage: string | null;
  certificationUnlocked: boolean;
  certifiedAt: Date | null;
};

export interface ILevelProgressRepository {
  findByUserLanguageLevel(
    userId: string,
    language: string,
    cefrLevel: string,
  ): Promise<LevelProgressRow | null>;

  create(data: {
    userId: string;
    language: string;
    cefrLevel: string;
    lessonsTotal: number;
    podcastsTotal: number;
    readingsTotal: number;
    conversationsTotal: number;
  }): Promise<LevelProgressRow>;

  incrementCompleted(
    id: string,
    activityType: ActivityType,
  ): Promise<LevelProgressRow>;

  updateCompletionAndCertification(
    id: string,
    completionPercentage: number,
    certificationUnlocked: boolean,
  ): Promise<LevelProgressRow>;
}
