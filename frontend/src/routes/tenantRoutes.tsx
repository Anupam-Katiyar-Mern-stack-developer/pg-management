// src/routes/tenantRoutes.tsx
import type { RouteObject } from 'react-router-dom';
import { TenantLayout } from '../components/layout';
import { TenantDashboardPage } from '../pages/tenant/TenantDashboardPage';
import { TenantInvoicesPage } from '../pages/tenant/TenantInvoicesPage';
import { TenantTicketsPage } from '../pages/tenant/TenantTicketsPage';

export const tenantRoutes: RouteObject[] = [
    {
        path: '/tenant',
        element: <TenantLayout tenantName="Rahul Sharma" roomLabel="Room 204 • Bed A" />,
        children: [
            { path: 'dashboard', element: <TenantDashboardPage/>},
            { path: 'invoices', element: <TenantInvoicesPage/> },
            { path: 'tickets', element: <TenantTicketsPage/> },
        ],
    },
];