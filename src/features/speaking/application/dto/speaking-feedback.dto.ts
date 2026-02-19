import { z } from 'zod';

export const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const SubmitSpeakingFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  transcript: z.array(ConversationTurnSchema).min(1),
});

export type SubmitSpeakingFeedbackDto = z.infer<
  typeof SubmitSpeakingFeedbackSchema
>;
