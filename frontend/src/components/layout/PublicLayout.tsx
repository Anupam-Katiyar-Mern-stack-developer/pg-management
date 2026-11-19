// src/components/layout/PublicLayout.tsx
import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '../common';

interface NavItem {
    label: string;
    to: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Explore PGs', to: '/search' },
    { label: 'List Your PG', to: '/list-property' },
];

export const PublicLayout: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            {/* Sticky Light Navbar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
                        <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                            <Building2 className="w-5 h-5" />
                        </span>
                        <span>StayFlow</span>
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }: { isActive: boolean }) =>
                                    `text-sm font-medium transition-colors ${isActive
                                        ? 'text-indigo-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Desktop Auth Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" size="sm">Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium text-slate-700 hover:text-indigo-600"
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                            <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="outline" size="sm" className="w-full">Log in</Button>
                            </Link>
                            <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Page Content (Child routes yahan render honge) */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Clean Minimal Footer */}
            <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} StayFlow. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link to="/search" className="hover:text-slate-800">Find PG</Link>
                        <Link to="/list-property" className="hover:text-slate-800">For PG Owners</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};