// src/controllers/property.controller.ts
import { Request, Response } from 'express';
import * as propertyService from '../services/property.service';
import { AppError } from '../utils/AppError';

const handleError = (res: Response, error: unknown, label: string) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(`${label} error:`, error);
  res.status(500).json({ message: 'Internal server error' });
};

export const listPublic = async (req: Request, res: Response): Promise<void> => {
  const { q, city, gender, maxRent } = req.query as Record<string, string | undefined>;

  try {
    const properties = await propertyService.listPublicProperties({
      q,
      city,
      gender,
      maxRent: maxRent ? Number(maxRent) : undefined,
    });
    res.json({ properties });
  } catch (error) {
    handleError(res, error, 'ListPublicProperties');
  }
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await propertyService.getPropertyByIdOrSlug(req.params.idOrSlug);
    res.json({ property });
  } catch (error) {
    handleError(res, error, 'GetProperty');
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { name, locality, city, gender, startingRent, description, facilities, imageUrl } =
    req.body;

  if (!name || !locality || !city || !gender || !startingRent) {
    res.status(400).json({
      message: 'name, locality, city, gender, and startingRent are required',
    });
    return;
  }

  try {
    const property = await propertyService.createProperty({
      adminId: req.user.id,
      name,
      locality,
      city,
      gender,
      startingRent: Number(startingRent),
      description,
      facilities,
      imageUrl,
    });
    res.status(201).json({ message: 'Property created (pending approval)', property });
  } catch (error) {
    handleError(res, error, 'CreateProperty');
  }
};

export const listMine = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const properties = await propertyService.getAdminProperties(req.user.id);
    res.json({ properties });
  } catch (error) {
    handleError(res, error, 'ListAdminProperties');
  }
};