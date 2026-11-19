// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { adminRoutes } from './adminRoutes';
import { superAdminRoutes } from './superAdminRoutes';
import { tenantRoutes } from './tenantRoutes';

export const router = createBrowserRouter([
    ...publicRoutes,
    ...adminRoutes,
    ...superAdminRoutes,
    ...tenantRoutes,
    {
        path: '*',
        element: (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
                <h1 className="text-4xl font-bold text-slate-900">404</h1>
                <p className="mt-2 text-sm text-slate-500">Page not found</p>
            </div>
        ),
    },
]);