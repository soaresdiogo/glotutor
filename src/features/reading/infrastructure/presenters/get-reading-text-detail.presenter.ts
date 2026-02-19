import { NextResponse } from 'next/server';

import type { ReadingTextDetailEntity } from '@/features/reading/domain/repositories/text-repository.interface';

export const GetReadingTextDetailPresenter = {
  success(detail: ReadingTextDetailEntity) {
    return NextResponse.json(detail);
  },
};
