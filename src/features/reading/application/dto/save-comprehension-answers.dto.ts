import { z } from 'zod';

const ComprehensionAnswerEntrySchema = z.object({
  answer: z.string(),
  correct: z.boolean(),
});

export const SaveComprehensionAnswersSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string(), ComprehensionAnswerEntrySchema),
});

export type SaveComprehensionAnswersDto = z.infer<
  typeof SaveComprehensionAnswersSchema
>;
