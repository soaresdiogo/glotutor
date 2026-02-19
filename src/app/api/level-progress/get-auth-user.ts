import type { NextRequest } from 'next/server';

import { makeGetCurrentUserUseCase } from '@/features/auth/application/factories/get-current-user.factory';

export async function getLevelProgressAuthUser(req: NextRequest): Promise<{
  id: string;
  name: string;
  email: string;
} | null> {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) return null;
  try {
    const getCurrentUserUseCase = makeGetCurrentUserUseCase();
    return await getCurrentUserUseCase.execute(refreshToken);
  } catch {
    return null;
  }
}
