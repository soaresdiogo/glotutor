import { describe, expect, it, vi } from 'vitest';
import { type ZodError, z } from 'zod';
import { apiErrorHandler } from './api-error-handler';
import { BadRequestError, UnauthorizedError } from './errors';

describe('apiErrorHandler', () => {
  it('should return 400 with flattened messages for ZodError', async () => {
    const schema = z.object({ email: z.email(), age: z.number() });
    const result = schema.safeParse({ email: 'bad', age: 'not-a-number' });
    const error = result.error as ZodError;

    const res = apiErrorHandler(error);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBeDefined();
    expect(data.errors).toBeDefined();
  });

  it('should return statusCode and message for AppError', async () => {
    const res = apiErrorHandler(new BadRequestError('Invalid input.'));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe('Invalid input.');
  });

  it('should return 401 for UnauthorizedError', async () => {
    const res = apiErrorHandler(new UnauthorizedError('Not allowed.'));

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBe('Not allowed.');
  });

  it('should return 500 with translated message for unknown errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = apiErrorHandler(new Error('Unexpected'));

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe('Something went wrong. Please try again later.');
    consoleSpy.mockRestore();
  });
});
