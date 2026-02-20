import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
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

export const CreateCheckoutSessionSchema = z
  .object({
    planType: z.string().min(1, 'Plan type is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.email('Invalid email address')),
    fullName: z.string().min(1, 'Full name is required').max(255),
    accountId: z.string().uuid().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password != null || data.confirmPassword != null) {
        return (
          data.password != null &&
          data.confirmPassword != null &&
          data.password === data.confirmPassword
        );
      }
      return true;
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )
  .superRefine((data, ctx) => {
    if (data.password != null && data.password.length > 0) {
      const result = strongPassword.safeParse(data.password);
      if (!result.success && result.error.issues[0]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0].message,
          path: ['password'],
        });
      }
    }
  });

export type CreateCheckoutSessionDto = z.infer<
  typeof CreateCheckoutSessionSchema
>;
