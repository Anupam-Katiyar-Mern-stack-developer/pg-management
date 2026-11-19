// src/components/layout/TenantLayout.tsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    Building2,
    Home,
    Receipt,
    MessageSquareWarning,
    LogOut,
    type LucideIcon,
} from 'lucide-react';

interface TenantNavItem {
    label: string;
    to: string;
    icon: LucideIcon;
}

interface TenantLayoutProps {
    tenantName?: string;
    roomLabel?: string; // e.g., "Room 204 • Bed A"
    onLogout?: () => void;
}

const TENANT_NAV_ITEMS: readonly TenantNavItem[] = [
    { label: 'Home', to: '/tenant/dashboard', icon: Home },
    { label: 'Invoices', to: '/tenant/invoices', icon: Receipt },
    { label: 'Support', to: '/tenant/tickets', icon: MessageSquareWarning },
];

export const TenantLayout: React.FC<TenantLayoutProps> = ({
    tenantName = 'Tenant',
    roomLabel = 'Room 101 • Bed A',
    onLogout,
}) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-16 md:pb-0">
            {/* Top Header */}
            <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
                <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Brand + Room Info */}
                    <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                            <Building2 className="w-4 h-4" />
                        </span>
                        <div className="leading-tight">
                            <p className="text-sm font-bold text-slate-900">StayFlow</p>
                            <p className="text-[11px] text-slate-500">{roomLabel}</p>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {TENANT_NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }: { isActive: boolean }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Profile + Logout */}
                    <div className="flex items-center gap-2.5">
                        <span className="hidden sm:inline text-sm font-medium text-slate-700">
                            {tenantName}
                        </span>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            aria-label="Log out"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 sm:py-6">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white border-t border-slate-200/80 grid grid-cols-3">
                {TENANT_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }: { isActive: boolean }) =>
                                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};