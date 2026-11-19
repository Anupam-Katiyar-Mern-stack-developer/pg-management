// src/routes/superAdminRoutes.tsx
import type { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../components/layout';

export const superAdminRoutes: RouteObject[] = [
    {
        path: '/super-admin',
        element: <AdminLayout role="SUPER_ADMIN" userName="Super Admin" />,
        children: [
            { path: 'dashboard', element: <div className="p-4">Super Admin Overview</div> },
            { path: 'admins', element: <div className="p-4">Create &amp; Manage Admins</div> },
            { path: 'approvals', element: <div className="p-4">PG Approvals</div> },
            { path: 'permissions', element: <div className="p-4">Feature Permissions</div> },
        ],
    },
];