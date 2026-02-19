import { z } from 'zod';

export const GetWordDetailsSchema = z.object({
  word: z.string().transform((s) => s.trim().toLowerCase()),
  textLanguageCode: z
    .string()
    .default('en')
    .transform((s) => s.split('-')[0] ?? 'en'),
});

export type GetWordDetailsDto = z.infer<typeof GetWordDetailsSchema>;
