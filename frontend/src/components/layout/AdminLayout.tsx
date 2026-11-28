// src/components/layout/AdminLayout.tsx
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    Building2,
    LayoutDashboard,
    BedDouble,
    Users,
    Receipt,
    MessageSquareWarning,
    UserPlus,
    Headphones,
    Globe,
    Menu,
    X,
    LogOut,
    type LucideIcon,
} from 'lucide-react';
import { Badge } from '../common';

type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

// Sirf boolean feature flags jinke base par menu lock/unlock hoga
export type PermissionKey =
    | 'can_use_invoicing'
    | 'can_use_ticketing'
    | 'can_use_online_payment';

// DB ke admin_permissions table ka exact frontend mirror
export interface AdminPermissions {
    allowed_pg_count: number;
    can_use_invoicing: boolean;
    can_use_ticketing: boolean;
    can_use_online_payment: boolean;
}

interface SidebarItem {
    label: string;
    to: string;
    icon: LucideIcon;
    requiredPermission?: PermissionKey; // Optional: agar nahi diya toh har Admin ko dikhega
}

interface AdminLayoutProps {
    role?: AdminRole;
    userName?: string;
    permissions?: AdminPermissions;
    onLogout?: () => void;
}

const MENU_BY_ROLE: Record<AdminRole, SidebarItem[]> = {
    ADMIN: [
        
        { label: 'My PGs & Rooms', to: '/admin/properties', icon: BedDouble },
        { label: 'Tenants', to: '/admin/tenants', icon: Users },
        { label: 'Visit Leads', to: '/admin/leads', icon: UserPlus },
        {
            label: 'Invoices & Billing',
            to: '/admin/invoices',
            icon: Receipt,
            requiredPermission: 'can_use_invoicing',
        },
        {
            label: 'Tenant Tickets',
            to: '/admin/tickets',
            icon: MessageSquareWarning,
            requiredPermission: 'can_use_ticketing',
        },
        { label: 'Super Admin Support', to: '/admin/support', icon: Headphones },
    ],
    SUPER_ADMIN: [
        
        { label: 'Manage PG Admins', to: '/super-admin/admins', icon: UserPlus },
        { label: 'All Hostels & PGs', to: '/super-admin/properties', icon: Building2 },
        { label: 'All Tenants', to: '/super-admin/tenants', icon: Users },
        { label: 'Admin Support', to: '/super-admin/support', icon: Headphones },
        { label: 'Site Settings & SEO', to: '/super-admin/settings', icon: Globe },
    ],
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
    role = 'ADMIN',
    userName = 'PG Owner',
    permissions,
    onLogout,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Sirf wahi menu items dikhao jinka access Super Admin ne diya hai
    const visibleMenuItems = MENU_BY_ROLE[role].filter((item) => {
        if (role === 'SUPER_ADMIN' || !item.requiredPermission) {
            return true;
        }
        return Boolean(permissions?.[item.requiredPermission]);
    });

    return (
        <div className="h-screen overflow-hidden flex bg-slate-50 text-slate-800">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                            <Building2 className="w-4 h-4" />
                        </span>
                        <span>StayFlow</span>
                    </div>
                    <button
                        type="button"
                        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filtered Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {visibleMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Logout */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="ml-auto flex items-center gap-3">
                        <Badge variant={role === 'SUPER_ADMIN' ? 'info' : 'neutral'} size="sm">
                            {role === 'SUPER_ADMIN' ? 'Super Admin' : 'PG Admin'}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:inline text-sm font-medium text-slate-700">
                                {userName}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};