export type LevelProgressEntity = {
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
  completionPercentage: number;
  certificationUnlocked: boolean;
  certifiedAt: Date | null;
};
