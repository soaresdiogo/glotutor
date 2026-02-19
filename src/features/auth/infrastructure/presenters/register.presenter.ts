import { NextResponse } from 'next/server';

export const RegisterPresenter = {
  success(userId: string, email: string) {
    return NextResponse.json(
      { message: 'Account created successfully.', userId, email },
      { status: 201 },
    );
  },
};
