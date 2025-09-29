"use client";

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
}

export type StoredUser = {
  username: string;
  email?: string;
  password: string;
  role: "admin" | "user";
  createdAt: string;
};

export type CurrentUser = {
  username: string;
  email?: string;
  role: "admin" | "user";
  loggedInAt: string;
  remember: boolean;
};

const USERS_STORAGE_KEY = "collection-services.users";
const CURRENT_USER_STORAGE_KEY = "collection-services.current-user";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage value for key "${key}"`, error);
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeFromStorage(key: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}

function getStoredUsers(): StoredUser[] {
  return readFromStorage<StoredUser[]>(USERS_STORAGE_KEY, []);
}

function persistUsers(users: StoredUser[]): void {
  writeToStorage(USERS_STORAGE_KEY, users);
}

function normalizeUsername(username: string): string {
  return username.trim();
}

function normalizeEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const trimmed = email.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function determineRole(username: string): "admin" | "user" {
  return username.toLowerCase().includes("admin") ? "admin" : "user";
}

function findUserByIdentifier(
  users: StoredUser[],
  identifier: string,
): StoredUser | undefined {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  return users.find((user) => {
    const usernameMatches = user.username.toLowerCase() === normalizedIdentifier;
    const emailMatches =
      typeof user.email === "string" &&
      user.email.toLowerCase() === normalizedIdentifier;

    return usernameMatches || emailMatches;
  });
}

function setCurrentUser(user: CurrentUser): void {
  writeToStorage(CURRENT_USER_STORAGE_KEY, user);
}

export function getCurrentUser(): CurrentUser | null {
  return readFromStorage<CurrentUser | null>(CURRENT_USER_STORAGE_KEY, null);
}

export function logout(): void {
  removeFromStorage(CURRENT_USER_STORAGE_KEY);
}

export async function register({
  username,
  password,
  email,
}: RegisterRequest): Promise<AuthApiResponse<{ username: string; role: "admin" | "user"; email?: string }>> {
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  const users = getStoredUsers();

  const duplicateUser = users.find((user) => {
    const usernameMatches =
      user.username.toLowerCase() === normalizedUsername.toLowerCase();
    const emailMatches =
      normalizedEmail &&
      typeof user.email === "string" &&
      user.email.toLowerCase() === normalizedEmail;

    return usernameMatches || emailMatches;
  });

  if (duplicateUser) {
    throw new Error("An account with that username or email already exists.");
  }

  const role = determineRole(normalizedUsername);

  const newUser: StoredUser = {
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role,
    createdAt: new Date().toISOString(),
  };

  persistUsers([...users, newUser]);

  return {
    message:
      role === "admin"
        ? "Admin account created successfully."
        : "Account created successfully.",
    data: {
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
    },
  };
}

export async function login({
  identifier,
  password,
  remember = false,
}: LoginRequest): Promise<AuthApiResponse<CurrentUser>> {
  const users = getStoredUsers();
  const user = findUserByIdentifier(users, identifier);

  if (!user) {
    throw new Error("Account not found. Please register first.");
  }

  if (user.password !== password) {
    throw new Error("Incorrect password. Please try again.");
  }

  const currentUser: CurrentUser = {
    username: user.username,
    email: user.email,
    role: user.role,
    loggedInAt: new Date().toISOString(),
    remember: Boolean(remember),
  };

  setCurrentUser(currentUser);

  return {
    message:
      user.role === "admin"
        ? "Welcome back, admin."
        : "Signed in successfully.",
    data: currentUser,
  };
}

export { USERS_STORAGE_KEY, CURRENT_USER_STORAGE_KEY };
