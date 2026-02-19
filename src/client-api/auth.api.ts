import { httpClient } from '@/shared/lib/http-client';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { sessionId: string; requiresMfa: true };
export type VerifyMfaPayload = {
  sessionId: string;
  mfaCode: string;
};
export type AuthSuccessResponse = { accessToken: string };
export type CurrentUserResponse = { id: string; name: string; email: string };
export type RequestPasswordResetPayload = { email: string };
export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};
export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const authApi = {
  login: (payload: LoginPayload) =>
    httpClient.post('auth/login', { json: payload }).json<LoginResponse>(),

  verifyMfa: (payload: VerifyMfaPayload) =>
    httpClient
      .post('auth/verify-mfa', { json: payload })
      .json<AuthSuccessResponse>(),

  refresh: () => httpClient.post('auth/refresh').json<AuthSuccessResponse>(),

  me: () => httpClient.get('auth/me').json<CurrentUserResponse>(),

  logout: () => httpClient.post('auth/logout'),

  requestPasswordReset: (payload: RequestPasswordResetPayload) =>
    httpClient.post('auth/request-password-reset', { json: payload }),

  resetPassword: (payload: ResetPasswordPayload) =>
    httpClient.post('auth/reset-password', { json: payload }),

  changePassword: (payload: ChangePasswordPayload) =>
    httpClient.post('auth/change-password', { json: payload }),

  register: (payload: RegisterPayload) =>
    httpClient
      .post('auth/register', { json: payload })
      .json<{ message: string; userId: string; email: string }>(),
};
