import { z } from 'zod';

/** Podcast prompts generate up to 10 exercises; allow up to 20 for safety. */
const MAX_QUESTION_NUMBER = 20;

export const submitExercisesSchema = z.object({
  answers: z.array(
    z.object({
      questionNumber: z.number().int().min(1).max(MAX_QUESTION_NUMBER),
      answer: z.string(),
    }),
  ),
});

export type SubmitExercisesDto = z.infer<typeof submitExercisesSchema>;
