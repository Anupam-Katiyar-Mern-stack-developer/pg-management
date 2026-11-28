// src/pages/super-admin/SuperAdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    Users,
    Building2,
    Headphones,
    Globe,
    Ban,
    CheckCircle2,
    Eye,
    Lock,
} from 'lucide-react';
import { Badge, Button, Card, Input, Modal } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchSuperAdminDataThunk,
    resetSeoSavedFlag,
    resolveAdminTicket,
    saveSeoSettings,
    toggleAdminActive,
    toggleAdminPermission,
    togglePropertyApproval,
    toggleUserBlock,
} from '../../store/slices/superAdminSlice';
import type {
    AdminSupportTicket,
    SiteSeoSettings,
} from '../../services/superAdmin.service';

type SuperTab = 'admins' | 'properties' | 'users' | 'support' | 'seo';

export const SuperAdminDashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { admins, properties, users, supportTickets, seoSettings, loading, seoSaved } =
        useAppSelector((state) => state.superAdmin);

    const [activeTab, setActiveTab] = useState<SuperTab>('admins');
    const [replyTicket, setReplyTicket] = useState<AdminSupportTicket | null>(null);
    const [replyNote, setReplyNote] = useState<string>('');
    const [seoForm, setSeoForm] = useState<SiteSeoSettings | null>(null);

    useEffect(() => {
        dispatch(fetchSuperAdminDataThunk());
    }, [dispatch]);

    useEffect(() => {
        if (seoSettings) setSeoForm(seoSettings);
    }, [seoSettings]);

    const openSupportCount = supportTickets.filter((t) => t.status === 'OPEN').length;

    const handleResolveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!replyTicket || !replyNote.trim()) return;
        dispatch(
            resolveAdminTicket({ ticketId: replyTicket.id, replyNote: replyNote.trim() })
        );
        setReplyTicket(null);
        setReplyNote('');
    };

    const handleSeoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!seoForm) return;
        dispatch(saveSeoSettings(seoForm));
        setTimeout(() => dispatch(resetSeoSavedFlag()), 2500);
    };

    if (loading && admins.length === 0) {
        return (
            <div className="space-y-6">
                <div className="h-9 w-64 bg-slate-200 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    Super Admin Control Center
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Manage PG Admins, permissions, platform SEO, user blocks, and Admin support requests.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">PG Admins</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{admins.length}</p>
                </Card>
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">Total PGs (View Only)</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{properties.length}</p>
                </Card>
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">Registered Tenants</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
                </Card>
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">Open Admin Support</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{openSupportCount}</p>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200 flex gap-5 overflow-x-auto">
                {[
                    { id: 'admins', label: 'PG Admins & Access', icon: ShieldCheck },
                    { id: 'properties', label: 'Hostels & Rooms (View)', icon: Building2 },
                    { id: 'users', label: 'All Tenants (Block)', icon: Users },
                    { id: 'support', label: `Admin Support (${openSupportCount})`, icon: Headphones },
                    { id: 'seo', label: 'Site Settings & SEO', icon: Globe },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as SuperTab)}
                            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${active
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: PG Admins & Permissions */}
            {activeTab === 'admins' && (
                <div className="space-y-4">
                    {admins.map((admin) => (
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

                            {/* Permission Toggles */}
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

            {/* TAB 2: Hostels & Rooms (Read-Only + Approval) */}
            {activeTab === 'properties' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
                        <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                            Read-only view: Super Admin can inspect and approve PGs, while PG Admins manage
                            creating/editing hostels and rooms.
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
                                    {properties.map((prop) => (
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
            )}

            {/* TAB 3: All Tenants (Block / Unblock Only) */}
            {activeTab === 'users' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
                        <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                            Super Admin can inspect tenant records and block/unblock accounts. Creating or
                            editing tenants is handled by PG Admins.
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
                                    {users.map((u) => (
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
            )}

            {/* TAB 4: Admin Support Inbox */}
            {activeTab === 'support' && (
                <div className="space-y-3">
                    {supportTickets.map((ticket) => (
                        <Card key={ticket.id} padding="md" className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">{ticket.id}</span>
                                    <Badge variant="neutral" size="sm">
                                        {ticket.category.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                        by <span className="font-semibold text-slate-700">{ticket.adminName}</span> (
                                        {ticket.pgName})
                                    </span>
                                </div>
                                <Badge variant={ticket.status === 'RESOLVED' ? 'success' : 'warning'} size="sm" dot>
                                    {ticket.status}
                                </Badge>
                            </div>

                            <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                            <p className="text-sm text-slate-600">{ticket.message}</p>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                <span className="text-xs text-slate-400">Raised on {ticket.createdAt}</span>
                                {ticket.status === 'OPEN' ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setReplyTicket(ticket);
                                            setReplyNote('');
                                        }}
                                    >
                                        Resolve & Reply
                                    </Button>
                                ) : (
                                    <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Reply: {ticket.replyNote}
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* TAB 5: Website Settings & SEO */}
            {activeTab === 'seo' && seoForm && (
                <Card padding="lg" className="max-w-3xl">
                    <form onSubmit={handleSeoSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                Website & Search Engine (SEO) Settings
                            </h2>
                            {seoSaved && (
                                <Badge variant="success" size="sm">
                                    Settings Saved!
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Website Name"
                                value={seoForm.siteName}
                                onChange={(e) => setSeoForm({ ...seoForm, siteName: e.target.value })}
                            />
                            <Input
                                label="Support Email"
                                type="email"
                                value={seoForm.supportEmail}
                                onChange={(e) => setSeoForm({ ...seoForm, supportEmail: e.target.value })}
                            />
                        </div>

                        <Input
                            label="Global SEO Meta Title"
                            value={seoForm.seoTitle}
                            onChange={(e) => setSeoForm({ ...seoForm, seoTitle: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Global Meta Description
                            </label>
                            <textarea
                                rows={3}
                                value={seoForm.seoDescription}
                                onChange={(e) =>
                                    setSeoForm({ ...seoForm, seoDescription: e.target.value })
                                }
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <Input
                            label="SEO Keywords (comma separated)"
                            value={seoForm.seoKeywords}
                            onChange={(e) => setSeoForm({ ...seoForm, seoKeywords: e.target.value })}
                        />

                        <label className="flex items-center gap-2.5 pt-2 cursor-pointer text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={seoForm.maintenanceMode}
                                onChange={(e) =>
                                    setSeoForm({ ...seoForm, maintenanceMode: e.target.checked })
                                }
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Enable Maintenance Mode (temporarily pause public bookings)
                        </label>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" variant="primary">
                                Save Settings & SEO
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Resolve Admin Support Modal */}
            <Modal
                isOpen={Boolean(replyTicket)}
                onClose={() => setReplyTicket(null)}
                title={`Resolve Ticket — ${replyTicket?.id ?? ''}`}
            >
                <form onSubmit={handleResolveSubmit} className="space-y-4">
                    <p className="text-sm text-slate-600">{replyTicket?.message}</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Resolution Note for {replyTicket?.adminName}
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Write how the issue was resolved..."
                            value={replyNote}
                            onChange={(e) => setReplyNote(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setReplyTicket(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Mark Resolved
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};