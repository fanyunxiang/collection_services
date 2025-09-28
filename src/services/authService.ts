const AUTH_ENDPOINT = "/api/auth";

export type AuthAction = "login" | "register";

export interface AuthApiResponse<T = unknown> {
  message: string;
  data?: T;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  role?: string;
}

async function authRequest<T>(
  action: AuthAction,
  payload: Record<string, unknown>,
): Promise<AuthApiResponse<T>> {
  const response = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  const result = (await response.json()) as AuthApiResponse<T>;

  if (!response.ok) {
    throw new Error(result.message || "Authentication request failed.");
  }

  return result;
}

export async function login({ identifier, password, remember }: LoginRequest) {
  const key = identifier.includes("@") ? "email" : "username";
  return authRequest("login", {
    [key]: identifier,
    password,
    remember,
  });
}

export async function register({
  username,
  password,
  email,
  role,
}: RegisterRequest) {
  return authRequest("register", {
    username,
    password,
    email,
    role,
  });
}
