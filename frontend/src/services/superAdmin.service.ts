// src/services/superAdmin.service.ts
// Real API connect karne par uncomment kar lena:
// import { api } from './api';

export interface SuperAdminPGAdmin {
    id: string;
    name: string;
    email: string;
    phone: string;
    pgCount: number;
    isActive: boolean;
    permissions: {
        allowed_pg_count: number;
        can_use_invoicing: boolean;
        can_use_ticketing: boolean;
        can_use_online_payment: boolean;
    };
}

export interface SuperAdminPropertyView {
    id: string;
    name: string;
    city: string;
    locality: string;
    adminName: string;
    totalRooms: number;
    vacantBeds: number;
    isApproved: boolean;
}

export interface SuperAdminUserView {
    id: string;
    loginId: string;
    name: string;
    email: string;
    pgName: string;
    roomBed: string;
    idProofVerified: boolean;
    isBlocked: boolean;
}

export interface AdminSupportTicket {
    id: string;
    adminName: string;
    pgName: string;
    category: 'LOGIN_ISSUE' | 'TENANT_CREATION' | 'BILLING' | 'OTHER';
    subject: string;
    message: string;
    status: 'OPEN' | 'RESOLVED';
    createdAt: string;
    replyNote?: string;
}

export interface SuperAdminDashboardData {
    admins: SuperAdminPGAdmin[];
    properties: SuperAdminPropertyView[];
    users: SuperAdminUserView[];
    supportTickets: AdminSupportTicket[];
    seoSettings: SiteSeoSettings;
}

const MOCK_SUPER_ADMIN_DATA: SuperAdminDashboardData = {
    admins: [
        {
            id: 'adm-1',
            name: 'Rajesh Verma',
            email: 'rajesh@elevatepg.in',
            phone: '9876543210',
            pgCount: 2,
            isActive: true,
            permissions: {
                allowed_pg_count: 3,
                can_use_invoicing: true,
                can_use_ticketing: true,
                can_use_online_payment: true,
            },
        },
        {
            id: 'adm-2',
            name: 'Sunita Sharma',
            email: 'sunita@serenestays.in',
            phone: '9811223344',
            pgCount: 1,
            isActive: true,
            permissions: {
                allowed_pg_count: 1,
                can_use_invoicing: true,
                can_use_ticketing: false,
                can_use_online_payment: false,
            },
        },
    ],
    properties: [
        {
            id: 'pg-1',
            name: 'Elevate Co-Living & PG',
            city: 'Noida',
            locality: 'Sector 62',
            adminName: 'Rajesh Verma',
            totalRooms: 18,
            vacantBeds: 5,
            isApproved: true,
        },
        {
            id: 'pg-2',
            name: 'Serene Stays Girls Residency',
            city: 'Bangalore',
            locality: 'HSR Layout',
            adminName: 'Sunita Sharma',
            totalRooms: 12,
            vacantBeds: 3,
            isApproved: false,
        },
    ],
    users: [
        {
            id: 'usr-1',
            loginId: 'SF-TEN-1042',
            name: 'Rahul Sharma',
            email: 'rahul@gmail.com',
            pgName: 'Elevate Co-Living & PG',
            roomBed: 'Room 204 • Bed A',
            idProofVerified: true,
            isBlocked: false,
        },
        {
            id: 'usr-2',
            loginId: 'SF-TEN-1049',
            name: 'Aman Gupta',
            email: 'aman.g@gmail.com',
            pgName: 'Elevate Co-Living & PG',
            roomBed: 'Room 102 • Bed B',
            idProofVerified: true,
            isBlocked: false,
        },
    ],
    supportTickets: [
        {
            id: 'SUP-301',
            adminName: 'Rajesh Verma',
            pgName: 'Elevate Co-Living & PG',
            category: 'TENANT_CREATION',
            subject: 'Welcome email not received by new tenant',
            message: 'Onboarded tenant Aman Gupta today but he did not receive his login ID mail.',
            status: 'OPEN',
            createdAt: '2026-11-28',
        },
        {
            id: 'SUP-298',
            adminName: 'Sunita Sharma',
            pgName: 'Serene Stays Girls Residency',
            category: 'LOGIN_ISSUE',
            subject: 'Need ticketing module access',
            message: 'Please enable facility ticketing for my PG so tenants can raise issues.',
            status: 'RESOLVED',
            createdAt: '2026-11-24',
            replyNote: 'Explained plan upgrade and enabled trial access.',
        },
    ],
    seoSettings: {
        siteName: 'StayFlow',
        seoTitle: 'StayFlow — Verified PGs & Hostels with Live Vacant Beds',
        seoDescription:
            'Find verified Boys, Girls, and Co-living PGs across India with zero brokerage and live bed availability.',
        seoKeywords: 'PG near me, Boys PG, Girls PG, Co-living Noida, Verified Hostel India',
        supportEmail: 'support@stayflow.in',
        maintenanceMode: false,
    },
};

export const fetchSuperAdminDashboardApi =async():Promise<SuperAdminDashboardData> =>{
    return new Promise((resolve)=>{
        setTimeout(()=>resolve(MOCK_SUPER_ADMIN_DATA),250);
    })
}