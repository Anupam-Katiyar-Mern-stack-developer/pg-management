// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool  from '../config/db';
import type {
  AdminPermissions,
  JwtPayload,
  PermissionKey,
  UserRole,
} from '../types/auth.types';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: Token missing' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient role access' });
      return;
    }
    next();
  };
};

export const requirePermission = (permission: PermissionKey) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Super Admin ko saare features ka access rahega
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    try {
      const result = await pool.query<AdminPermissions>(
        `SELECT allowed_pg_count, can_use_invoicing, can_use_ticketing, can_use_online_payment
         FROM admin_permissions
         WHERE admin_id = $1`,
        [req.user.id]
      );

      const perms = result.rows[0];

      if (!perms || !perms[permission]) {
        res.status(403).json({
          message: `Access denied: '${permission}' is not enabled for your account.`,
        });
        return;
      }

      req.permissions = perms;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};