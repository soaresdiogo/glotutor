import { z } from 'zod';

export const CompleteSpeakingSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export type CompleteSpeakingSessionDto = z.infer<
  typeof CompleteSpeakingSessionSchema
>;
