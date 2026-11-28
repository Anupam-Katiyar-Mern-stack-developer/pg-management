// src/pages/admin/AdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    Headphones,
    Plus,
    Trash2,
    Edit3,
    Upload,
    Mail,
    Receipt,
    CheckCircle2,
} from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    Input,
    Modal,
    Select,
    type SelectOption,
} from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    addAdminProperty,
    addAdminTenant,
    deleteAdminProperty,
    deleteAdminTenant,
    fetchAdminDashboardThunk,
    raiseAdminSupportTicket,
    updateAdminTenant,
} from '../../store/slices/adminSlice';
import type {
    AdminPGItem,
    AdminTenantItem,
    AdminToSuperTicket,
} from '../../services/admin.service';

type AdminTab = 'properties' | 'tenants' | 'invoicing' | 'support';

const GENDER_OPTIONS: SelectOption[] = [
    { label: 'Boys', value: 'Boys' },
    { label: 'Girls', value: 'Girls' },
    { label: 'Co-living', value: 'Co-living' },
];

const SUPPORT_CATEGORY_OPTIONS: SelectOption[] = [
    { label: 'Tenant Creation / Mail Issue', value: 'TENANT_CREATION' },
    { label: 'Login / Access Issue', value: 'LOGIN_ISSUE' },
    { label: 'Billing / Plan Upgrade', value: 'BILLING' },
    { label: 'Other', value: 'OTHER' },
];

