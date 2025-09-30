import {
  createUser,
  findUserByEmail,
} from '@/backend/data/localDatabase';

export class UserAlreadyExistsError extends Error {
  constructor(message = 'A user with this email already exists.') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

export interface RegisterUserParams {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}

export interface RegisteredUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: Record<string, unknown>;
}

export async function registerUser({
  email,
  password,
  metadata,
}: RegisterUserParams): Promise<RegisteredUser> {
  if (findUserByEmail(email)) {
    throw new UserAlreadyExistsError();
  }

  const user = createUser({ email, password, metadata });

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    user_metadata: user.metadata,
  };
}
