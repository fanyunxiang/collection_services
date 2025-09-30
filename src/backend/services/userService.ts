import { AuthError, AuthResponse } from '@supabase/supabase-js'

import {
  DEFAULT_EMAIL_DOMAIN,
  supabaseAdminClient,
  supabaseServerClient,
} from '@/backend/lib/supabaseClient'

export interface RegisterPayload {
  username: string
  password: string
  role?: string
  email?: string
}

export interface LoginPayload {
  password: string
  username?: string
  email?: string
}

export interface RegisterResult {
  id: string
  email: string
  role?: string
  username?: string
}

export interface LoginResult {
  user: AuthResponse['data']['user']
  session: AuthResponse['data']['session']
}

const normalizeEmail = (usernameOrEmail: string) => {
  if (usernameOrEmail.includes('@')) {
    return usernameOrEmail
  }
  return `${usernameOrEmail}@${DEFAULT_EMAIL_DOMAIN}`
}

export async function registerUser({
  username,
  password,
  role = 'user',
  email,
}: RegisterPayload): Promise<RegisterResult> {
  if (!username) {
    throw new Error('Username is required.')
  }

  if (!password) {
    throw new Error('Password is required.')
  }

  const normalizedEmail = normalizeEmail(email ?? username)

  const { data, error } = await supabaseAdminClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      role,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Failed to create user.')
  }

  return {
    id: data.user.id,
    email: data.user.email ?? normalizedEmail,
    role: (data.user.user_metadata as { role?: string } | null)?.role ?? role,
    username: (data.user.user_metadata as { username?: string } | null)?.username ?? username,
  }
}

export async function loginUser({
  username,
  email,
  password,
}: LoginPayload): Promise<LoginResult> {
  if (!password) {
    throw new Error('Password is required.')
  }

  const identifier = username ?? email

  if (!identifier) {
    throw new Error('Please provide a username or email address.')
  }

  const normalizedEmail = normalizeEmail(identifier)

  const { data, error } = await supabaseServerClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (error) {
    if (error instanceof AuthError) {
      throw new Error(error.message)
    }
    throw new Error('Login failed.')
  }

  return {
    user: data.user,
    session: data.session,
  }
}
