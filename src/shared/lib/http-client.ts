import ky, { type KyInstance } from 'ky';

const getBaseUrl = () => {
  if (globalThis.window !== undefined) {
    return process.env.NEXT_PUBLIC_API_URI ?? '/api';
  }
  return process.env.NEXT_PUBLIC_API_URI ?? 'http://localhost:3000/api';
};

export function createHttpClient(): KyInstance {
  return ky.create({
    prefixUrl: getBaseUrl(),
    timeout: 30000,
    retry: {
      limit: 2,
      statusCodes: [408, 429, 502, 503, 504],
      methods: ['get'],
    },
    credentials: 'include',
  });
}

export const httpClient = createHttpClient();
