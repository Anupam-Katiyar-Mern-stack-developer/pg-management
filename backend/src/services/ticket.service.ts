// src/services/ticket.service.ts
import { pool } from '../config/db';
import { AppError } from '../utils/AppError';
import type { UserRole } from '../types/auth.types';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CreateTicketInput {
    tenantId: string;
    category: string;
    title: string;
    description: string;
    priority?: TicketPriority;
}

export const createTicket = async (input: CreateTicketInput) => {
    // 1. Tenant ki active stay aur property admin ki ticketing permission check karo
    const stayRes = await pool.query<{
        stay_id: string;
        property_id: string;
        room_id: string;
        can_use_ticketing: boolean | null;
    }>(
        `SELECT
       ts.id AS stay_id,
       ts.property_id,
       ts.room_id,
       ap.can_use_ticketing
     FROM tenant_stays ts
     JOIN properties p ON ts.property_id = p.id
     LEFT JOIN admin_permissions ap ON p.admin_id = ap.admin_id
     WHERE ts.tenant_id = $1 AND ts.status = 'ACTIVE'
     LIMIT 1`,
        [input.tenantId]
    );

    const stay = stayRes.rows[0];
    if (!stay) {
        throw new AppError('No active PG stay found for your account', 404);
    }

    if (!stay.can_use_ticketing) {
        throw new AppError(
            'Support ticketing is not enabled for your PG. Please contact the PG owner directly.',
            403
        );
    }

    // 2. Ticket insert karo
    const result = await pool.query(
        `INSERT INTO tickets
       (tenant_id, property_id, room_id, category, title, description, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN')
     RETURNING *`,
        [
            input.tenantId,
            stay.property_id,
            stay.room_id,
            input.category.trim(),
            input.title.trim(),
            input.description.trim(),
            input.priority ?? 'MEDIUM',
        ]
    );

    return result.rows[0];
};

export const listTickets = async (
    userId: string,
    userRole: UserRole,
    status?: TicketStatus
) => {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (userRole === 'TENANT') {
        values.push(userId);
        conditions.push(`t.tenant_id = $${values.length}`);
    } else if (userRole === 'ADMIN') {
        values.push(userId);
        conditions.push(`p.admin_id = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`t.status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
        `SELECT
       t.id,
       t.category,
       t.title,
       t.description,
       t.priority,
       t.status,
       t.resolution_note,
       t.created_at,
       t.updated_at,
       u.name AS tenant_name,
       p.name AS property_name,
       r.room_number
     FROM tickets t
     JOIN users u ON t.tenant_id = u.id
     JOIN properties p ON t.property_id = p.id
     LEFT JOIN rooms r ON t.room_id = r.id
     ${whereClause}
     ORDER BY
       CASE t.status WHEN 'OPEN' THEN 1 WHEN 'IN_PROGRESS' THEN 2 ELSE 3 END,
       t.created_at DESC`,
        values
    );

    return result.rows;
};

export const updateTicketStatus = async (
    ticketId: string,
    adminId: string,
    userRole: UserRole,
    status: TicketStatus,
    resolutionNote?: string
) => {
    const checkRes = await pool.query<{ id: string; admin_id: string }>(
        `SELECT t.id, p.admin_id
     FROM tickets t
     JOIN properties p ON t.property_id = p.id
     WHERE t.id = $1`,
        [ticketId]
    );

    const ticket = checkRes.rows[0];
    if (!ticket) {
        throw new AppError('Ticket not found', 404);
    }

    if (userRole !== 'SUPER_ADMIN' && ticket.admin_id !== adminId) {
        throw new AppError('Forbidden: You do not own this property', 403);
    }

    const updateRes = await pool.query(
        `UPDATE tickets
     SET
       status = $1,
       resolution_note = COALESCE($2, resolution_note),
       updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
        [status, resolutionNote?.trim() ?? null, ticketId]
    );

    return updateRes.rows[0];
};