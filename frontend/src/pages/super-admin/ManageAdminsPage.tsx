// src/pages/super-admin/ManageAdminsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchSuperAdminDataThunk,
    toggleAdminActive,
    toggleAdminPermission,
} from '../../store/slices/superAdminSlice';

export const ManageAdminsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { admins, loading } = useAppSelector((state) => state.superAdmin);
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        if (admins.length === 0) dispatch(fetchSuperAdminDataThunk());
    }, [dispatch, admins.length]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return admins;
        return admins.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                a.phone.includes(q)
        );
    }, [admins, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        Manage PG Admins
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Control which modules each PG Admin can access on their dashboard.
                    </p>
                </div>
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search admin name, email..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading && admins.length === 0 ? (
                <div className="space-y-3">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((admin) => (
                        <Card key={admin.id} padding="md" className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900">{admin.name}</h3>
                                        <Badge variant={admin.isActive ? 'success' : 'danger'} size="sm" dot>
                                            {admin.isActive ? 'Active' : 'Suspended'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {admin.email} • {admin.phone} • PGs: {admin.pgCount}/
                                        {admin.permissions.allowed_pg_count}
                                    </p>
                                </div>

                                <Button
                                    variant={admin.isActive ? 'outline' : 'primary'}
                                    size="sm"
                                    onClick={() => dispatch(toggleAdminActive(admin.id))}
                                >
                                    {admin.isActive ? 'Suspend Admin' : 'Activate Admin'}
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                                {(
                                    [
                                        { key: 'can_use_invoicing', label: 'Invoicing Access' },
                                        { key: 'can_use_ticketing', label: 'Ticketing Access' },
                                        { key: 'can_use_online_payment', label: 'Online Payment' },
                                    ] as const
                                ).map((perm) => {
                                    const enabled = admin.permissions[perm.key];
                                    return (
                                        <button
                                            key={perm.key}
                                            type="button"
                                            onClick={() =>
                                                dispatch(toggleAdminPermission({ adminId: admin.id, key: perm.key }))
                                            }
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${enabled
                                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                                }`}
                                        >
                                            {enabled ? '✓ ' : '✕ '}
                                            {perm.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};