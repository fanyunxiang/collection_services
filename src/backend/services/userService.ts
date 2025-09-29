import type { User } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../lib/supabaseClient';

export class RegistrationDisabledError extends Error {
  constructor(message = 'User registration is disabled until SUPABASE_SERVICE_ROLE_KEY is configured.') {
    super(message);
    this.name = 'RegistrationDisabledError';
  }
}

export interface RegisterUserParams {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}

export async function registerUser({ email, password, metadata }: RegisterUserParams): Promise<User | null> {
  const supabaseAdmin = getSupabaseAdminClient();

  if (!supabaseAdmin) {
    throw new RegistrationDisabledError();
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    ...(metadata ? { user_metadata: metadata } : {}),
  });

  if (error) {
    throw new Error(`Failed to register user: ${error.message}`);
  }

  return data.user ?? null;
}
