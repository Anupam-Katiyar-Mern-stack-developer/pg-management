// src/services/property.service.ts
import pool from '../config/db';
import { AppError } from '../utils/AppError';

export interface PropertyFilters {
    q?: string;
    city?: string;
    gender?: string;
    maxRent?: number;
}

export interface CreatePropertyInput {
    adminId: string;
    name: string;
    locality: string;
    city: string;
    gender: 'Boys' | 'Girls' | 'Co-living';
    startingRent: number;
    description?: string;
    facilities?: string[];
    imageUrl?: string;
}

const generateSlug = (name: string, locality: string, city: string): string => {
    const base = `${name}-${locality}-${city}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base}-${suffix}`;
};

export const listPublicProperties = async (filters: PropertyFilters) => {
    const conditions: string[] = [`p.is_approved = true`];
    const values: unknown[] = [];

    if (filters.q) {
        values.push(`%${filters.q.trim()}%`);
        const idx = values.length;
        conditions.push(
            `(p.name ILIKE $${idx} OR p.locality ILIKE $${idx} OR p.city ILIKE $${idx})`
        );
    }

    if (filters.city) {
        values.push(filters.city.trim());
        conditions.push(`LOWER(p.city) = LOWER($${values.length})`);
    }

    if (filters.gender) {
        values.push(filters.gender.trim());
        conditions.push(`p.gender = $${values.length}`);
    }

    if (filters.maxRent) {
        values.push(filters.maxRent);
        conditions.push(`p.starting_rent <= $${values.length}`);
    }

    const query = `
    SELECT
      p.id,
      p.slug,
      p.name,
      p.locality,
      p.city,
      p.gender,
      p.starting_rent,
      p.facilities,
      p.image_url,
      p.created_at
    FROM properties p
    WHERE ${conditions.join(' AND ')}
    ORDER BY p.created_at DESC
  `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const getPropertyByIdOrSlug = async (idOrSlug: string) => {
    const result = await pool.query(
        `SELECT *
     FROM properties
     WHERE id::text = $1 OR slug = $1
     LIMIT 1`,
        [idOrSlug]
    );

    const property = result.rows[0];
    if (!property) {
        throw new AppError('Property not found', 404);
    }

    return property;
};

export const createProperty = async (input: CreatePropertyInput) => {
    // 1. Check Admin's allowed_pg_count limit
    const permRes = await pool.query<{ allowed_pg_count: number }>(
        `SELECT allowed_pg_count FROM admin_permissions WHERE admin_id = $1`,
        [input.adminId]
    );

    const allowedLimit = permRes.rows[0]?.allowed_pg_count ?? 1;

    const countRes = await pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM properties WHERE admin_id = $1`,
        [input.adminId]
    );

    const currentCount = Number(countRes.rows[0].count);

    if (currentCount >= allowedLimit) {
        throw new AppError(
            `PG limit reached (${allowedLimit}). Contact Super Admin to upgrade your limit.`,
            403
        );
    }

    // 2. Insert property with SEO-friendly slug
    const slug = generateSlug(input.name, input.locality, input.city);

    const result = await pool.query(
        `INSERT INTO properties
       (admin_id, name, slug, locality, city, gender, starting_rent, description, facilities, image_url, is_approved)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
     RETURNING *`,
        [
            input.adminId,
            input.name.trim(),
            slug,
            input.locality.trim(),
            input.city.trim(),
            input.gender,
            input.startingRent,
            input.description ?? null,
            input.facilities ?? [],
            input.imageUrl ?? null,
        ]
    );

    return result.rows[0];
};

export const getAdminProperties = async (adminId: string) => {
    const result = await pool.query(
        `SELECT * FROM properties WHERE admin_id = $1 ORDER BY created_at DESC`,
        [adminId]
    );
    return result.rows;
};