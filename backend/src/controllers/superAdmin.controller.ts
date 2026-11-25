// src/controllers/superAdmin.controller.ts
import { Request, Response } from 'express';
import * as superAdminService from '../services/superAdmin.service';
import { AppError } from '../utils/AppError';
import type { AdminPermissions } from '../types/auth.types';

const handleControllerError = (res: Response, error: unknown, label: string) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(`${label} error:`, error);
  res.status(500).json({ message: 'Internal server error' });
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, permissions } =
    req.body as Partial<superAdminService.CreateAdminInput>;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, email, and password are required' });
    return;
  }

  try {
    const admin = await superAdminService.createAdmin({
      name,
      email,
      password,
      permissions,
    });
    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    handleControllerError(res, error, 'CreateAdmin');
  }
};

export const listAdmins = async (_req: Request, res: Response): Promise<void> => {
  try {
    const admins = await superAdminService.listAdmins();
    res.json({ admins });
  } catch (error) {
    handleControllerError(res, error, 'ListAdmins');
  }
};

export const updatePermissions = async (req: Request, res: Response): Promise<void> => {
  const { adminId } = req.params;
  const perms = req.body as Partial<AdminPermissions>;

  try {
    const updated = await superAdminService.updateAdminPermissions(adminId, perms);
    res.json({ message: 'Permissions updated', permissions: updated });
  } catch (error) {
    handleControllerError(res, error, 'UpdatePermissions');
  }
};

export const toggleStatus = async (req: Request, res: Response): Promise<void> => {
  const { adminId } = req.params;
  const { is_active } = req.body as { is_active?: boolean };

  if (typeof is_active !== 'boolean') {
    res.status(400).json({ message: 'is_active must be a boolean' });
    return;
  }

  try {
    const admin = await superAdminService.toggleAdminStatus(adminId, is_active);
    res.json({ message: 'Admin status updated', admin });
  } catch (error) {
    handleControllerError(res, error, 'ToggleStatus');
  }
};

export const listPendingProperties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await superAdminService.listPendingProperties();
    res.json({ properties });
  } catch (error) {
    handleControllerError(res, error, 'ListPendingProperties');
  }
};

export const updatePropertyApproval = async (req: Request, res: Response): Promise<void> => {
  const { propertyId } = req.params;
  const { is_approved } = req.body as { is_approved?: boolean };

  if (typeof is_approved !== 'boolean') {
    res.status(400).json({ message: 'is_approved must be a boolean' });
    return;
  }

  try {
    const property = await superAdminService.updatePropertyApproval(propertyId, is_approved);
    res.json({
      message: is_approved ? 'Property approved and live on marketplace' : 'Property approval revoked',
      property,
    });
  } catch (error) {
    handleControllerError(res, error, 'UpdatePropertyApproval');
  }
};