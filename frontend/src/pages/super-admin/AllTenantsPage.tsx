// src/pages/super-admin/AllTenantsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, Ban, Lock, Search } from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchSuperAdminDataThunk,
    toggleUserBlock,
} from '../../store/slices/superAdminSlice';

export const AllTenantsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { users } = useAppSelector((state) => state.superAdmin);
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        if (users.length === 0) dispatch(fetchSuperAdminDataThunk());
    }, [dispatch, users.length]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.loginId.toLowerCase().includes(q) ||
                u.pgName.toLowerCase().includes(q)
        );
    }, [users, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        All Registered Tenants
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Monitor tenant accounts across all PGs and block/unblock if needed.
                    </p>
                </div>
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search name, Login ID, PG..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
                <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                    Super Admin can inspect tenant records and block/unblock accounts. Creating or
                    editing tenants is managed by PG Admins.
                </span>
            </div>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                <th className="px-5 py-3.5">Login ID</th>
                                <th className="px-5 py-3.5">Tenant</th>
                                <th className="px-5 py-3.5">PG & Bed</th>
                                <th className="px-5 py-3.5">ID Proof</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/60">
                                    <td className="px-5 py-4 font-mono text-xs font-semibold text-indigo-700">
                                        {u.loginId}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-slate-900">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.email}</p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">
                                        <p>{u.pgName}</p>
                                        <p className="text-xs text-slate-500">{u.roomBed}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge variant={u.idProofVerified ? 'success' : 'warning'} size="sm">
                                            {u.idProofVerified ? 'Verified' : 'Pending'}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge variant={u.isBlocked ? 'danger' : 'success'} size="sm" dot>
                                            {u.isBlocked ? 'Blocked' : 'Active'}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button
                                            variant={u.isBlocked ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => dispatch(toggleUserBlock(u.id))}
                                            className="inline-flex items-center gap-1"
                                        >
                                            <Ban className="w-3.5 h-3.5" />
                                            {u.isBlocked ? 'Unblock' : 'Block User'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};