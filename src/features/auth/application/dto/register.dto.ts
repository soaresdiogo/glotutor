import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, { error: 'Password must be at least 8 characters' })
  .refine((p) => /[A-Z]/.test(p), {
    message: 'Include at least one uppercase letter',
  })
  .refine((p) => /[a-z]/.test(p), {
    message: 'Include at least one lowercase letter',
  })
  .refine((p) => /\d/.test(p), {
    message: 'Include at least one number',
  })
  .refine((p) => /[^A-Za-z0-9]/.test(p), {
    message: 'Include at least one special character (e.g. !@#$%)',
  });

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, { error: 'Name is required' })
      .max(255, { error: 'Name must be 255 characters or less' }),
    email: z
      .string()
      .min(1, { error: 'Email is required' })
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.email({ error: 'Invalid email address' })),
    password: strongPassword,
    confirmPassword: z
      .string()
      .min(1, { error: 'Please confirm your password' }),
    acceptPrivacy: z.literal(true, {
      message: 'You must accept the Privacy Policy to create an account.',
    }),
    acceptTerms: z.literal(true, {
      message: 'You must accept the Terms of Use to create an account.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterDto = z.infer<typeof RegisterSchema>;
