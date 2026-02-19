import { z } from 'zod';

export const SubmitExerciseAttemptSchema = z.object({
  sessionId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string(), z.string()),
  ]),
});

export type SubmitExerciseAttemptDto = z.infer<
  typeof SubmitExerciseAttemptSchema
>;
