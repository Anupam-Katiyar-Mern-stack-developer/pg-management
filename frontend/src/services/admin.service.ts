// src/services/admin.service.ts
// Real API connect karne par uncomment kar lena:
// import { api } from './api';


export interface AdminPGItem {
    id: string;
    name: string;
    locality: string;
    city: string;
    gender: 'Boys' | 'Girls' | 'Co-living';
    startingRent: number;
    totalRooms: number;
    vacantBeds: number;
    isApproved: boolean;
}

export interface AdminTenantItem {
    id: string;
    loginId: string;
    name: string;
    email: string;
    phone: string;
    pgName: string;
    roomNumber: string;
    bedLabel: string;
    monthlyRent: number;
    moveInDate: string;
    idProofName: string;
}

export interface AdminToSuperTicket {
    id: string;
    category: 'LOGIN_ISSUE' | 'TENANT_CREATION' | 'BILLING' | 'OTHER';
    subject: string;
    message: string;
    status: 'OPEN' | 'RESOLVED';
    createdAt: string;
    replyNote?: string;
}

export interface AdminDashboardData {
    properties: AdminPGItem[];
    tenants: AdminTenantItem[];
    supportTickets: AdminToSuperTicket[];
}

const MOCK_ADMIN_DATA: AdminDashboardData = {
    properties: [
        {
            id: 'pg-1',
            name: 'Elevate Co-Living & PG',
            locality: 'Sector 62',
            city: 'Noida',
            gender: 'Co-living',
            startingRent: 8500,
            totalRooms: 18,
            vacantBeds: 5,
            isApproved: true,
        },
    ],
    tenants: [
        {
            id: 'ten-1',
            loginId: 'SF-TEN-1042',
            name: 'Rahul Sharma',
            email: 'rahul@gmail.com',
            phone: '9876543210',
            pgName: 'Elevate Co-Living & PG',
            roomNumber: '204',
            bedLabel: 'Bed A',
            monthlyRent: 8500,
            moveInDate: '2026-09-14',
            idProofName: 'aadhaar_rahul.pdf',
        },
        {
            id: 'ten-2',
            loginId: 'SF-TEN-1049',
            name: 'Aman Gupta',
            email: 'aman.g@gmail.com',
            phone: '9811223344',
            pgName: 'Elevate Co-Living & PG',
            roomNumber: '102',
            bedLabel: 'Bed B',
            monthlyRent: 7500,
            moveInDate: '2026-10-05',
            idProofName: 'pan_aman.jpg',
        },
    ],
    supportTickets: [
        {
            id: 'SUP-301',
            category: 'TENANT_CREATION',
            subject: 'Welcome email delayed for new tenant',
            message: 'Onboarded Aman Gupta today, please check mail trigger.',
            status: 'OPEN',
            createdAt: '2026-11-28',
        },
    ],
};

export const fetchAdminDashboardApi = async (): Promise<AdminDashboardData> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_ADMIN_DATA), 250);
    });
};
