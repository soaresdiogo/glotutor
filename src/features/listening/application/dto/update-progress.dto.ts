import { z } from 'zod';

export const updateProgressSchema = z.object({
  listenedPercentage: z
    .number()
    .min(0)
    .max(100)
    .transform((v) => Math.min(100, Math.max(0, Math.round(v)))),
});

export type UpdateProgressDto = z.infer<typeof updateProgressSchema>;
