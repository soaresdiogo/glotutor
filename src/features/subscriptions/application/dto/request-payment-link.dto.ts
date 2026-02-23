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

export const RequestPaymentLinkSchema = z
  .object({
    planType: z.string().min(1, 'Plan type is required'),
    /** Language from landing/subscribe URL (?language=pt). Used for email and saved as user.locale after payment. */
    locale: z.string().min(1).max(10).optional(),
    /** From URL ?currency=EUR - optional, used to resolve exact price when opening checkout from link */
    currency: z.string().min(1).max(5).optional(),
    /** From URL ?interval=month | annual */
    interval: z.enum(['month', 'annual']).optional(),
    email: z
      .string()
      .min(1, 'Email is required')
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.email('Invalid email address')),
    fullName: z.string().min(1, 'Full name is required').max(255),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
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
  })
  .superRefine((data, ctx) => {
    const result = strongPassword.safeParse(data.password);
    if (!result.success && result.error.issues[0]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error.issues[0].message,
        path: ['password'],
      });
    }
  });

export type RequestPaymentLinkDto = z.infer<typeof RequestPaymentLinkSchema>;
