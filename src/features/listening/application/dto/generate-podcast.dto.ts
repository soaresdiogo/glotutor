import { z } from 'zod';

export const generatePodcastSchema = z.object({
  targetLanguage: z.string().min(1),
  nativeLanguage: z.string().min(1),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  topic: z.string().min(1),
});

export type GeneratePodcastDto = z.infer<typeof generatePodcastSchema>;
