import { z } from 'zod';

export const GetLastSessionSchema = z.object({
  textId: z.uuid(),
});

export type GetLastSessionDto = z.infer<typeof GetLastSessionSchema>;
