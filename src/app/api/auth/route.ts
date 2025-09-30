import { NextResponse } from 'next/server';
import { registerUser, UserAlreadyExistsError } from '@/backend/services/userService';

export async function POST(request: Request) {
  try {
    const { email, password, metadata } = await request.json();

    const user = await registerUser({ email, password, metadata });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof UserAlreadyExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('Failed to register user', error);
    return NextResponse.json({ error: 'Failed to register user.' }, { status: 500 });
  }
}
