import { z } from 'zod';

export const CompleteRegistrationSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  email: z
    .string()
    .optional()
    .transform((s) => (s ? s.trim().toLowerCase() : undefined)),
});

export type CompleteRegistrationDto = z.infer<
  typeof CompleteRegistrationSchema
>;
