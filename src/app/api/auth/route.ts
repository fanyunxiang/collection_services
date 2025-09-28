import { NextResponse } from 'next/server'

import { loginUser, registerUser } from '@/backend/services/userService'

interface AuthRequestBody {
  action?: 'login' | 'register'
  username?: string
  password?: string
  email?: string
  role?: string
}

const ERROR_MESSAGES = {
  missingAction: '请提供有效的操作类型：login 或 register',
  missingCredentials: '请提供用户名或邮箱以及密码',
  missingRegisterFields: '用户名和密码为必填项',
  unexpected: '处理认证请求时发生错误',
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
        { message: '注册成功', data: result },
        { status: 201 },
      )
    }

    const { username, email, password } = body

    if (!password || (!username && !email)) {
      return NextResponse.json(
        { message: ERROR_MESSAGES.missingCredentials },
        { status: 400 },
      )
    }

    const result = await loginUser({ username, email, password })

    return NextResponse.json(
      { message: '登录成功', data: result },
      { status: 200 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.unexpected

    return NextResponse.json({ message }, { status: 500 })
  }
}
