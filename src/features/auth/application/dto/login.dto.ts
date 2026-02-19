import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Email is required' })
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.email({ error: 'Invalid email address' })),
  password: z.string().min(1, { error: 'Password is required' }),
});

export type LoginDto = z.infer<typeof LoginSchema>;
