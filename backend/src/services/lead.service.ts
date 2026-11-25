// src/services/lead.service.ts
import pool from '../config/db';
import { AppError } from '../utils/AppError';
import type { UserRole } from '../types/auth.types';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'VISITED' | 'CONVERTED' | 'CANCELLED';

export interface CreateLeadInput {
    propertyId: string;
    name: string;
    phone: string;
    visitDate: string; // YYYY-MM-DD
    preferredSharing?: string;
}

export const createLead = async (input: CreateLeadInput) => {
    // 1. Verify property exists and is approved
    const propRes = await pool.query<{ id: string; is_approved: boolean }>(
        `SELECT id, is_approved FROM properties WHERE id = $1`,
        [input.propertyId]
    );

    const property = propRes.rows[0];
    if (!property || !property.is_approved) {
        throw new AppError('Property not found or not available for visits', 404);
    }

    // 2. Insert visit lead
    const result = await pool.query(
        `INSERT INTO visit_leads
       (property_id, name, phone, visit_date, preferred_sharing, status)
     VALUES ($1, $2, $3, $4, $5, 'NEW')
     RETURNING *`,
        [
            input.propertyId,
            input.name.trim(),
            input.phone.trim(),
            input.visitDate,
            input.preferredSharing?.trim() ?? null,
        ]
    );

    return result.rows[0];
};

export const listLeads = async (
    adminId: string,
    userRole: UserRole,
    status?: LeadStatus
) => {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (userRole === 'ADMIN') {
        values.push(adminId);
        conditions.push(`p.admin_id = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`vl.status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
        `SELECT
       vl.id,
       vl.property_id,
       vl.name,
       vl.phone,
       vl.visit_date,
       vl.preferred_sharing,
       vl.status,
       vl.created_at,
       p.name AS property_name,
       p.locality,
       p.city
     FROM visit_leads vl
     JOIN properties p ON vl.property_id = p.id
     ${whereClause}
     ORDER BY vl.created_at DESC`,
        values
    );

    return result.rows;
};

export const updateLeadStatus = async (
    leadId: string,
    adminId: string,
    userRole: UserRole,
    status: LeadStatus
) => {
    const checkRes = await pool.query<{ id: string; admin_id: string }>(
        `SELECT vl.id, p.admin_id
     FROM visit_leads vl
     JOIN properties p ON vl.property_id = p.id
     WHERE vl.id = $1`,
        [leadId]
    );

    const lead = checkRes.rows[0];
    if (!lead) {
        throw new AppError('Visit lead not found', 404);
    }

    if (userRole !== 'SUPER_ADMIN' && lead.admin_id !== adminId) {
        throw new AppError('Forbidden: You do not own this property', 403);
    }

    const updateRes = await pool.query(
        `UPDATE visit_leads
     SET status = $1
     WHERE id = $2
     RETURNING *`,
        [status, leadId]
    );

    return updateRes.rows[0];
};