// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  pool  from '../config/db';
import { AppError } from '../utils/AppError';
import type { AdminPermissions, UserRole } from '../types/auth.types';

interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
}

const getAdminPermissions = async (
  adminId: string
): Promise<AdminPermissions | undefined> => {
  const result = await pool.query<AdminPermissions>(
    `SELECT allowed_pg_count, can_use_invoicing, can_use_ticketing, can_use_online_payment
     FROM admin_permissions
     WHERE admin_id = $1`,
    [adminId]
  );
  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const userResult = await pool.query<DbUser>(
    `SELECT id, name, email, password_hash, role, is_active
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email.trim()]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account is deactivated. Contact Super Admin.', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const permissions =
    user.role === 'ADMIN' ? await getAdminPermissions(user.id) : undefined;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(permissions && { permissions }),
    },
  };
};

export const getUserProfile = async (userId: string) => {
  const userResult = await pool.query<Omit<DbUser, 'password_hash'>>(
    `SELECT id, name, email, role, is_active
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const permissions =
    user.role === 'ADMIN' ? await getAdminPermissions(user.id) : undefined;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(permissions && { permissions }),
  };
};