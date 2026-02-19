import { z } from 'zod';

export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RequestPasswordResetDto = z.infer<
  typeof RequestPasswordResetSchema
>;
