import { NextResponse } from 'next/server';

export const PasswordResetPresenter = {
  requestSuccess() {
    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive a password reset link.',
      },
      { status: 200 },
    );
  },

  resetSuccess() {
    return NextResponse.json(
      { message: 'Your password has been reset successfully.' },
      { status: 200 },
    );
  },
};