export const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const { properties, tenants, supportTickets, loading } = useAppSelector(
        (state) => state.admin
    );

    const permissions = user?.permissions ?? {
        allowed_pg_count: 2,
        can_use_invoicing: true,
        can_use_ticketing: false,
        can_use_online_payment: true,
    };

    const [activeTab, setActiveTab] = useState<AdminTab>('properties');

    // Add PG Modal State
    const [pgModalOpen, setPgModalOpen] = useState<boolean>(false);
    const [pgForm, setPgForm] = useState({
        name: '',
        locality: '',
        city: '',
        gender: 'Boys' as AdminPGItem['gender'],
        startingRent: '',
        totalRooms: '',
        vacantBeds: '',
    });

    // Add / Edit Tenant Modal State
    const [tenantModalOpen, setTenantModalOpen] = useState<boolean>(false);
    const [editingTenant, setEditingTenant] = useState<AdminTenantItem | null>(null);
    const [tenantForm, setTenantForm] = useState({
        name: '',
        email: '',
        phone: '',
        pgName: 'Elevate Co-Living & PG',
        roomNumber: '',
        bedLabel: 'Bed A',
        monthlyRent: '',
        moveInDate: new Date().toISOString().split('T')[0],
        idProofName: '',
    });

    // Support to Super Admin Modal State
    const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
    const [supportForm, setSupportForm] = useState({
        category: 'TENANT_CREATION' as AdminToSuperTicket['category'],
        subject: '',
        message: '',
    });

    useEffect(() => {
        dispatch(fetchAdminDashboardThunk());
    }, [dispatch]);

    const pgLimitReached = properties.length >= permissions.allowed_pg_count;

    const handleAddPG = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(
            addAdminProperty({
                name: pgForm.name.trim(),
                locality: pgForm.locality.trim(),
                city: pgForm.city.trim(),
                gender: pgForm.gender,
                startingRent: Number(pgForm.startingRent),
                totalRooms: Number(pgForm.totalRooms),
                vacantBeds: Number(pgForm.vacantBeds),
            })
        );
        setPgModalOpen(false);
        setPgForm({
            name: '',
            locality: '',
            city: '',
            gender: 'Boys',
            startingRent: '',
            totalRooms: '',
            vacantBeds: '',
        });
    };

    const openCreateTenant = () => {
        setEditingTenant(null);
        setTenantForm({
            name: '',
            email: '',
            phone: '',
            pgName: properties[0]?.name || 'Elevate Co-Living & PG',
            roomNumber: '',
            bedLabel: 'Bed A',
            monthlyRent: '',
            moveInDate: new Date().toISOString().split('T')[0],
            idProofName: '',
        });
        setTenantModalOpen(true);
    };

    const openEditTenant = (tenant: AdminTenantItem) => {
        setEditingTenant(tenant);
        setTenantForm({
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            pgName: tenant.pgName,
            roomNumber: tenant.roomNumber,
            bedLabel: tenant.bedLabel,
            monthlyRent: String(tenant.monthlyRent),
            moveInDate: tenant.moveInDate,
            idProofName: tenant.idProofName,
        });
        setTenantModalOpen(true);
    };

    const handleSaveTenant = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingTenant) {
            dispatch(
                updateAdminTenant({
                    ...editingTenant,
                    ...tenantForm,
                    monthlyRent: Number(tenantForm.monthlyRent),
                })
            );
        } else {
            dispatch(
                addAdminTenant({
                    ...tenantForm,
                    monthlyRent: Number(tenantForm.monthlyRent),
                    idProofName: tenantForm.idProofName || 'id_proof_uploaded.pdf',
                })
            );
        }
        setTenantModalOpen(false);
    };

    const handleRaiseSupport = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(
            raiseAdminSupportTicket({
                category: supportForm.category,
                subject: supportForm.subject.trim(),
                message: supportForm.message.trim(),
            })
        );
        setSupportModalOpen(false);
        setSupportForm({ category: 'TENANT_CREATION', subject: '', message: '' });
    };

    if (loading && properties.length === 0) {
        return (
            <div className="space-y-6">
                <div className="h-9 w-64 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">PG Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage your hostels, rooms, tenants, and reach out to Super Admin for help.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSupportModalOpen(true)}
                        className="inline-flex items-center gap-1.5"
                    >
                        <Headphones className="w-4 h-4" />
                        Contact Super Admin
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={openCreateTenant}
                        className="inline-flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Register Tenant
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">My PGs (Limit)</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {properties.length} / {permissions.allowed_pg_count}
                    </p>
                </Card>
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">Active Tenants</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{tenants.length}</p>
                </Card>
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">Vacant Beds</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {properties.reduce((sum, p) => sum + p.vacantBeds, 0)}
                    </p>
                </Card>
                <Card padding="md">
                    <p className="text-xs font-medium text-slate-500">Super Admin Tickets</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{supportTickets.length}</p>
                </Card>
            </div>

            {/* Permission-Aware Tabs */}
            <div className="border-b border-slate-200 flex gap-5 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'properties'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Building2 className="w-4 h-4" />
                    My PGs & Rooms ({properties.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('tenants')}
                    className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'tenants'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Tenants ({tenants.length})
                </button>

                {/* Sirf tab dikhega jab Super Admin ne can_use_invoicing diya ho */}
                {permissions.can_use_invoicing && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('invoicing')}
                        className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'invoicing'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Receipt className="w-4 h-4" />
                        Invoicing
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setActiveTab('support')}
                    className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'support'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Headphones className="w-4 h-4" />
                    Super Admin Support ({supportTickets.length})
                </button>
            </div>

            {/* TAB 1: My PGs & Rooms */}
            {activeTab === 'properties' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            size="sm"
                            disabled={pgLimitReached}
                            onClick={() => setPgModalOpen(true)}
                            className="inline-flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            {pgLimitReached ? 'PG Limit Reached' : 'Add New PG'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {properties.map((pg) => (
                            <Card key={pg.id} padding="md" className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{pg.name}</h3>
                                        <p className="text-xs text-slate-500">
                                            {pg.locality}, {pg.city} • {pg.gender}
                                        </p>
                                    </div>
                                    <Badge variant={pg.isApproved ? 'success' : 'warning'} size="sm" dot>
                                        {pg.isApproved ? 'Live' : 'Pending Approval'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                                    <span>
                                        {pg.totalRooms} Rooms •{' '}
                                        <span className="font-semibold text-emerald-600">
                                            {pg.vacantBeds} Vacant Beds
                                        </span>
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        From ₹{pg.startingRent.toLocaleString('en-IN')}/mo
                                    </span>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => dispatch(deleteAdminProperty(pg.id))}
                                        className="inline-flex items-center gap-1 text-rose-600"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: Tenants (Full CRUD + ID Proof) */}
            {activeTab === 'tenants' && (
                <Card padding="none" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-5 py-3.5">Login ID</th>
                                    <th className="px-5 py-3.5">Tenant</th>
                                    <th className="px-5 py-3.5">Room & Bed</th>
                                    <th className="px-5 py-3.5">Rent</th>
                                    <th className="px-5 py-3.5">ID Proof</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-4 font-mono text-xs font-semibold text-indigo-700">
                                            {t.loginId}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">{t.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {t.email} • {t.phone}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">
                                            Room {t.roomNumber} • {t.bedLabel}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-900">
                                            ₹{t.monthlyRent.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge variant="success" size="sm">
                                                {t.idProofName}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditTenant(t)}
                                                className="inline-flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => dispatch(deleteAdminTenant(t.id))}
                                                className="inline-flex items-center gap-1 text-rose-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* TAB 3: Invoicing (Only visible if Super Admin enabled it) */}
            {activeTab === 'invoicing' && permissions.can_use_invoicing && (
                <Card padding="lg" className="text-center py-12 space-y-3">
                    <Receipt className="w-10 h-10 text-indigo-600 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">
                        Monthly Rent Invoicing Active
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Generate move-in-date anchored rent invoices for all {tenants.length} active
                        tenants in one click.
                    </p>
                    <Button variant="primary" size="sm">
                        Generate This Month&apos;s Invoices
                    </Button>
                </Card>
            )}

            {/* TAB 4: Support to Super Admin */}
            {activeTab === 'support' && (
                <div className="space-y-3">
                    {supportTickets.map((t) => (
                        <Card key={t.id} padding="md" className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">{t.id}</span>
                                    <Badge variant="neutral" size="sm">
                                        {t.category.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <Badge variant={t.status === 'RESOLVED' ? 'success' : 'warning'} size="sm" dot>
                                    {t.status}
                                </Badge>
                            </div>
                            <h3 className="font-semibold text-slate-900">{t.subject}</h3>
                            <p className="text-sm text-slate-600">{t.message}</p>
                            {t.replyNote && (
                                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 pt-2 border-t border-slate-100">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Super Admin Reply: {t.replyNote}
                                </p>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Add PG Modal */}
            <Modal isOpen={pgModalOpen} onClose={() => setPgModalOpen(false)} title="Add New PG">
                <form onSubmit={handleAddPG} className="space-y-4">
                    <Input
                        label="PG Name"
                        required
                        value={pgForm.name}
                        onChange={(e) => setPgForm({ ...pgForm, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Locality"
                            required
                            value={pgForm.locality}
                            onChange={(e) => setPgForm({ ...pgForm, locality: e.target.value })}
                        />
                        <Input
                            label="City"
                            required
                            value={pgForm.city}
                            onChange={(e) => setPgForm({ ...pgForm, city: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Select
                            label="Gender"
                            options={GENDER_OPTIONS}
                            value={pgForm.gender}
                            placeholder=""
                            onChange={(e) =>
                                setPgForm({ ...pgForm, gender: e.target.value as AdminPGItem['gender'] })
                            }
                        />
                        <Input
                            label="Starting Rent (₹)"
                            type="number"
                            required
                            value={pgForm.startingRent}
                            onChange={(e) => setPgForm({ ...pgForm, startingRent: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Total Rooms"
                            type="number"
                            required
                            value={pgForm.totalRooms}
                            onChange={(e) => setPgForm({ ...pgForm, totalRooms: e.target.value })}
                        />
                        <Input
                            label="Vacant Beds"
                            type="number"
                            required
                            value={pgForm.vacantBeds}
                            onChange={(e) => setPgForm({ ...pgForm, vacantBeds: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setPgModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Create PG
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Register / Edit Tenant Modal */}
            <Modal
                isOpen={tenantModalOpen}
                onClose={() => setTenantModalOpen(false)}
                title={editingTenant ? 'Edit Tenant Details' : 'Register New Tenant'}
            >
                <form onSubmit={handleSaveTenant} className="space-y-4">
                    {!editingTenant && (
                        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span>
                                Login ID & credentials will be automatically emailed to the tenant upon
                                registration.
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Full Name"
                            required
                            value={tenantForm.name}
                            onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            required
                            value={tenantForm.phone}
                            onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={tenantForm.email}
                        onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <Input
                            label="Room No."
                            required
                            placeholder="204"
                            value={tenantForm.roomNumber}
                            onChange={(e) => setTenantForm({ ...tenantForm, roomNumber: e.target.value })}
                        />
                        <Input
                            label="Bed Label"
                            required
                            placeholder="Bed A"
                            value={tenantForm.bedLabel}
                            onChange={(e) => setTenantForm({ ...tenantForm, bedLabel: e.target.value })}
                        />
                        <Input
                            label="Rent (₹)"
                            type="number"
                            required
                            value={tenantForm.monthlyRent}
                            onChange={(e) => setTenantForm({ ...tenantForm, monthlyRent: e.target.value })}
                        />
                    </div>

                    {/* ID Proof Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Tenant ID Proof (Aadhaar / PAN / College ID)
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 text-xs text-slate-600">
                            <Upload className="w-4 h-4 text-indigo-600" />
                            <span>
                                {tenantForm.idProofName || 'Click to upload ID proof (PDF / JPG / PNG)'}
                            </span>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setTenantForm({ ...tenantForm, idProofName: file.name });
                                }}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setTenantModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingTenant ? 'Save Changes' : 'Register & Send Login Mail'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Contact Super Admin Modal */}
            <Modal
                isOpen={supportModalOpen}
                onClose={() => setSupportModalOpen(false)}
                title="Contact Super Admin Support"
            >
                <form onSubmit={handleRaiseSupport} className="space-y-4">
                    <Select
                        label="Issue Category"
                        options={SUPPORT_CATEGORY_OPTIONS}
                        value={supportForm.category}
                        placeholder=""
                        onChange={(e) =>
                            setSupportForm({
                                ...supportForm,
                                category: e.target.value as AdminToSuperTicket['category'],
                            })
                        }
                    />
                    <Input
                        label="Subject"
                        required
                        placeholder="e.g., Tenant login mail not delivered"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Message
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Describe the issue clearly..."
                            value={supportForm.message}
                            onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSupportModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Send to Super Admin
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};