import { NextResponse } from 'next/server';

export const SpeakingTokenPresenter = {
  success(data: { clientSecret: string; durationSeconds: number }) {
    return NextResponse.json({
      clientSecret: data.clientSecret,
      durationSeconds: data.durationSeconds,
    });
  },
};
