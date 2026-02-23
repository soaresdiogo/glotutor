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

export const SubscribeInterval = z.enum(['month', 'annual']);
export type SubscribeIntervalType = z.infer<typeof SubscribeInterval>;

export const CreateCheckoutSessionSchema = z
  .object({
    /** Plan type (product.type), e.g. "pro". From URL: ?plan=pro */
    planType: z.string().min(1, 'Plan type is required').optional(),
    /** Currency code from URL: ?currency=EUR. When set with planType+interval, resolves exact price. */
    currency: z.string().min(1).max(5).optional(),
    /** Billing interval from URL: ?interval=month | annual */
    interval: SubscribeInterval.optional(),
    /** Specific price ID (prices.id). When set, checkout uses this price. */
    priceId: z.string().uuid().optional(),
    email: z
      .string()
      .min(1, 'Email is required')
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.email('Invalid email address')),
    fullName: z.string().min(1, 'Full name is required').max(255),
    accountId: z.string().uuid().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    acceptPrivacy: z.boolean().optional(),
    acceptTerms: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const isNewSignup = data.password != null && data.password.length > 0;
      if (isNewSignup) return data.acceptPrivacy === true;
      return true;
    },
    {
      message: 'You must accept the Privacy Policy to create an account.',
      path: ['acceptPrivacy'],
    },
  )
  .refine(
    (data) => {
      const isNewSignup = data.password != null && data.password.length > 0;
      if (isNewSignup) return data.acceptTerms === true;
      return true;
    },
    {
      message: 'You must accept the Terms of Use to create an account.',
      path: ['acceptTerms'],
    },
  )
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
  .refine(
    (data) =>
      data.priceId != null ||
      (data.planType != null && data.planType.length > 0),
    { message: 'Either planType or priceId is required', path: ['planType'] },
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
