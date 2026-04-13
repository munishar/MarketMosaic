import { query } from '@brokerflow/db';
import { hashPassword, comparePassword } from '../lib/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../lib/jwt';
import { AppError } from '../middleware/error-handler';
import { UserRole, User } from '@brokerflow/shared';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
}

interface AuthResult {
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const result = await query(
    'SELECT id, email, password_hash, first_name, last_name, role, team_id, region, is_active FROM users WHERE email = $1',
    [input.email]
  );

  if (result.rows.length === 0) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const user = result.rows[0] as {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    team_id: string | null;
    region: string | null;
    is_active: boolean;
  };

  if (!user.is_active) {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'Account is disabled');
  }

  const isValid = await comparePassword(input.password, user.password_hash);
  if (!isValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    team_id: user.team_id ?? undefined,
    region: user.region ?? undefined,
  };

  const access_token = signAccessToken(payload);
  const refresh_token = signRefreshToken(payload);

  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, refresh_token]
  );

  return {
    tokens: { access_token, refresh_token, expires_in: 900 },
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await query('SELECT id FROM users WHERE email = $1', [input.email]);
  if (existing.rows.length > 0) {
    throw new AppError(409, 'EMAIL_EXISTS', 'A user with this email already exists');
  }

  const password_hash = await hashPassword(input.password);
  const role = input.role ?? UserRole.servicer;

  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, team_id, region`,
    [input.email, password_hash, input.first_name, input.last_name, role]
  );

  const user = result.rows[0] as {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    team_id: string | null;
    region: string | null;
  };

  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    team_id: user.team_id ?? undefined,
    region: user.region ?? undefined,
  };

  const access_token = signAccessToken(payload);
  const refresh_token = signRefreshToken(payload);

  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, refresh_token]
  );

  return {
    tokens: { access_token, refresh_token, expires_in: 900 },
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  };
}

export async function refreshToken(token: string): Promise<AuthResult> {
  const payload = verifyRefreshToken(token);

  const result = await query(
    'SELECT id, user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  );

  if (result.rows.length === 0) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
  }

  const tokenRecord = result.rows[0] as { id: string; user_id: string };

  const userResult = await query(
    'SELECT id, email, first_name, last_name, role, team_id, region, is_active FROM users WHERE id = $1',
    [tokenRecord.user_id]
  );

  if (userResult.rows.length === 0 || !(userResult.rows[0] as { is_active: boolean }).is_active) {
    throw new AppError(401, 'INVALID_TOKEN', 'User not found or inactive');
  }

  const user = userResult.rows[0] as {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    team_id: string | null;
    region: string | null;
  };

  await query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.id]);

  const newPayload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    team_id: user.team_id ?? undefined,
    region: user.region ?? undefined,
  };

  const access_token = signAccessToken(newPayload);
  const refresh_token = signRefreshToken(newPayload);

  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, refresh_token]
  );

  return {
    tokens: { access_token, refresh_token, expires_in: 900 },
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  };
}

export async function logout(userId: string, token?: string): Promise<void> {
  if (token) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1 AND token = $2', [userId, token]);
  } else {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}

export async function getCurrentUser(userId: string): Promise<Omit<User, 'created_by' | 'updated_by'>> {
  const result = await query(
    'SELECT id, email, first_name, last_name, role, region, team_id, specialties, phone, is_active, avatar_url, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  return result.rows[0] as Omit<User, 'created_by' | 'updated_by'>;
}
