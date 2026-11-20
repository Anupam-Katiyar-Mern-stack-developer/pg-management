// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock } from 'lucide-react';
import { Button, Card, Input } from '../../components/common';
import { SEO } from '../../components/shared';
import { useAuth, type AuthUser, type UserRole } from '../../context/AuthContext';

const DEMO_USERS: Record<UserRole, AuthUser> = {
    SUPER_ADMIN: {
        id: 'sa-1',
        name: 'Anupam (Super Admin)',
        email: 'superadmin@stayflow.in',
        role: 'SUPER_ADMIN',
    },
    ADMIN: {
        id: 'adm-1',
        name: 'Rajesh PG Owner',
        email: 'owner@stayflow.in',
        role: 'ADMIN',
        permissions: {
            allowed_pg_count: 2,
            can_use_invoicing: true,
            can_use_ticketing: false, // Test karne ke liye Tickets locked rakha hai
            can_use_online_payment: true,
        },
    },
    TENANT: {
        id: 'ten-1',
        name: 'Rahul Sharma',
        email: 'rahul@stayflow.in',
        role: 'TENANT',
        roomLabel: 'Room 204 • Bed A',
    },
};

const ROLE_REDIRECT: Record<UserRole, string> = {
    SUPER_ADMIN: '/super-admin/dashboard',
    ADMIN: '/admin/dashboard',
    TENANT: '/tenant/dashboard',
};

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        // Temporary email-based role detection (baad mein POST /api/auth/login aayega)
        const lower = email.toLowerCase();
        const role: UserRole = lower.includes('super')
            ? 'SUPER_ADMIN'
            : lower.includes('owner') || lower.includes('admin')
                ? 'ADMIN'
                : 'TENANT';

        login({ ...DEMO_USERS[role], email });
        navigate(ROLE_REDIRECT[role], { replace: true });
    };

    const handleDemoLogin = (role: UserRole) => {
        login(DEMO_USERS[role]);
        navigate(ROLE_REDIRECT[role], { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
            <SEO
                title="Log in"
                description="Log in to your StayFlow account to manage your PG, rent invoices, or support tickets."
            />

            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 mb-6">
                <span className="p-2 rounded-xl bg-indigo-600 text-white">
                    <Building2 className="w-5 h-5" />
                </span>
                <span>StayFlow</span>
            </Link>

            <Card padding="lg" className="w-full max-w-md space-y-5">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Sign in to continue to your dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        leftIcon={<Lock className="w-4 h-4" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error}
                    />
                    <Button type="submit" variant="primary" size="lg" className="w-full">
                        Sign In
                    </Button>
                </form>

                {/* Quick Demo Switcher */}
                <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-400 text-center uppercase tracking-wider mb-3">
                        Quick Demo Access
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoLogin('SUPER_ADMIN')}
                        >
                            Super Admin
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoLogin('ADMIN')}
                        >
                            PG Admin
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoLogin('TENANT')}
                        >
                            Tenant
                        </Button>
                    </div>
                </div>
            </Card>

            <p className="mt-5 text-xs text-slate-500">
                Looking for a PG?{' '}
                <Link to="/search" className="font-medium text-indigo-600 hover:underline">
                    Explore verified listings
                </Link>
            </p>
        </div>
    );
};