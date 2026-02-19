import { z } from 'zod';

export const EvaluateReadingSchema = z.object({
  textId: z.uuid(),
  audio: z.instanceof(Blob),
});

export type EvaluateReadingDto = z.infer<typeof EvaluateReadingSchema>;
