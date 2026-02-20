const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Invalid or expired. Please try again.',
  403: "You don't have permission to do this.",
  404: 'This link or resource is no longer valid.',
  500: 'Something went wrong. Please try again in a moment.',
};

function isGenericServerError(status: number, message: string): boolean {
  return (
    status === 500 &&
    /internal server error|something went wrong/i.test(message)
  );
}

function getMessageFromNonResponse(
  err: unknown,
  byStatus: Partial<Record<number, string>>,
): string {
  const msg = err instanceof Error ? err.message : String(err);
  const isTechnical = /status code|Internal Server Error|Failed to fetch/i.test(
    msg,
  );
  const defaultServer = byStatus[500] ?? DEFAULT_MESSAGES[500];
  if (isTechnical || msg.length >= 200) return defaultServer;
  return msg || defaultServer;
}

/**
 * Returns a user-friendly message from an API error. Prefers the API response
 * body `message` when present; otherwise uses fallbacks by status code so users
 * never see raw "Request failed with status code 500" or technical details.
 */
export async function getApiErrorMessage(
  err: unknown,
  fallbacks: Partial<Record<number, string>> = {},
): Promise<string> {
  const byStatus = { ...DEFAULT_MESSAGES, ...fallbacks };
  const res = (err as { response?: Response })?.response;

  if (res) {
    try {
      const data = (await res.json()) as { message?: string };
      const apiMessage = typeof data?.message === 'string' ? data.message : '';
      if (apiMessage && !isGenericServerError(res.status, apiMessage))
        return apiMessage;
    } catch {
      // response wasn't JSON or already consumed
    }
    const statusMsg = byStatus[res.status];
    if (statusMsg) return statusMsg;
  }

  return getMessageFromNonResponse(err, byStatus);
}
