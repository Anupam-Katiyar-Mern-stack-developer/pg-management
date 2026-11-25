// src/services/superAdmin.service.ts
import bcrypt from 'bcryptjs';
import
pool from '../config/db';
import { AppError } from '../utils/AppError';
import type { AdminPermissions } from '../types/auth.types';

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  permissions?: Partial<AdminPermissions>;
}

export const createAdmin = async (input: CreateAdminInput) => {
  const { name, email, password, permissions } = input;

  const existing = await pool.query(
    `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
    [email.trim()]
  );

  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const allowedPgCount = permissions?.allowed_pg_count ?? 1;
  const canUseInvoicing = permissions?.can_use_invoicing ?? false;
  const canUseTicketing = permissions?.can_use_ticketing ?? false;
  const canUseOnlinePayment = permissions?.can_use_online_payment ?? false;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'ADMIN', true)
       RETURNING id, name, email, role, is_active, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const newAdmin = userRes.rows[0];

    const permRes = await client.query<AdminPermissions>(
      `INSERT INTO admin_permissions
         (admin_id, allowed_pg_count, can_use_invoicing, can_use_ticketing, can_use_online_payment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING allowed_pg_count, can_use_invoicing, can_use_ticketing, can_use_online_payment`,
      [
        newAdmin.id,
        allowedPgCount,
        canUseInvoicing,
        canUseTicketing,
        canUseOnlinePayment,
      ]
    );

    await client.query('COMMIT');

    return {
      ...newAdmin,
      permissions: permRes.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const listAdmins = async () => {
  const result = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.is_active,
       u.created_at,
       p.allowed_pg_count,
       p.can_use_invoicing,
       p.can_use_ticketing,
       p.can_use_online_payment
     FROM users u
     LEFT JOIN admin_permissions p ON u.id = p.admin_id
     WHERE u.role = 'ADMIN'
     ORDER BY u.created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    is_active: row.is_active,
    created_at: row.created_at,
    permissions: {
      allowed_pg_count: row.allowed_pg_count ?? 1,
      can_use_invoicing: row.can_use_invoicing ?? false,
      can_use_ticketing: row.can_use_ticketing ?? false,
      can_use_online_payment: row.can_use_online_payment ?? false,
    },
  }));
};

export const updateAdminPermissions = async (
  adminId: string,
  perms: Partial<AdminPermissions>
) => {
  const result = await pool.query<AdminPermissions>(
    `UPDATE admin_permissions
     SET
       allowed_pg_count = COALESCE($1, allowed_pg_count),
       can_use_invoicing = COALESCE($2, can_use_invoicing),
       can_use_ticketing = COALESCE($3, can_use_ticketing),
       can_use_online_payment = COALESCE($4, can_use_online_payment)
     WHERE admin_id = $5
     RETURNING allowed_pg_count, can_use_invoicing, can_use_ticketing, can_use_online_payment`,
    [
      perms.allowed_pg_count ?? null,
      perms.can_use_invoicing ?? null,
      perms.can_use_ticketing ?? null,
      perms.can_use_online_payment ?? null,
      adminId,
    ]
  );

  if (result.rows.length === 0) {
    throw new AppError('Admin permissions record not found', 404);
  }

  return result.rows[0];
};

export const toggleAdminStatus = async (adminId: string, isActive: boolean) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = $1
     WHERE id = $2 AND role = 'ADMIN'
     RETURNING id, name, email, is_active`,
    [isActive, adminId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Admin not found', 404);
  }

  return result.rows[0];
};


export const listPendingProperties = async () => {
  const result = await pool.query(
    `SELECT
       p.*,
       u.name AS admin_name,
       u.email AS admin_email
     FROM properties p
     JOIN users u ON p.admin_id = u.id
     WHERE p.is_approved = false
     ORDER BY p.created_at ASC`
  );
  return result.rows;
};

export const updatePropertyApproval = async (
  propertyId: string,
  isApproved: boolean
) => {
  const result = await pool.query(
    `UPDATE properties
     SET is_approved = $1
     WHERE id = $2
     RETURNING id, name, slug, city, locality, is_approved`,
    [isApproved, propertyId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Property not found', 404);
  }

  return result.rows[0];
};