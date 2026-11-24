// src/services/invoice.service.ts
import pool from '../config/db';
import { AppError } from '../utils/AppError';
import type { UserRole } from '../types/auth.types';

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMode = 'CASH' | 'UPI' | 'ONLINE';

// Helper: billing_day ko month ke last day par safely clamp karega (e.g., 31 in Feb -> 28/29)
const buildAnchoredDueDate = (billingMonth: string, billingDay: number): string => {
    const [yearStr, monthStr] = billingMonth.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-12
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const safeDay = Math.min(billingDay, lastDayOfMonth);
    return `${yearStr}-${monthStr}-${String(safeDay).padStart(2, '0')}`;
};

export const generateMonthlyInvoices = async (
    adminId: string,
    userRole: UserRole,
    billingMonth: string // Format: YYYY-MM
) => {
    if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
        throw new AppError('billingMonth must be in YYYY-MM format', 400);
    }

    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    const staysRes = await pool.query<{
        stay_id: string;
        tenant_id: string;
        property_id: string;
        billing_day: number;
        monthly_rent: number;
    }>(
        `SELECT
       ts.id AS stay_id,
       ts.tenant_id,
       ts.property_id,
       ts.billing_day,
       ts.monthly_rent
     FROM tenant_stays ts
     JOIN properties p ON ts.property_id = p.id
     WHERE ts.status = 'ACTIVE'
       ${isSuperAdmin ? '' : 'AND p.admin_id = $1'}`,
        isSuperAdmin ? [] : [adminId]
    );

    if (staysRes.rows.length === 0) {
        return { createdCount: 0, invoices: [] };
    }

    const client = await pool.connect();
    const createdInvoices = [];

    try {
        await client.query('BEGIN');

        for (const stay of staysRes.rows) {
            // Skip if invoice already exists for this stay + billingMonth
            const existing = await client.query(
                `SELECT id FROM invoices WHERE stay_id = $1 AND billing_month = $2`,
                [stay.stay_id, billingMonth]
            );

            if (existing.rows.length > 0) continue;

            const dueDate = buildAnchoredDueDate(billingMonth, stay.billing_day);

            const insertRes = await client.query(
                `INSERT INTO invoices
           (stay_id, tenant_id, property_id, billing_month, amount, due_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
         RETURNING *`,
                [
                    stay.stay_id,
                    stay.tenant_id,
                    stay.property_id,
                    billingMonth,
                    stay.monthly_rent,
                    dueDate,
                ]
            );

            createdInvoices.push(insertRes.rows[0]);
        }

        await client.query('COMMIT');

        return {
            createdCount: createdInvoices.length,
            invoices: createdInvoices,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const listInvoices = async (
    userId: string,
    userRole: UserRole,
    status?: InvoiceStatus
) => {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (userRole === 'TENANT') {
        values.push(userId);
        conditions.push(`i.tenant_id = $${values.length}`);
    } else if (userRole === 'ADMIN') {
        values.push(userId);
        conditions.push(`p.admin_id = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`i.status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
        `SELECT
       i.id,
       i.stay_id,
       i.billing_month,
       i.amount,
       i.due_date,
       i.status,
       i.payment_mode,
       i.paid_at,
       u.name AS tenant_name,
       u.email AS tenant_email,
       p.name AS property_name,
       r.room_number,
       b.bed_label
     FROM invoices i
     JOIN users u ON i.tenant_id = u.id
     JOIN properties p ON i.property_id = p.id
     JOIN tenant_stays ts ON i.stay_id = ts.id
     JOIN rooms r ON ts.room_id = r.id
     JOIN beds b ON ts.bed_id = b.id
     ${whereClause}
     ORDER BY i.due_date DESC, i.created_at DESC`,
        values
    );

    return result.rows;
};

export const markInvoicePaid = async (
    invoiceId: string,
    adminId: string,
    userRole: UserRole,
    paymentMode: PaymentMode
) => {
    const checkRes = await pool.query<{
        id: string;
        status: InvoiceStatus;
        admin_id: string;
    }>(
        `SELECT i.id, i.status, p.admin_id
     FROM invoices i
     JOIN properties p ON i.property_id = p.id
     WHERE i.id = $1`,
        [invoiceId]
    );

    const invoice = checkRes.rows[0];
    if (!invoice) {
        throw new AppError('Invoice not found', 404);
    }

    if (userRole !== 'SUPER_ADMIN' && invoice.admin_id !== adminId) {
        throw new AppError('Forbidden: You do not own this property', 403);
    }

    if (invoice.status === 'PAID') {
        throw new AppError('Invoice is already marked as PAID', 400);
    }

    const updateRes = await pool.query(
        `UPDATE invoices
     SET status = 'PAID', payment_mode = $1, paid_at = NOW()
     WHERE id = $2
     RETURNING *`,
        [paymentMode, invoiceId]
    );

    return updateRes.rows[0];
};