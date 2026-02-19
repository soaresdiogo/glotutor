import { z } from 'zod';

export const ListSpeakingTopicsSchema = z.object({
  level: z.string().min(1).max(5).optional(),
  language: z.string().min(1).max(10).optional(),
});

export type ListSpeakingTopicsDto = z.infer<typeof ListSpeakingTopicsSchema>;
