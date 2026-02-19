export class AppError extends Error {
  /** When set, API handler can translate this key for the response message. */
  public readonly messageKey?: string;

  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
    messageKey?: string,
  ) {
    super(message);
    this.name = 'AppError';
    this.messageKey = messageKey;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', messageKey?: string) {
    super(message, 401, 'UNAUTHORIZED', messageKey);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', messageKey?: string) {
    super(message, 404, 'NOT_FOUND', messageKey);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', messageKey?: string) {
    super(message, 400, 'BAD_REQUEST', messageKey);
    this.name = 'BadRequestError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', messageKey?: string) {
    super(message, 403, 'FORBIDDEN', messageKey);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitExceededError extends AppError {
  constructor(
    message: string = 'Too many requests. Try again later.',
    messageKey?: string,
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', messageKey);
    this.name = 'RateLimitExceededError';
  }
}

export class TenantNotFoundError extends AppError {
  constructor(
    message: string = 'No tenant configured for this domain.',
    messageKey?: string,
  ) {
    super(message, 503, 'TENANT_NOT_FOUND', messageKey);
    this.name = 'TenantNotFoundError';
  }
}
