// src/routes/adminRoutes.tsx
import type { RouteObject } from 'react-router-dom';
import { AdminLayout, type AdminPermissions } from '../components/layout';

// Temporary mock permissions (baad mein Auth Context se aayega)
const mockAdminPermissions: AdminPermissions = {
    allowed_pg_count: 2,
    can_use_invoicing: true,
    can_use_ticketing: true,
    can_use_online_payment: false,
};

export const adminRoutes: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <AdminLayout
                role="ADMIN"
                userName="Anupam PG Owner"
                permissions={mockAdminPermissions}
            />
        ),
        children: [
            { path: 'dashboard', element: <div className="p-4">Admin Dashboard</div> },
            { path: 'inventory', element: <div className="p-4">Properties &amp; Beds</div> },
            { path: 'tenants', element: <div className="p-4">Tenants &amp; Leads</div> },
            { path: 'invoices', element: <div className="p-4">Invoices &amp; Billing</div> },
            { path: 'tickets', element: <div className="p-4">Support Tickets</div> },
        ],
    },
];