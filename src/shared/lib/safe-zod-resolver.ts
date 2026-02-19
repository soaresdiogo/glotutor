import type { FieldErrors, Resolver, ResolverResult } from 'react-hook-form';

/**
 * A Zod resolver that uses safeParse and never throws.
 * Use this when validation can run often (e.g. onChange) and you want to avoid
 * ZodError being thrown and surfacing in error overlays.
 */
export function safeZodResolver<
  TFormValues extends Record<string, unknown>,
>(schema: {
  safeParse: (data: unknown) =>
    | { success: true; data: TFormValues }
    | {
        success: false;
        error: {
          issues: Array<{ path: unknown[]; message: string; code?: string }>;
        };
      };
}): Resolver<TFormValues> {
  return async (values): Promise<ResolverResult<TFormValues>> => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors = {} as FieldErrors<TFormValues>;
    for (const issue of result.error.issues) {
      const pathSegments = Array.isArray(issue.path) ? issue.path : [];
      const path = pathSegments.filter((p) => typeof p === 'string').join('.');
      if (!path) continue;
      if (!(path in errors)) {
        (errors as Record<string, { type: string; message: string }>)[path] = {
          type: issue.code ?? 'invalid',
          message: issue.message ?? 'Invalid',
        };
      }
    }
    return { values: {}, errors } as ResolverResult<TFormValues>;
  };
}
