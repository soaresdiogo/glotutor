import { NextResponse } from 'next/server';

import type { LastSessionResult } from '@/features/reading/domain/repositories/reading-session-repository.interface';

export const GetLastSessionPresenter = {
  success(session: LastSessionResult | null) {
    return NextResponse.json({ session });
  },
};
