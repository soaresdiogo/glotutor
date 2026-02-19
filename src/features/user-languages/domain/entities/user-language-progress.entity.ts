export type UserLanguageProgressEntity = {
  id: string;
  userId: string;
  language: string;
  currentLevel: string;
  placementTestId: string | null;
  isActive: boolean;
  startedAt: Date;
  updatedAt: Date;
};
