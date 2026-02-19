export type CreateSpeakingSessionUsageDto = {
  sessionId: string;
  userId: string;
  totalTurns: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostUsd: number;
  durationSeconds: number;
};

export interface ISpeakingSessionUsageRepository {
  create(data: CreateSpeakingSessionUsageDto): Promise<void>;
}
