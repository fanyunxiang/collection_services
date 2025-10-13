export interface RegisterPayload {
  username: string;
  password: string;
  role?: string;
  email?: string;
}

export interface LoginPayload {
  password: string;
  username?: string;
  email?: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  role?: string;
  username?: string;
}

export interface LoginResult {
  user: unknown;
  session: unknown;
}

const SUPABASE_DISABLED_MESSAGE =
  "Supabase integration is disabled for the local-only demo build.";

export async function registerUser(
  _payload: RegisterPayload,
): Promise<RegisterResult> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function loginUser(
  _payload: LoginPayload,
): Promise<LoginResult> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}
