// src/services/tenant.service.ts
import bcrypt from 'bcryptjs';
import  pool  from '../config/db';
import { AppError } from '../utils/AppError';

export interface OnboardTenantInput {
    adminId: string;
    userRole: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    bedId: string;
    moveInDate: string; // YYYY-MM-DD
    monthlyRent?: number;
    depositAmount?: number;
}

export const onboardTenant = async (input: OnboardTenantInput) => {
    // 1. Verify bed exists, is VACANT, and belongs to this admin
    const bedRes = await pool.query<{
        bed_id: string;
        bed_status: string;
        room_id: string;
        monthly_rent: number;
        deposit_amount: number;
        property_id: string;
        admin_id: string;
    }>(
        `SELECT
       b.id AS bed_id,
       b.status AS bed_status,
       r.id AS room_id,
       r.monthly_rent,
       r.deposit_amount,
       p.id AS property_id,
       p.admin_id
     FROM beds b
     JOIN rooms r ON b.room_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE b.id = $1`,
        [input.bedId]
    );

    const bedInfo = bedRes.rows[0];
    if (!bedInfo) {
        throw new AppError('Bed not found', 404);
    }

    if (input.userRole !== 'SUPER_ADMIN' && bedInfo.admin_id !== input.adminId) {
        throw new AppError('Forbidden: You do not own this property', 403);
    }

    if (bedInfo.bed_status !== 'VACANT') {
        throw new AppError(`Bed is currently ${bedInfo.bed_status}, not VACANT`, 409);
    }

    // Extract billing day from move-in date (e.g., 2026-11-14 -> 14)
    const moveIn = new Date(input.moveInDate);
    if (Number.isNaN(moveIn.getTime())) {
        throw new AppError('Invalid moveInDate format. Use YYYY-MM-DD', 400);
    }
    const billingDay = moveIn.getDate();

    const finalRent = input.monthlyRent ?? Number(bedInfo.monthly_rent);
    const finalDeposit = input.depositAmount ?? Number(bedInfo.deposit_amount);
    const passwordHash = await bcrypt.hash(input.password || 'Tenant@123', 10);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 2. Find existing user or create new TENANT user
        let userId: string;
        const existingUser = await client.query<{ id: string; role: string }>(
            `SELECT id, role FROM users WHERE LOWER(email) = LOWER($1)`,
            [input.email.trim()]
        );

        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
        } else {
            const newUserRes = await client.query<{ id: string }>(
                `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, 'TENANT', true)
         RETURNING id`,
                [input.name.trim(), input.email.trim().toLowerCase(), passwordHash]
            );
            userId = newUserRes.rows[0].id;
        }

        // 3. Create active tenant stay record
        const stayRes = await client.query(
            `INSERT INTO tenant_stays
         (tenant_id, property_id, room_id, bed_id, phone, move_in_date, billing_day, monthly_rent, deposit_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
       RETURNING *`,
            [
                userId,
                bedInfo.property_id,
                bedInfo.room_id,
                bedInfo.bed_id,
                input.phone.trim(),
                input.moveInDate,
                billingDay,
                finalRent,
                finalDeposit,
            ]
        );

        // 4. Mark bed as OCCUPIED
        await client.query(
            `UPDATE beds SET status = 'OCCUPIED' WHERE id = $1`,
            [bedInfo.bed_id]
        );

        await client.query('COMMIT');

        return stayRes.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const listAdminTenants = async (adminId: string, userRole: string) => {
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    const result = await pool.query(
        `SELECT
       ts.id AS stay_id,
       u.id AS tenant_id,
       u.name,
       u.email,
       ts.phone,
       ts.move_in_date,
       ts.billing_day,
       ts.monthly_rent,
       ts.deposit_amount,
       ts.status,
       p.name AS property_name,
       r.room_number,
       b.bed_label
     FROM tenant_stays ts
     JOIN users u ON ts.tenant_id = u.id
     JOIN properties p ON ts.property_id = p.id
     JOIN rooms r ON ts.room_id = r.id
     JOIN beds b ON ts.bed_id = b.id
     ${isSuperAdmin ? '' : 'WHERE p.admin_id = $1'}
     ORDER BY ts.created_at DESC`,
        isSuperAdmin ? [] : [adminId]
    );

    return result.rows;
};

export const vacateTenant = async (
    stayId: string,
    adminId: string,
    userRole: string
) => {
    const checkRes = await pool.query<{
        id: string;
        bed_id: string;
        status: string;
        admin_id: string;
    }>(
        `SELECT ts.id, ts.bed_id, ts.status, p.admin_id
     FROM tenant_stays ts
     JOIN properties p ON ts.property_id = p.id
     WHERE ts.id = $1`,
        [stayId]
    );

    const stay = checkRes.rows[0];
    if (!stay) {
        throw new AppError('Tenant stay record not found', 404);
    }

    if (userRole !== 'SUPER_ADMIN' && stay.admin_id !== adminId) {
        throw new AppError('Forbidden: You do not own this property', 403);
    }

    if (stay.status === 'VACATED') {
        throw new AppError('Tenant has already vacated', 400);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updatedStay = await client.query(
            `UPDATE tenant_stays
       SET status = 'VACATED', move_out_date = CURRENT_DATE
       WHERE id = $1
       RETURNING *`,
            [stayId]
        );

        await client.query(
            `UPDATE beds SET status = 'VACANT' WHERE id = $1`,
            [stay.bed_id]
        );

        await client.query('COMMIT');

        return updatedStay.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};