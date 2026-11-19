// src/routes/tenantRoutes.tsx
import type { RouteObject } from 'react-router-dom';
import { TenantLayout } from '../components/layout';

export const tenantRoutes: RouteObject[] = [
    {
        path: '/tenant',
        element: <TenantLayout tenantName="Rahul Sharma" roomLabel="Room 204 • Bed A" />,
        children: [
            { path: 'dashboard', element: <div className="p-4">Tenant Home</div> },
            { path: 'invoices', element: <div className="p-4">My Rent Invoices</div> },
            { path: 'tickets', element: <div className="p-4">My Support Tickets</div> },
        ],
    },
];