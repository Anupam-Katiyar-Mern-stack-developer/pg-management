export type UserRole = 'ADMIN' | 'TENANT';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface User {
    id: string;
    name: string;
    passhword_hash: string;
    phone?: string | null;
    role: UserRole;
    created_at: Date;
}

export interface Bed {
    id: string;
    bed_number: string;
    price: number;
    property_id: string;
    tenant_id: string | null;
}