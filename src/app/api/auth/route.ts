import { NextResponse } from 'next/server'

import { loginUser, registerUser } from '@/backend/services/userService'

interface AuthRequestBody {
  action?: 'login' | 'register'
  username?: string
  password?: string
  email?: string
  role?: string
  remember?: boolean
}

const ERROR_MESSAGES = {
  missingAction: 'Please provide a valid action: login or register.',
  missingCredentials: 'Please provide a username or email along with a password.',
  missingRegisterFields: 'Username and password are required.',
  unexpected: 'An unexpected error occurred while processing the auth request.',
} as const

export async function POST(request: Request) {
  try {
    const body: AuthRequestBody | null = await request.json()

    if (!body?.action) {
      return NextResponse.json(
        { message: ERROR_MESSAGES.missingAction },
        { status: 400 },
      )
    }

    if (body.action === 'register') {
      const { username, password, role, email } = body

      if (!username || !password) {
        return NextResponse.json(
          { message: ERROR_MESSAGES.missingRegisterFields },
          { status: 400 },
        )
      }

      const result = await registerUser({ username, password, role, email })

      return NextResponse.json(
        { message: 'Account created successfully.', data: result },
        { status: 201 },
      )
    }

    const { username, email, password, remember } = body

    if (!password || (!username && !email)) {
      return NextResponse.json(
        { message: ERROR_MESSAGES.missingCredentials },
        { status: 400 },
      )
    }

    const result = await loginUser({ username, email, password })

    const response = NextResponse.json(
      { message: 'Login successful', data: result },
      { status: 200 },
    )

    const session = result.session

    if (session?.access_token && session.refresh_token) {
      const maxAgeFromSession = session.expires_in ? session.expires_in : 60 * 60
      const maxAge = remember ? 60 * 60 * 24 * 7 : maxAgeFromSession
      const secure = process.env.NODE_ENV === 'production'

      response.cookies.set('sb-access-token', session.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge,
      })

      response.cookies.set('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.unexpected

    return NextResponse.json({ message }, { status: 500 })
  }
}
