// src/pages/super-admin/AllPropertiesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Eye, Search } from 'lucide-react';
import { Badge, Button, Card, Input } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchSuperAdminDataThunk,
    togglePropertyApproval,
} from '../../store/slices/superAdminSlice';

export const AllPropertiesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { properties } = useAppSelector((state) => state.superAdmin);
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        if (properties.length === 0) dispatch(fetchSuperAdminDataThunk());
    }, [dispatch, properties.length]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return properties;
        return properties.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.city.toLowerCase().includes(q) ||
                p.adminName.toLowerCase().includes(q)
        );
    }, [properties, search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                        All Hostels & PGs
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Inspect listed properties and approve them to go live on the marketplace.
                    </p>
                </div>
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search PG, city, or admin..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
                <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                    Read-only view: Super Admin can inspect and approve/revoke PGs. Creating or editing
                    rooms is handled by PG Admins.
                </span>
            </div>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                <th className="px-5 py-3.5">PG Name</th>
                                <th className="px-5 py-3.5">Location</th>
                                <th className="px-5 py-3.5">PG Admin</th>
                                <th className="px-5 py-3.5">Rooms / Vacant</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Approval</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((prop) => (
                                <tr key={prop.id} className="hover:bg-slate-50/60">
                                    <td className="px-5 py-4 font-semibold text-slate-900">{prop.name}</td>
                                    <td className="px-5 py-4 text-slate-600">
                                        {prop.locality}, {prop.city}
                                    </td>
                                    <td className="px-5 py-4 text-slate-700">{prop.adminName}</td>
                                    <td className="px-5 py-4 text-slate-600">
                                        {prop.totalRooms} Rooms • {prop.vacantBeds} Vacant
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge variant={prop.isApproved ? 'success' : 'warning'} size="sm" dot>
                                            {prop.isApproved ? 'Live' : 'Pending'}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button
                                            variant={prop.isApproved ? 'outline' : 'primary'}
                                            size="sm"
                                            onClick={() => dispatch(togglePropertyApproval(prop.id))}
                                        >
                                            {prop.isApproved ? 'Revoke' : 'Approve PG'}
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