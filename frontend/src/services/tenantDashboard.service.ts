// src/services/tenantDashboard.service.ts
// Real API connect karne par uncomment kar lena:
// import { api } from './api';

export interface TenantStayInfo {
    pgName: string;
    locality: string;
    city: string;
    roomNumber: string;
    bedLabel: string;
    sharingType: string;
    moveInDate: string;
    billingDay: number;
    monthlyRent: number;
    depositPaid: number;
    adminName: string;
    adminPhone: string;
}

export interface TenantInvoice {
    id: string;
    billingMonth: string; // e.g., "November 2026"
    amount: number;
    dueDate: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    paymentMode?: 'UPI' | 'CASH' | 'ONLINE';
    paidAt?: string;
}

export interface TenantTicket {
    id: string;
    category: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
    resolutionNote?: string;
}

export interface CreateTicketPayload {
    category: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TenantDashboardData {
    stay: TenantStayInfo;
    invoices: TenantInvoice[];
    tickets: TenantTicket[];
}

const MOCK_TENANT_DATA: TenantDashboardData = {
    stay: {
        pgName: 'Elevate Co-Living & PG',
        locality: 'Sector 62',
        city: 'Noida',
        roomNumber: '204',
        bedLabel: 'Bed A',
        sharingType: 'Double Sharing',
        moveInDate: '2026-09-14',
        billingDay: 14,
        monthlyRent: 8500,
        depositPaid: 8500,
        adminName: 'Rajesh Verma',
        adminPhone: '+91 98765 43210',
    },
    invoices: [
        {
            id: 'INV-2026-11',
            billingMonth: 'November 2026',
            amount: 8500,
            dueDate: '2026-11-14',
            status: 'PENDING',
        },
        {
            id: 'INV-2026-10',
            billingMonth: 'October 2026',
            amount: 8500,
            dueDate: '2026-10-14',
            status: 'PAID',
            paymentMode: 'UPI',
            paidAt: '2026-10-13',
        },
        {
            id: 'INV-2026-09',
            billingMonth: 'September 2026',
            amount: 8500,
            dueDate: '2026-09-14',
            status: 'PAID',
            paymentMode: 'ONLINE',
            paidAt: '2026-09-14',
        },
    ],
    tickets: [
        {
            id: 'TKT-102',
            category: 'WiFi / Internet',
            title: 'WiFi speed very slow on 2nd floor',
            description: 'Facing frequent disconnects during evening calls since yesterday.',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            createdAt: '2026-11-25',
        },
        {
            id: 'TKT-098',
            category: 'Plumbing',
            title: 'Bathroom tap leaking',
            description: 'Washbasin tap is dripping continuously.',
            priority: 'MEDIUM',
            status: 'RESOLVED',
            createdAt: '2026-11-10',
            resolutionNote: 'Washer replaced by plumber on 11 Nov.',
        },
    ],
};

export const fetchTenantDashboardApi = async (): Promise<TenantDashboardData> => {
    // Real API:
    // const [invoicesRes, ticketsRes] = await Promise.all([api.get('/invoices'), api.get('/tickets')]);
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_TENANT_DATA), 250);
    });
};

export const createTenantTicketApi = async (
    payload: CreateTicketPayload
): Promise<TenantTicket> => {
    // Real API:
    // const { data } = await api.post<{ ticket: TenantTicket }>('/tickets', payload);
    // return data.ticket;

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
                ...payload,
                status: 'OPEN',
                createdAt: new Date().toISOString().split('T')[0],
            });
        }, 300);
    });
};

// src/services/tenantDashboard.service.ts (add at bottom)

export const payTenantInvoiceApi = async (
    invoiceId: string,
    paymentMode: 'UPI' | 'ONLINE'
): Promise<{ invoiceId: string; paymentMode: 'UPI' | 'ONLINE'; paidAt: string }> => {
    // Real API connect hone par:
    // const { data } = await api.patch(`/invoices/${invoiceId}/pay`, { paymentMode });
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                invoiceId,
                paymentMode,
                paidAt: new Date().toISOString().split('T')[0],
            });
        }, 350);
    });
};