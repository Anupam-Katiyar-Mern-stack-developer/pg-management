// src/services/room.service.ts
import  pool  from '../config/db';
import { AppError } from '../utils/AppError';

export type SharingType = 'Single' | 'Double' | 'Triple' | 'Four';
export type BedStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

export interface CreateRoomInput {
  adminId: string;
  userRole: string;
  propertyId: string;
  roomNumber: string;
  floor?: number;
  sharingType: SharingType;
  totalBeds: number;
  monthlyRent: number;
  depositAmount: number;
}

export const createRoomWithBeds = async (input: CreateRoomInput) => {
  // 1. Verify property exists and belongs to this admin (unless SUPER_ADMIN)
  const propRes = await pool.query<{ id: string; admin_id: string }>(
    `SELECT id, admin_id FROM properties WHERE id = $1`,
    [input.propertyId]
  );

  const property = propRes.rows[0];
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (input.userRole !== 'SUPER_ADMIN' && property.admin_id !== input.adminId) {
    throw new AppError('Forbidden: You do not own this property', 403);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 2. Insert Room
    const roomRes = await client.query(
      `INSERT INTO rooms
         (property_id, room_number, floor, sharing_type, total_beds, monthly_rent, deposit_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.propertyId,
        input.roomNumber.trim(),
        input.floor ?? 0,
        input.sharingType,
        input.totalBeds,
        input.monthlyRent,
        input.depositAmount,
      ]
    );

    const room = roomRes.rows[0];

    // 3. Auto-generate Beds (Bed A, Bed B, Bed C...)
    const beds = [];
    for (let i = 0; i < input.totalBeds; i++) {
      const bedLabel = `Bed ${String.fromCharCode(65 + i)}`;
      const bedRes = await client.query(
        `INSERT INTO beds (room_id, bed_label, status)
         VALUES ($1, $2, 'VACANT')
         RETURNING *`,
        [room.id, bedLabel]
      );
      beds.push(bedRes.rows[0]);
    }

    await client.query('COMMIT');

    return { ...room, beds };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getRoomsByProperty = async (propertyId: string) => {
  const result = await pool.query(
    `SELECT
       r.id,
       r.property_id,
       r.room_number,
       r.floor,
       r.sharing_type,
       r.total_beds,
       r.monthly_rent,
       r.deposit_amount,
       COALESCE(
         json_agg(
           json_build_object(
             'id', b.id,
             'bed_label', b.bed_label,
             'status', b.status
           ) ORDER BY b.bed_label
         ) FILTER (WHERE b.id IS NOT NULL),
         '[]'
       ) AS beds
     FROM rooms r
     LEFT JOIN beds b ON b.room_id = r.id
     WHERE r.property_id = $1
     GROUP BY r.id
     ORDER BY r.floor ASC, r.room_number ASC`,
    [propertyId]
  );

  return result.rows;
};

export const updateBedStatus = async (
  bedId: string,
  status: BedStatus,
  adminId: string,
  userRole: string
) => {
  // Check ownership via bed -> room -> property join
  const checkRes = await pool.query<{ admin_id: string }>(
    `SELECT p.admin_id
     FROM beds b
     JOIN rooms r ON b.room_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE b.id = $1`,
    [bedId]
  );

  if (checkRes.rows.length === 0) {
    throw new AppError('Bed not found', 404);
  }

  if (userRole !== 'SUPER_ADMIN' && checkRes.rows[0].admin_id !== adminId) {
    throw new AppError('Forbidden: You do not own this property', 403);
  }

  const updateRes = await pool.query(
    `UPDATE beds
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, bedId]
  );

  return updateRes.rows[0];
};