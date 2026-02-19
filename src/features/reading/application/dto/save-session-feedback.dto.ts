import { z } from 'zod';

const FeedbackSchema = z.object({
  summary: z.string(),
  tips: z.array(z.string()),
  focusWords: z.array(z.string()),
  nextSteps: z.array(z.string()).optional(),
  speed: z.string().optional(),
  clarity: z.string().optional(),
  intonation: z.string().optional(),
});

const GrammarItemSchema = z.object({
  sentence: z.string(),
  structure: z.string(),
  explanation: z.string(),
  pattern: z.string(),
  level: z.string(),
});

export const SaveSessionFeedbackSchema = z.object({
  sessionId: z.uuid(),
  feedback: FeedbackSchema,
  grammarItems: z.array(GrammarItemSchema),
});

export type SaveSessionFeedbackDto = z.infer<typeof SaveSessionFeedbackSchema>;
