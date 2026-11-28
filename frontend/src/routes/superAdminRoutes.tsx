// src/routes/superAdminRoutes.tsx
import type { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../components/layout';
import { SuperAdminDashboardPage } from '../pages/super-admin/SuperAdminDashboardPage';
import { ManageAdminsPage } from '../pages/super-admin/ManageAdminsPage';
import { AllPropertiesPage } from '../pages/super-admin/AllPropertiesPage';
import { AllTenantsPage } from '../pages/super-admin/AllTenantsPage';
import { AdminSupportPage } from '../pages/super-admin/AdminSupportPage';
import { SiteSettingsSeoPage } from '../pages/super-admin/SiteSettingsSeoPage'

export const superAdminRoutes: RouteObject[] = [
    {
        path: '/super-admin',
        element: <AdminLayout role="SUPER_ADMIN" userName="Super Admin" />,
        children: [
            { index: true, element: <SuperAdminDashboardPage /> },
            { path: 'admins', element: <ManageAdminsPage /> },
            { path: 'properties', element: <AllPropertiesPage /> },
            { path: 'tenants', element: <AllTenantsPage /> },
            { path: 'support', element: <AdminSupportPage /> },
            { path: 'settings', element: <SiteSettingsSeoPage /> },
        ],
    },
];