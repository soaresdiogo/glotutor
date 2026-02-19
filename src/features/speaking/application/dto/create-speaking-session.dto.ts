import { z } from 'zod';

export const CreateSpeakingSessionSchema = z.object({
  topicId: z.string().uuid(),
});

export type CreateSpeakingSessionDto = z.infer<
  typeof CreateSpeakingSessionSchema
>;
