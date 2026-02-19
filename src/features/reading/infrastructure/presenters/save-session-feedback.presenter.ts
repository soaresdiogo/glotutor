import { NextResponse } from 'next/server';

export const SaveSessionFeedbackPresenter = {
  success() {
    return NextResponse.json({ ok: true });
  },
};
