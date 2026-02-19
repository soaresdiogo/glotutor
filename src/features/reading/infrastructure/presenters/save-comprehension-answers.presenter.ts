import { NextResponse } from 'next/server';

export const SaveComprehensionAnswersPresenter = {
  success() {
    return NextResponse.json({ ok: true });
  },
};
